import { Context, Service, Session } from "koishi";
import * as graphql from "../../@types/graphql-generated";
import { ItemList, RankInfo } from "./types";
declare module "koishi" {
  interface Tables {
    // 历史遗留：数据库表名为 dt_subscribed_guilds，实际存储 channel 订阅数据
    dt_subscribed_guilds: dt_subscribed_channels;
    dt_subscribed_players: dt_subscribed_players;
    dt_match_extension: dt_match_extension;
  }
}
export interface dt_subscribed_players {
  id: number;
  userId: string;
  channelId: string;
  platform: string;
  steamId: number;
  nickName: string;
  rank: { rank: number; leader: number };
}

export interface dt_subscribed_channels {
  id: number;
  channelId: string;
  platform: string;
}

interface dt_match_extension {
  matchId: string;
  startTime: Date;
  data: MatchExtensionData;
}

export type dt_match_extension_biz = Omit<dt_match_extension, "matchId"> & {
  matchId: number;
};

export interface MatchExtensionData {
  // 索引键
  matchId: number;

  players: {
    steamAccountId: number;
    // 1. 时间敏感快照
    rankSnapshot: RankInfo;

    // 2. 高价值计算结果
    mvpScore: number;
    titles: string[];
    utilityScore: number;

    // 3. 极简状态位 (方便快速筛选，不用解析整个 match 对象)
    laneResult: "stomp" | "stomped" | "tie" | "advantage" | "disadvantage" | "jungle";
    partyId: number;
  }[];
}

// export interface dt_sended_match_id {
//     matchId: number;
//     sendTime: Date;
// }

// export interface dt_previous_query_results {
//     matchId: number;
//     data: object;
//     queryTime: Date;
// }

export class DatabaseService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.database", true);
    // 注册数据库-表（channelId 字段兼容旧数据库中的 guildId 字段）
    ctx.model.extend("dt_subscribed_guilds", { id: "unsigned", channelId: { type: "string", legacy: ["guildId"] }, platform: "string" }, { autoInc: true });
    ctx.model.extend(
      "dt_subscribed_players",
      {
        id: "unsigned",
        userId: "string",
        channelId: { type: "string", legacy: ["guildId"] },
        platform: "string",
        steamId: "integer",
        nickName: "string",
        rank: "json",
      },
      { autoInc: true },
    );
    ctx.model.extend("dt_match_extension", { matchId: "string", startTime: "timestamp", data: "json" }, { autoInc: false, primary: ["matchId"] });
    // 每小时全量刷新所有已订阅频道的成员缓存
    ctx.cron("0 * * * *", async () => {
      await this.refreshAllGuildMemberCaches();
    });
  }

  /** 群成员列表内存缓存： Map<"platform:channelId", Set<userId>> */
  private guildMemberCache = new Map<string, Set<string>>();

  /**
   * 刷新指定频道的群成员缓存。
   * 通过 channel 表获取 assignee（bot selfId），再调用 bot.getGuildMemberList。
   * 失败时记录 warn 并清除该 key（保守策略）。
   */
  private async refreshGuildMemberCache(platform: string, channelId: string): Promise<void> {
    const cacheKey = `${platform}:${channelId}`;
    try {
      const channelRow = (await this.ctx.database.get("channel", { id: channelId })).at(0);
      const selfId = channelRow?.assignee;
      // channel 表中有货真价实的 guildId（区别于 channelId，某些平台两者不同）
      const guildId = channelRow?.guildId ?? channelId;
      if (!selfId) {
        this.guildMemberCache.delete(cacheKey);
        return;
      }
      const bot = this.ctx.bots[`${platform}:${selfId}`];
      if (!bot) {
        this.guildMemberCache.delete(cacheKey);
        return;
      }
      const members = await bot.getGuildMemberList(guildId);
      const userIds = new Set(members.data.map((m) => m.user.id));
      this.guildMemberCache.set(cacheKey, userIds);
    } catch (error) {
      this.logger.warn(`获取频道 ${cacheKey} 成员列表失败，已清除对应缓存：` + error);
      this.guildMemberCache.delete(cacheKey);
    }
  }

  /** 全量刷新所有已订阅频道的群成员缓存（每小时 cron 调用） */
  private async refreshAllGuildMemberCaches(): Promise<void> {
    const subscribedChannels = await this.ctx.database.get("dt_subscribed_guilds", undefined);
    await Promise.allSettled(subscribedChannels.map((ch) => this.refreshGuildMemberCache(ch.platform, ch.channelId)));
  }

  /**
   * 判断玩家是否仍在群组中。
   * 缓存未命中（冷启动阶段）时保守放行，返回 true。
   */
  isPlayerInGuild(platform: string, channelId: string, userId: string): boolean {
    const cached = this.guildMemberCache.get(`${platform}:${channelId}`);
    if (!cached) return true; // 缓存尚未建立，冷启动保守放行
    return cached.has(userId);
  }

  /** 删除指定频道的群成员缓存（取消订阅时内部调用） */
  private deleteGuildMemberCache(platform: string, channelId: string): void {
    this.guildMemberCache.delete(`${platform}:${channelId}`);
  }

  /** 从缓存中移除单个用户（取消绑定时内部调用，保留频道内其他成员的缓存）*/
  private removeUserFromGuildMemberCache(platform: string, channelId: string, userId: string): void {
    const cached = this.guildMemberCache.get(`${platform}:${channelId}`);
    if (cached) cached.delete(userId);
  }
  async insertMatchExtension(matchId: number, startTime: Date, data: MatchExtensionData) {
    return this.ctx.database.upsert("dt_match_extension", [{ matchId: String(matchId), startTime, data }]);
  }

  async getMatchExtension(matchIds: number[]) {
    const rows = await this.ctx.database.get("dt_match_extension", {
      matchId: matchIds.map((id) => String(id)),
    });

    return rows.map((row) => ({
      ...row,
      matchId: Number(row.matchId),
    }));
  }

  async setPlayerRank(playerId: number, rank: { rank: number; leader: number }) {
    return this.ctx.database.set("dt_subscribed_players", playerId, { rank });
  }

  async getActiveSubscribedPlayers(): Promise<dt_subscribed_players[]> {
    const subscribedChannels = await this.ctx.database.get("dt_subscribed_guilds", undefined);
    return (await this.ctx.database.get("dt_subscribed_players", undefined))
      .filter((player) => subscribedChannels.some((ch) => ch.channelId == player.channelId))
      .filter((player) => this.isPlayerInGuild(player.platform, player.channelId, player.userId));
  }

  async isUserBinded(session: Session) {
    const subscribedPlayer: dt_subscribed_players[] = await this.ctx.database.get("dt_subscribed_players", this.getUserQuery(session));
    return subscribedPlayer.length > 0;
  }

  async getBindedUser(session: Session): Promise<dt_subscribed_players | null> {
    const subscribedPlayer: dt_subscribed_players[] = await this.ctx.database.get("dt_subscribed_players", this.getUserQuery(session));
    return subscribedPlayer.length > 0 ? subscribedPlayer[0] : null;
  }

  async bindUser(session: Session, steamId: number | string, nickName?: string) {
    const result = await this.ctx.database.create("dt_subscribed_players", {
      ...this.getUserQuery(session),
      steamId: Number(steamId),
      nickName: nickName || "",
    });
    // 立即刷新该频道的成员缓存，确保新绑定玩家不会因缓存过期而漏过比赛
    this.refreshGuildMemberCache(session.event.platform, session.event.channel.id);
    return result;
  }

  async unbindUser(session: Session) {
    // 从缓存移除该用户（保留频道内其他成员的缓存）
    this.removeUserFromGuildMemberCache(session.event.platform, session.event.channel.id, session.event.user.id);
    return this.ctx.database.remove("dt_subscribed_players", this.getUserQuery(session));
  }

  async renamePlayer(playerId: number, nickName: string) {
    return this.ctx.database.set("dt_subscribed_players", playerId, { nickName });
  }

  async isChannelSubscribed(session: Session): Promise<boolean> {
    const subscribedChannels: dt_subscribed_channels[] = await this.ctx.database.get("dt_subscribed_guilds", this.getChannelQuery(session));
    return subscribedChannels.length > 0;
  }

  async subscribeChannel(session: Session): Promise<dt_subscribed_channels> {
    const result = await this.ctx.database.create("dt_subscribed_guilds", this.getChannelQuery(session));
    // 新订阅立即建立该频道的成员缓存
    this.refreshGuildMemberCache(session.event.platform, session.event.channel.id);
    return result;
  }

  async unSubscribeChannel(session: Session) {
    // 取消订阅时清除对应频道的缓存
    this.deleteGuildMemberCache(session.event.platform, session.event.channel.id);
    return this.ctx.database.remove("dt_subscribed_guilds", this.getChannelQuery(session));
  }

  async getSubscribedMembersInChannel(session: Session): Promise<dt_subscribed_players[]> {
    return this.ctx.database.get("dt_subscribed_players", this.getChannelQuery(session));
  }
  /**
   * [辅助方法] 根据 session 生成频道查询条件
   */
  private getChannelQuery(session: Session) {
    return {
      channelId: session.event.channel.id,
      platform: session.event.platform,
    };
  }

  private getUserQuery(session: Session) {
    return {
      channelId: session.event.channel.id,
      platform: session.event.platform,
      userId: session.event.user.id,
    };
  }

  /** 从已订阅玩家中查找玩家返回SteamId，不需要以昵称匹配时仅需传入Session */
  async getSubscribedPlayerByNickNameOrSession(session: Session, nickName?: string): Promise<dt_subscribed_players | undefined> {
    const player: dt_subscribed_players = (
      await this.ctx.database.get("dt_subscribed_players", {
        channelId: session.event.channel.id,
        platform: session.event.platform,
        ...(nickName ? { nickName } : { userId: session.event.user.id }),
      })
    )?.[0];
    return player;
  }

  getChannelInfo({ platform, channelId }: dt_subscribed_channels | dt_subscribed_players) {
    return `${platform}:${channelId}`;
  }
}
