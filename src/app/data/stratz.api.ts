import fs from "fs";
import { Context, Service } from "koishi";
import path from "path";
import * as graphql from "../../@types/graphql-generated";
import { Config } from "../../config";
import { GraphQLQueryError, processFetchError } from "../common/error";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

interface QueryFormat {
  query: string;
  variables?: {};
}
interface QueryResult {
  data: any;
  errors?: [{ message: string }];
}

export class StratzAPI extends Service<Config> {
  private readonly BASE_URL = "https://api.stratz.com/graphql";
  private readonly queue: MiniQueue;
  private readonly http: AxiosInstance;
  private readonly abortController = new AbortController();
  private readonly graphqlQueriesDir: string;
  constructor(ctx: Context, currentDir: string) {
    super(ctx, "dota2tracker.stratz-api", true);
    this.config = ctx.config;
    this.graphqlQueriesDir = path.join(currentDir, "queries");
    this.queue = new MiniQueue(ctx, { interval: 200 });
    this.http = axios.create({ timeout: 10000, signal: this.abortController.signal });
    ctx.on("dispose", () => this.dispose());
  }
  dispose() {
    // 当 StratzAPI 服务被销毁时，自动销毁队列
    this.queue.dispose();
    // 终止 axios 请求
    this.abortController.abort();
  }

  public async queryGetWeeklyMetaByPosition({ bracketIds }: graphql.GetWeeklyMetaByPositionQueryVariables) {
    return this.query<graphql.GetWeeklyMetaByPositionQueryVariables, graphql.GetWeeklyMetaByPositionQuery>("GetWeeklyMetaByPosition", { bracketIds }, (data) => !!data.heroStats);
  }

  public async queryPlayerPerformanceForHeroRecommendation({ steamAccountId, recentDateTime }: graphql.PlayerPerformanceForHeroRecommendationQueryVariables) {
    return this.query<graphql.PlayerPerformanceForHeroRecommendationQueryVariables, graphql.PlayerPerformanceForHeroRecommendationQuery>(
      "PlayerPerformanceForHeroRecommendation",
      {
        steamAccountId,
        recentDateTime,
      },
      (data) => !!data.player,
    );
  }

  public async queryPlayersMatchesForDaily(steamAccountIds: number[], seconds: number) {
    return this.query<graphql.PlayersMatchesForDailyQueryVariables, graphql.PlayersMatchesForDailyQuery>(
      "PlayersMatchesForDaily",
      {
        steamAccountIds,
        seconds,
      },
      (data) => !!data.players,
    );
  }

  public async queryVerifyingPlayer(steamAccountId: number) {
    return this.query<graphql.VerifyingPlayerQueryVariables, graphql.VerifyingPlayerQuery>("VerifyingPlayer", { steamAccountId }, (data) => !!data.player);
  }

  public async queryPlayerExtraInfo({ steamAccountId, matchCount, heroIds }: graphql.PlayerExtraInfoQueryVariables) {
    return this.query<graphql.PlayerExtraInfoQueryVariables, graphql.PlayerExtraInfoQuery>(
      "PlayerExtraInfo",
      {
        steamAccountId,
        matchCount,
        heroIds,
      },
      (data) => !!data.player,
    );
  }
  public async queryPlayersInfoWith10MatchesForGuild({ steamAccountIds }: graphql.PlayersInfoWith10MatchesForGuildQueryVariables): Promise<graphql.PlayersInfoWith10MatchesForGuildQuery> {
    return this.query<graphql.PlayersInfoWith10MatchesForGuildQueryVariables, graphql.PlayersInfoWith10MatchesForGuildQuery>("PlayersInfoWith10MatchesForGuild", { steamAccountIds }, (data) => !!data.players);
  }

  public async queryPlayerInfoWith25Matches({ steamAccountId, heroIds }: graphql.PlayerInfoWith25MatchesQueryVariables) {
    return this.query<graphql.PlayerInfoWith25MatchesQueryVariables, graphql.PlayerInfoWith25MatchesQuery>(
      "PlayerInfoWith25Matches",
      {
        steamAccountId,
        heroIds,
      },
      (data) => !!data.player,
    );
  }

  public async queryPlayersLastMatchRankInfo({ steamAccountIds }: graphql.PlayersLastmatchRankinfoQueryVariables): Promise<graphql.PlayersLastmatchRankinfoQuery> {
    return this.query<graphql.PlayersLastmatchRankinfoQueryVariables, graphql.PlayersLastmatchRankinfoQuery>("PlayersLastmatchRankinfo", { steamAccountIds }, (data) => !!data.players);
  }

  public async queryConstants(languageTag: string) {
    return this.query<graphql.ConstantsQueryVariables, graphql.ConstantsQuery>("Constants", { language: this.ctx.dota2tracker.i18n.getGraphqlLanguageTag(languageTag) as graphql.LanguageEnum }, (data) => !!data.constants);
  }

  public async queryMatchInfo(matchId: number) {
    return this.query<graphql.MatchInfoQueryVariables, graphql.MatchInfoQuery>("MatchInfo", { matchId }, (data) => !!data.match);
  }

  public async requestParseMatch(matchId: number) {
    const response = await this.query<graphql.RequestMatchDataAnalysisQueryVariables, graphql.RequestMatchDataAnalysisQuery>("RequestMatchDataAnalysis", {
      matchId: matchId,
    });
    return response?.stratz?.matchRetry;
  }

  private async query<TVariables, TData>(
    queryName: string, // 定义 query_func 为字符串
    variables?: TVariables, // 查询变量
    isValid: (data: TData | null) => boolean = () => true,
  ): Promise<TData> {
    // 判断是否是需要分批的查询
    if (queryName.startsWith("Players") && (variables as { steamAccountIds?: any[] })?.steamAccountIds.length > 5) {
      const playerIds = (variables as { steamAccountIds?: any[] })?.steamAccountIds ?? [];
      const chunkSize = 5;
      let allPlayers = [];

      // 将玩家ID数组分割成多个5个一组的子数组
      for (let i = 0; i < playerIds.length; i += chunkSize) {
        const chunk = playerIds.slice(i, i + chunkSize);
        (variables as { steamAccountIds?: any[] }).steamAccountIds = chunk;

        // 对每个分批的查询调用query_func, 并确保传入多个参数
        const query_str = this.loadGraphqlFile(queryName); // 如果有额外的参数，保持传递下去

        // 等待请求之间加入延迟 ---- 使用p-queue已无需手动加入延迟
        const result: QueryResult["data"] = await this.fetchData({ query: query_str, variables }, isValid, queryName);

        // 确保每次请求返回的是{ data: { players: [...] } }格式
        if (result && result.players) {
          allPlayers = allPlayers.concat(result.players);
        }
      }

      // 将所有players合并到data字段下
      return { players: allPlayers } as TData;
    } else {
      // 如果不需要分批，直接进行查询
      const query_str = this.loadGraphqlFile(queryName);
      const result = await this.fetchData({ query: query_str, variables }, isValid, queryName);
      return result as TData;
    }
  }

  private async fetchData<TData>(query: QueryFormat, isValid: Function, queryName: string): Promise<void | TData> {
    // 使用 queue.add() 来包装真正的请求逻辑
    return this.queue.add(async () => {
      try {
        const config: AxiosRequestConfig = {
          responseType: "json",
          headers: { "User-Agent": "STRATZ_API", "Content-Type": "application/json", Authorization: `Bearer ${this.config.STRATZ_API_TOKEN}` },
          httpAgent: undefined,
          httpsAgent: undefined,
        };

        if (this.config.proxyAddress) {
          config.httpsAgent = new HttpsProxyAgent(this.config.proxyAddress);
          config.httpAgent = new HttpsProxyAgent(this.config.proxyAddress);
        }
        const result = (await this.http.post(this.BASE_URL, JSON.stringify(query), config)).data;

        // 现在，我们使用调用者提供的 isValid 函数来判断数据是否有效
        const isDataValid = isValid(result.data);

        if (result.errors) {
          const errors = result.errors.map((e) => e.message);
          const details = errors.join("\n");
          if (isDataValid) {
            // 情况1：部分成功 (有错误，但数据仍然有效)
            this.logger.warn(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.stratz_api_query_error", { cause: details }));
            return result.data as TData;
          } else {
            // 情况2：完全失败 (有错误，且数据无效)
            throw new GraphQLQueryError("Stratz API query failed and returned invalid data", errors);
          }
        }

        // 情况3：完全成功
        return result.data as TData;
      } catch (error) {
        processFetchError(error, "Stratz", queryName);
      }
    });
  }

  private loadGraphqlFile(queryName: string): string {
    return fs.readFileSync(path.join(this.graphqlQueriesDir, `${queryName}.graphql`), { encoding: "utf-8" }).replace(/[\r\n]+/g, " ");
  }
}

class MiniQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private interval: number;
  private stopped = false; // 新增一个停止标志

  // 1. 构造函数接收 ctx
  constructor(
    private ctx: Context,
    options: { interval: number },
  ) {
    this.interval = options.interval;
  }

  public add<T>(task: () => Promise<T>): Promise<T> {
    if (this.stopped) {
      return Promise.reject(new Error("Queue has been disposed."));
    }
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this._process();
    });
  }

  // 4. 新增 dispose 方法
  public dispose() {
    this.stopped = true;
    this.queue = []; // 清空等待队列
  }

  private async _process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || this.stopped) {
      return;
    }
    this.isProcessing = true;

    const task = this.queue.shift();
    if (task) {
      await task();
      // 2. 使用 ctx.setTimeout
      await new Promise<void>((resolve) => this.ctx.setTimeout(resolve, this.interval));
    }

    this.isProcessing = false;
    // 递归处理队列中的下一个任务
    this._process();
  }
}
