import { Context, Service, Session } from "koishi";
import * as graphql from "../../@types/graphql-generated";
import { ItemList, RankInfo } from "./types";
declare module "koishi" {
  interface Tables {
    dt_subscribed_guilds: dt_subscribed_guilds;
    dt_subscribed_players: dt_subscribed_players;
    dt_match_extension: dt_match_extension;
  }
}
export interface dt_subscribed_players {
  id: number;
  userId: string;
  guildId: string;
  platform: string;
  steamId: number;
  nickName: string;
  rank: { rank: number; leader: number };
}

export interface dt_subscribed_guilds {
  id: number;
  guildId: string;
  platform: string;
}

export interface dt_match_extension {
  matchId: number;
  startTime: Date;
  data: MatchExtensionData;
}

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
    // 注册数据库-表
    ctx.model.extend("dt_subscribed_guilds", { id: "unsigned", guildId: "string", platform: "string" }, { autoInc: true });
    ctx.model.extend(
      "dt_subscribed_players",
      {
        id: "unsigned",
        userId: "string",
        guildId: "string",
        platform: "string",
        steamId: "integer",
        nickName: "string",
        rank: "json",
      },
      { autoInc: true },
    );
    ctx.model.extend("dt_match_extension", { matchId: "unsigned", startTime: "timestamp", data: "json" }, { autoInc: false, primary: ["matchId"] });
  }
  async insertMatchExtension(matchId: number, startTime: Date, data: MatchExtensionData) {
    return this.ctx.database.upsert("dt_match_extension", [{ matchId, startTime, data }]);
  }

  async getMatchExtension(matchIds: number[]) {
    return this.ctx.database.get("dt_match_extension", { matchId: matchIds });
  }

  async setPlayerRank(playerId: number, rank: { rank: number; leader: number }) {
    return this.ctx.database.set("dt_subscribed_players", playerId, { rank });
  }

  async getActiveSubscribedPlayers(): Promise<dt_subscribed_players[]> {
    const subscribedGuilds = await this.ctx.database.get("dt_subscribed_guilds", undefined);
    const subscribedPlayersInGuild = (await this.ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedGuilds.some((guild) => guild.guildId == player.guildId));
    return subscribedPlayersInGuild;
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

  async isChannelSubscribed(session: Session): Promise<boolean> {
    const subscribedChannels: dt_subscribed_guilds[] = await this.ctx.database.get("dt_subscribed_guilds", this.getChannelQuery(session));
    return subscribedChannels.length > 0;
  }

  async subscribeChannel(session: Session): Promise<dt_subscribed_guilds> {
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
      guildId: session.event.channel.id,
      platform: session.event.platform,
    };
  }

  private getUserQuery(session: Session) {
    return {
      guildId: session.event.channel.id,
      platform: session.event.platform,
      userId: session.event.user.id,
    };
  }

  /** 从已订阅玩家中查找玩家返回SteamId，不需要以昵称匹配时仅需传入Session */
  async getSubscribedPlayerByNickNameOrSession(session: Session, nickName?: string): Promise<dt_subscribed_players | undefined> {
    const player: dt_subscribed_players = (
      await this.ctx.database.get("dt_subscribed_players", {
        guildId: session.event.channel.id,
        platform: session.event.platform,
        ...(nickName ? { nickName } : { userId: session.event.user.id }),
      })
    )?.[0];
    return player;
  }

  getChannelInfo({ platform, guildId }: dt_subscribed_guilds | dt_subscribed_players) {
    return `${platform}:${guildId}`;
  }
}
