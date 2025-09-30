import { Context, Service, Session } from "koishi";
import { Config } from "../../config";
import { TemplateType } from "../common/types";
import { DateTime } from "luxon";
import { handleError } from "../common/error";

interface PendingMatchEntry {
  /** 比赛 ID */
  matchId: number;

  /** 第一次被请求的时间，用于计算超时 */
  requestTime: Date;

  /**
   * 订阅者列表。
   * 记录了所有正在等待这场比赛结果的目的地。
   * 这是新设计的核心，解决了所有旧结构的问题。
   */
  subscribers: PendingMatchSubscriber[];
}
export interface PlayerContext {
  steamId: number;
  nickname?: string;
}
interface BaseSubscriber {
  languageTag: string;
  relevantPlayers: PlayerContext[];
}

export type PendingMatchSubscriber = BaseSubscriber &
  (
    | {
        /** 场景：响应一个用户的指令 */
        source: "COMMAND";
        type: "CHANNEL" | "PRIVATE";
        platform: string;
        selfId: string; // 响应时，需要明确知道是哪个 bot 来回复
        userId: string; // 响应时，需要知道是哪个用户触发的
        channelId: string; // 响应时，需要知道在哪个频道回复
        guildId: string;
        templateName?: string;
      }
    | {
        /** 场景：由后台任务主动广播 */
        source: "AUTOMATIC";
        type: "CHANNEL";
        platform: string;
        channelId: string;
        guildId: string;
      }
  );

export class ParsePollingTask extends Service<Config> {
  private pendingMatches: Map<number, PendingMatchEntry> = new Map();
  private pollingIndex: number = 0;
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.parse-polling", true);
    this.config = ctx.config;
  }

  createSubscriberByCommand(session: Session, languageTag: string, options?: { templateName: string }): PendingMatchSubscriber {
    return {
      languageTag,
      relevantPlayers: [],
      source: "COMMAND",
      type: session.isDirect ? "PRIVATE" : "CHANNEL",
      platform: session.platform,
      selfId: session.selfId,
      userId: session.userId,
      channelId: session.channelId,
      guildId: session.guildId,
      templateName: options?.templateName,
    };
  }

  createSubscriberByAutomatic(target: { type: "GUILD"; platform: string; channelId: string; guildId: string; languageTag: string; relevantPlayers: PlayerContext[] }): PendingMatchSubscriber {
    return {
      languageTag: target.languageTag,
      relevantPlayers: target.relevantPlayers,
      source: "AUTOMATIC",
      type: "CHANNEL",
      platform: target.platform,
      channelId: target.channelId,
      guildId: target.guildId,
    };
  }

  public add(matchId: number, subscribers: PendingMatchSubscriber[]): void {
    const isNewEntry = !this.pendingMatches.has(matchId);
    const entry = this.pendingMatches.get(matchId) || { matchId, requestTime: new Date(), subscribers: [] };

    entry.subscribers.push(...subscribers);
    this.pendingMatches.set(matchId, entry);

    if (isNewEntry) {
      this.ctx.dota2tracker.stratzAPI.requestParseMatch(matchId).then((value) => this.logger.info(this.ctx.dota2tracker.i18n.gt(`dota2tracker.logger.parse_request_${value ? "sent" : "failed"}`, { matchId })));
    }
  }

  async polling(): Promise<void> {
    try {
      // 无比赛待处理
      if (this.pendingMatches.size === 0) return;
      // 转换为数组
      const matches = Array.from(this.pendingMatches.values());
      // 轮询指针越界处理
      if (this.pollingIndex >= matches.length) this.pollingIndex = 0;
      // 获取待处理比赛
      const pendingMatch = matches[this.pollingIndex];
      this.pollingIndex++;
      // 是否仍需等待
      const requestTime = DateTime.fromJSDate(pendingMatch.requestTime);
      const timeout = requestTime.plus({ minutes: this.config.dataParsingTimeoutMinutes });
      const needToWait = DateTime.now() < timeout;
      // 得到比赛状态
      const result = await this.ctx.dota2tracker.match.getMatchResult({ matchId: pendingMatch.matchId, requestParse: needToWait });
      // 是否仍然处于等待中
      if (result.status === "PENDING") {
        // logger
        const waitingTime = DateTime.now().diff(requestTime, "minutes");
        const waitingTimeMinutes = Math.floor(waitingTime.minutes);
        if (waitingTimeMinutes > 0 && waitingTimeMinutes % 5 === 0) {
          this.logger.info(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.waiting_for_parse", { matchId: pendingMatch.matchId, time: waitingTimeMinutes }));
        }
        return;
      }
      if (result.status === "READY") {
        // 将订阅按语言进行分组，以便后续按语言生成战报图片
        const subscribersByLang = new Map<string, PendingMatchSubscriber[]>();
        for (const subscriber of pendingMatch.subscribers) {
          if (!subscribersByLang.has(subscriber.languageTag)) subscribersByLang.set(subscriber.languageTag, []);
          subscribersByLang.get(subscriber.languageTag).push(subscriber);
        }
        const guildsToLogger: { platform: string; guildId: string; languageTag: string }[] = [];
        // 按语言处理战报
        for (const [languageTag, subscribers] of subscribersByLang) {
          // 格式化比赛数据
          const formattedMatchData = await this.ctx.dota2tracker.match.generateMatchData(result.matchData, languageTag);
          // A. 找出所有需要使用【默认模板】的订阅者
          const defaultTemplateSubscribers = subscribers.filter((s) => s.source === "AUTOMATIC" || (s.source === "COMMAND" && !s.templateName));
          // B. 找出所有需要使用【自定义模板】的订阅者
          const customTemplateSubscribers = subscribers.filter((s) => s.source === "COMMAND" && s.templateName);

          // C. 高效处理默认模板
          if (defaultTemplateSubscribers.length > 0) {
            const defaultImage = await this.ctx.dota2tracker.image.renderToImageByFile(formattedMatchData, this.config.template_match, TemplateType.Match, languageTag);
            for (const sub of defaultTemplateSubscribers) {
              const message = this.ctx.dota2tracker.messageBuilder.buildMatchMessage(languageTag, formattedMatchData, sub.relevantPlayers);
              await this.broadcastMessage(sub, message + defaultImage);
              // 记录日志所需信息
              guildsToLogger.push({ platform: sub.platform, guildId: sub.channelId, languageTag });
            }
          }

          // D. 逐一处理自定义模板
          for (const sub of customTemplateSubscribers) {
            const image = await this.ctx.dota2tracker.image.renderToImageByFile(formattedMatchData, sub.source === "COMMAND" ? sub.templateName : this.config.template_match, TemplateType.Match, languageTag);
            const message = this.ctx.dota2tracker.messageBuilder.buildMatchMessage(languageTag, formattedMatchData, sub.relevantPlayers);
            await this.broadcastMessage(sub, message + image);
            // 记录日志所需信息
            guildsToLogger.push({ platform: sub.platform, guildId: sub.channelId, languageTag });
          }
        }
        this.logger.info(
          this.ctx.dota2tracker.i18n.gt(`dota2tracker.logger.match_${result.matchData.match.parsedDateTime ? "parsed" : "unparsed"}`, {
            matchId: result.matchData.match.id,
            timeout: this.config.dataParsingTimeoutMinutes,
            guilds: guildsToLogger,
          }),
        );
        // 在缓存中标记该比赛已发送
        this.ctx.dota2tracker.cache.markMatchAsSended(pendingMatch.matchId);
        this.pendingMatches.delete(pendingMatch.matchId);
      }
    } catch (error) {
      handleError(error, this.logger, this.ctx.dota2tracker.i18n, this.ctx.config);
    }
  }

  private async broadcastMessage(subscriber: PendingMatchSubscriber, message: string): Promise<boolean> {
    if (subscriber.type === "PRIVATE") {
      try {
        const bot = this.ctx.bots[`${subscriber.platform}:${subscriber.selfId}`];
        if (!bot) return false;
        await bot.sendPrivateMessage(subscriber.userId, message);
      } catch (error) {
        this.logger.error(error);
        return false;
      }
      return true;
    }
    const messageIds = await this.ctx.broadcast([`${subscriber.platform}:${subscriber.channelId}`], message);
    return messageIds.length > 0;
  }

  public isPending(matchId: number): boolean {
    return this.pendingMatches.has(matchId);
  }
}
