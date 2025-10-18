import { Context, HTTP, Service } from "koishi";
import { Config } from "../../config";
import { OpenDotaMatch } from "../../@types/opendota-generated";

export class OpenDotaAPI extends Service<Config> {
  private readonly BASE_URL = "https://api.opendota.com/api";
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.opendota-api", true);
    this.config = ctx.config;
  }

  async queryMatchInfo(matchId: number): Promise<OpenDotaMatch> {
    // 创建查询比赛请求路径
    const path = `${this.BASE_URL}/matches/${matchId}`;
    // 发送请求并返回比赛数据
    const data = await this.fetchData("GET", path);
    // 记录请求到今日缓存
    this.ctx.dota2tracker.cache.addOpendotaAPIRequestLog(path, 1);
    return data;
  }

  async requestParseMatch(matchId: number) {
    // 创建解析请求路径
    const path = `${this.BASE_URL}/request/${matchId}`;
    // 发送解析请求并返回解析job
    const job = await this.fetchData("POST", path);
    // 记录请求到今日缓存，并记录次数
    this.ctx.dota2tracker.cache.addOpendotaAPIRequestLog(path, 10);
    return job;
  }

  private async fetchData(type: "GET" | "POST", path: string, data?: any) {
    // 创建独立的配置对象
    const config: HTTP.RequestConfig = {
      responseType: "json",
      proxyAgent: this.config.proxyAddress || undefined,
    };

    // 如果用户填写了OPENDOTA APIKEY，添加认证
    if (this.config.OPENDOTA_API_KEY) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.config.OPENDOTA_API_KEY}`,
      };
    }

    // 直接传递参数
    try {
      switch (type) {
        case "GET":
          return await this.ctx.http.get(path, config);
        case "POST":
          return await this.ctx.http.post(path, data, config);
        default:
          throw new Error(`Unsupported HTTP method: ${type}`);
      }
    } catch (error) {
      this.logger.error("Fetch failed inside fetchData. Detailed cause:");
      this.logger.error(`Request URL: ${path}`);
      this.logger.error(error.cause || error);
      throw error;
    }
  }
}
