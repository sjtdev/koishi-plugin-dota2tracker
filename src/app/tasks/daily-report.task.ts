import { Context, Service } from "koishi";
import { Config } from "../../config";
import { roundToDecimalPlaces } from "../common/utils";
import * as graphql from "../../@types/graphql-generated";
import { TemplateType } from "../common/types";
import { handleError } from "../common/error";
import { DateTime } from "luxon";

export class DailyReportTask extends Service<Config> {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.daily-report-task", true);
    this.config = ctx.config;

    if (this.config.dailyReportSwitch) {
      ctx.cron(`0 ${this.config.dailyReportHours} * * *`, async () => {
        await this.runDailyJob();
      });
    }
    if (this.config.weeklyReportSwitch) {
      ctx.cron(`0 ${this.config.weeklyReportDayHours[1]} * * ${this.config.weeklyReportDayHours[0]}`, async () => {
        await this.runWeeklyJob();
      });
    }
  }

  private async runDailyJob() {
    // Step 1: 调用 dailyReportService 获取{频道: 数据}[]
    const bundles = await this.ctx.dota2tracker.dailyReport.generateDailyReportBundles();
    // Step 2: 遍历每个对象，调用 view 渲染图片并发送到对应频道
    for (const bundle of bundles) {
      const image = await this.ctx.dota2tracker.view.renderToImageByFile(bundle.report, "daily", TemplateType.Report, await this.ctx.dota2tracker.i18n.getLanguageTag({ channelId: bundle.channelId }));
      await this.ctx.broadcast([`${bundle.platform}:${bundle.channelId}`], image);
    }
  }

  private async runWeeklyJob() {
    try {
      const oneWeekAgo = Math.floor(DateTime.now().minus({ weeks: 1 }).toSeconds());
      await this.report_legacy(oneWeekAgo, "dota2tracker.template.last_weeks_summary", this.config.weeklyReportShowCombi);
    } catch (error) {
      handleError(error, this.logger, this.ctx.dota2tracker.i18n, this.config);
    }
  }

  private async report_legacy(timeAgo, titleKey, showCombi) {
    // 获取所有订阅的频道信息
    const subscribedChannels = await this.ctx.database.get("dt_subscribed_guilds", undefined);
    // 获取订阅的玩家，并筛选出那些属于已订阅频道的玩家
    const subscribedPlayersInChannel: any[] = (await this.ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedChannels.some((ch) => ch.channelId == player.channelId));
    const steamIds = subscribedPlayersInChannel.map((player) => player.steamId).filter((value, index, self) => self.indexOf(value) === index);

    // 使用工具函数查询比赛数据，将结果中的玩家信息过滤出参与过至少一场比赛的玩家
    const players = (await this.ctx.dota2tracker.stratzAPI.queryPlayersMatchesForDaily_legacy(steamIds, timeAgo)).players.filter((player) => player.matches?.length > 0);
    // 对比赛信息去重处理，确保每场比赛唯一
    const matches = players
      .map((player) => player.matches.map((match) => match))
      .flat()
      .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
    // 遍历每位订阅玩家，计算相关统计信息并更新
    for (let subPlayer of subscribedPlayersInChannel) {
      let player: NonNullable<graphql.PlayersMatchesForDailyQuery["players"]>[number] & {
        name?: string;
        winCount?: number;
        loseCount?: number;
        avgKills?: number;
        avgDeaths?: number;
        avgAssists?: number;
        avgKDA?: number;
        avgImp?: number;
      } = players.find((player) => subPlayer.steamId == player.steamAccount.id);
      if (!player) continue;
      let guildMember;
      try {
        // 尝试获取群组成员信息
        guildMember = await this.ctx.bots.find((bot) => bot.platform == subPlayer.platform)?.getGuildMember(subPlayer.guildId, subPlayer.userId);
      } catch (error) {
        // 记录错误日志
        this.logger.warn(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.fetch_guilds_failed") + error);
      }
      // 设置玩家名称，优先使用昵称，其次是公会昵称或Steam账号名称
      player.name = subPlayer.nickName || (guildMember?.nick ?? players.find((player) => player.steamAccount.id == subPlayer.steamId)?.steamAccount.name);

      // 计算玩家的胜场、败场、平均击杀、死亡、助攻等统计信息
      player.winCount = player.matches.filter((match) => match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).isRadiant).length;
      player.loseCount = player.matches.length - player.winCount;
      player.avgKills = roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).kills, 0) / player.matches.length, 2);
      player.avgDeaths = roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).deaths, 0) / player.matches.length, 2);
      player.avgAssists = roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).assists, 0) / player.matches.length, 2);
      player.avgKDA = roundToDecimalPlaces((player.avgKills + player.avgAssists) / (player.avgDeaths || 1), 2);
      player.avgImp = roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).imp, 0) / player.matches.length, 0);

      // 更新订阅玩家对象
      subPlayer = Object.assign(subPlayer, player);
    }

    // 处理每个已订阅频道的玩家组合和比赛结果
    for (let channel of subscribedChannels) {
      const currentsubscribedPlayers = subscribedPlayersInChannel.filter((player) => player.platform == channel.platform && player.channelId == channel.channelId && player.matches?.length);
      if (currentsubscribedPlayers.length) {
        const currentsubscribedPlayersIds = currentsubscribedPlayers.map((player) => player.steamId);
        const combinationsMap = new Map();

        // 遍历每场比赛，计算参与的玩家组合及其胜负统计
        matches.forEach((match) => {
          const sortedPlayerIds = match.players
            .map((player) => player.steamAccount.id)
            .filter((id) => currentsubscribedPlayersIds.includes(id))
            .sort((a, b) => a - b);
          const key = sortedPlayerIds.join(",");

          if (!combinationsMap.has(key)) {
            const players = currentsubscribedPlayers.filter((subPlayer) => sortedPlayerIds.includes(subPlayer.steamId));
            if (players.length > 0) {
              const name = players.map((subPlayer) => subPlayer.name).join("/");
              combinationsMap.set(key, {
                players,
                name,
                winCount: match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == players[0].steamId).isRadiant ? 1 : 0,
                matches: [match],
              });
            }
          } else {
            const combi = combinationsMap.get(key);
            combi.matches.push(match);
            combi.winCount += match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == combi.players[0].steamId).isRadiant ? 1 : 0;
          }
        });
        const combinations = Array.from(combinationsMap.values());
        try {
          const languageTag = await this.ctx.dota2tracker.i18n.getLanguageTag({ channelId: channel.channelId });
          await this.ctx.broadcast(
            [`${channel.platform}:${channel.channelId}`],
            await this.ctx.dota2tracker.view.renderToImageByFile(
              {
                title: this.ctx.dota2tracker.i18n.$t(languageTag, titleKey),
                players: currentsubscribedPlayers.sort((a, b) => {
                  if (a.matches.length > b.matches.length) return -1;
                  else if (a.matches.length < b.matches.length) return 1;
                  else return a.steamAccount.id - b.steamAccount.id;
                }),
                combinations,
                showCombi,
              },
              "daily_legacy",
              TemplateType.Report,
              languageTag,
            ),
          );
          // 记录日志
          this.logger.info(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.report_sent", { title: this.ctx.dota2tracker.i18n.$t(languageTag, titleKey), guildId: channel.channelId, platform: channel.platform }));
        } catch (error) {
          // 错误处理
          this.logger.error(error);
        }
      }
    }
  }
}
