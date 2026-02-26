import { Context, Service } from "koishi";
import { Config } from "../../config";
import { PendingMatchSubscriber, PlayerContext } from "./parse-polling.task";
import { dt_subscribed_players } from "../data/database";
import * as graphql from "../../@types/graphql-generated";
import { TemplateType } from "../common/types";
import { handleError } from "../common/error";
import { DateTime } from "luxon";

export class MatchWatcherTask extends Service<Config> {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.match-watcher", true);
    this.config = ctx.config;
  }
  async discovery() {
    try {
      const activePlayers = await this.ctx.dota2tracker.database.getActiveSubscribedPlayers();
      if (activePlayers.length === 0) return;
      const uniqueSteamIds = activePlayers.map((player) => player.steamId).filter((steamId, index, self) => self.indexOf(steamId) === index);
      const playersData = (await this.ctx.dota2tracker.stratzAPI.queryPlayersLastMatchRankInfo({ steamAccountIds: uniqueSteamIds })).players;
      await this.discoverNewMatches(playersData, activePlayers);
      if (this.config.rankBroadSwitch) await this.detectRankChanges(playersData, activePlayers);
    } catch (error) {
      handleError(error, this.logger, this.ctx.dota2tracker.i18n, this.ctx.config);
    }
  }

  private async discoverNewMatches(playersData: graphql.PlayersLastmatchRankinfoQuery["players"], activePlayers: dt_subscribed_players[]) {
    const sendedMatchIds = await this.ctx.dota2tracker.cache.getSendedMatchIds();
    const lastMatches = playersData
      .map((player) => player.matches[0])
      .filter((match) => match && match.id)
      .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)) // 根据match.id去重
      .filter((match) => DateTime.fromSeconds(match.startDateTime) > DateTime.now().minus({ days: 1 })) // 排除1天以前的比赛，防止弃坑数年群友绑定时突然翻出上古战报
      .filter((match) => !this.ctx.dota2tracker.parsePolling.isPending(match.id)) // 判断是否已加入待发布列表
      .filter((match) => !sendedMatchIds.has(match.id)); // 过滤掉已经发布过的比赛
    for (const match of lastMatches) {
      // 1. 找出这场比赛里，有哪些是我们关心的“活跃玩家”
      const steamIdsInMatch = new Set(match.players.map((p) => p.steamAccount.id));
      const relevantActivePlayers = activePlayers.filter((p) => steamIdsInMatch.has(p.steamId));

      // 如果这场比赛里没有任何我们订阅的玩家，就直接跳过，处理下一场
      if (!relevantActivePlayers.length) {
        continue;
      }

      // 2. 将这些玩家【按他们所在的频道】进行分组
      const playersByGuild = new Map<string, { guildInfo: { platform: string; channelId: string }; players: PlayerContext[] }>();
      for (const player of relevantActivePlayers) {
        const guildKey = `${player.platform}:${player.channelId}`;
        if (!playersByGuild.has(guildKey)) {
          playersByGuild.set(guildKey, {
            guildInfo: { platform: player.platform, channelId: player.channelId },
            players: [],
          });
        }
        playersByGuild.get(guildKey).players.push({
          steamId: player.steamId,
          nickname: player.nickName,
        });
      }

      const messageToLogger: { platform: string; guildId: string; players: PlayerContext[] }[] = [];

      // 3. 为每个群组创建对应的 Subscriber 对象
      const subscribers: PendingMatchSubscriber[] = [];
      for (const [key, { guildInfo, players }] of playersByGuild.entries()) {
        const languageTag = await this.ctx.dota2tracker.i18n.getLanguageTag({ channelId: guildInfo.channelId });

        const subscriber = this.ctx.dota2tracker.parsePolling.createSubscriberByAutomatic({
          type: "GUILD",
          ...guildInfo,
          languageTag: languageTag,
          relevantPlayers: players,
        });

        messageToLogger.push({
          platform: guildInfo.platform,
          guildId: guildInfo.channelId,
          players,
        });

        subscribers.push(subscriber);
      }

      // 4. 如果确实生成了有效的订阅者，就调用 add
      if (subscribers.length > 0) {
        this.ctx.dota2tracker.parsePolling.add(match.id, subscribers);
        this.logger.info(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.match_tracked", { messageToLogger, match }));
      }
    }
  }

  private async detectRankChanges(playersData: graphql.PlayersLastmatchRankinfoQuery["players"], activePlayers: dt_subscribed_players[]) {
    // 创建最新的 steamId -> rank 的 Map
    const rankMap = new Map<number, { rank: number; leader: number }>();
    for (const player of playersData) {
      rankMap.set(player.steamAccount.id, {
        rank: player.steamAccount.seasonRank,
        leader: player.steamAccount.seasonLeaderboardRank,
      });
    }

    // 遍历已绑定玩家列表，判断段位是否变动
    for (let subPlayer of activePlayers) {
      if (subPlayer.rank.rank !== rankMap.get(subPlayer.steamId)?.rank || subPlayer.rank.leader !== rankMap.get(subPlayer.steamId)?.leader) {
        // 此条判断语句为旧版本dotatracker准备，旧版升到新版后subPlayer.rank为空对象，此时为第一次绑定段位信息，所以不进行播报
        if (Object.keys(subPlayer.rank).length != 0) {
          const ranks = ["prevRank", "currRank"].reduce((acc, key) => {
            const source = key === "prevRank" ? subPlayer.rank : rankMap.get(subPlayer.steamId);
            acc[key] = {
              medal: parseInt(source.rank?.toString().split("")[0] ?? "0"),
              star: parseInt(source.rank?.toString().split("")[1] ?? "0"),
              leader: source.leader,
              inTop100: source.leader ? (source.leader <= 10 ? "8c" : source.leader <= 100 ? "8b" : undefined) : undefined,
            };
            return acc;
          }, {});
          const prevRank = ranks["prevRank"];
          const currRank = ranks["currRank"];
          if (prevRank.medal !== currRank.medal || (prevRank.star !== currRank.star && this.config.rankBroadStar) || (prevRank.leader !== currRank.leader && this.config.rankBroadLeader)) {
            let guildMember;
            try {
              // 被封禁/退出的群会抛出异常，此处捕获以避免中断整个段位变动检测循环
              guildMember = await this.ctx.bots.find((bot) => bot.platform == subPlayer.platform)?.getGuildMember?.(subPlayer.channelId, subPlayer.userId);
            } catch (error) {
              this.logger.warn(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.fetch_guilds_failed") + error);
            }
            const name = subPlayer.nickName ?? guildMember?.nick ?? playersData.find((player) => player.steamAccount.id == subPlayer.steamId)?.steamAccount.name ?? String(subPlayer.steamId);
            const languageTag = await this.ctx.dota2tracker.i18n.getLanguageTag({ channelId: subPlayer.channelId });
            if (this.config.rankBroadFun === true) {
              // 整活播报
              const img = await this.ctx.dota2tracker.view.renderToImageByFile(
                {
                  name,
                  avatar: guildMember?.avatar ?? playersData.find((player) => subPlayer.steamId == player.steamAccount.id).steamAccount.avatar,
                  isRising:
                    rankMap.get(subPlayer.steamId).rank > subPlayer.rank.rank ||
                    (rankMap.get(subPlayer.steamId).rank == subPlayer.rank.rank && rankMap.get(subPlayer.steamId).leader < subPlayer.rank.leader) ||
                    (rankMap.get(subPlayer.steamId).leader > 0 && subPlayer.rank.leader == null),
                  prevRank,
                  currRank,
                  date: DateTime.now().toFormat(languageTag === "zh-CN" ? "yyyy/MM/dd HH时mm分" : "yyyy/MM/dd HH:mm"),
                },
                "rank_fun",
                TemplateType.Rank,
                languageTag,
              );
              await this.ctx.broadcast([`${subPlayer.platform}:${subPlayer.channelId}`], img);
            } else {
              // 常规播报
              // const message = `群友 ${name} 段位变动：${$t(languageTag, "dota2tracker.template.ranks." + prevRank.medal)}${prevRank.star} → ${$t(languageTag, "dota2tracker.template.ranks." + currRank.medal)}${currRank.star} `;
              const message = this.ctx.dota2tracker.messageBuilder.buildRankChangedMessage(languageTag, name, prevRank, currRank);
              await this.ctx.broadcast([`${subPlayer.platform}:${subPlayer.channelId}`], message);
            }
            // 更新玩家的数据记录
            this.ctx.dota2tracker.database.setPlayerRank(subPlayer.id, rankMap.get(subPlayer.steamId));
            this.logger.info(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.rank_sent", { platform: subPlayer.platform, guildId: subPlayer.channelId, player: { nickName: subPlayer.nickName, steamId: subPlayer.steamId } }));
          }
        } else {
          this.ctx.dota2tracker.database.setPlayerRank(subPlayer.id, rankMap.get(subPlayer.steamId));
        }
      }
    }
  }
}
