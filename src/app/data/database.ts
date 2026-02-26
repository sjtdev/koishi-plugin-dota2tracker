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
    const subscribedPlayersInChannel = (await this.ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedChannels.some((ch) => ch.channelId == player.channelId));
    return subscribedPlayersInChannel;
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
    return this.ctx.database.create("dt_subscribed_players", {
      ...this.getUserQuery(session),
      steamId: Number(steamId),
      nickName: nickName || "",
    });
  }

  async unbindUser(session: Session) {
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
    return this.ctx.database.create("dt_subscribed_guilds", this.getChannelQuery(session));
  }

  async unSubscribeChannel(session: Session) {
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
