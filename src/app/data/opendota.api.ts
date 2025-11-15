import { Context, Service } from "koishi";
import { Config } from "../../config";
import { OpenDotaMatch } from "../../@types/opendota-generated";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { processFetchError } from "../common/error";

export class OpenDotaAPI extends Service<Config> {
  private readonly BASE_URL = "https://api.opendota.com/api";
  private readonly http: AxiosInstance;
  private readonly abortController = new AbortController();
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.opendota-api", true);
    this.config = ctx.config;

    this.http = axios.create({ timeout: 10000, signal: this.abortController.signal, baseURL: this.BASE_URL });
    ctx.on("dispose", () => this.dispose());
  }

  dispose() {
    this.abortController.abort();
  }

  async queryMatchInfo(matchId: number): Promise<OpenDotaMatch> {
    // 创建查询比赛请求路径
    const path = `/matches/${matchId}`;
    // 发送请求并返回比赛数据
    const data = await this.fetchData("GET", path);
    // 记录请求到今日缓存
    this.ctx.dota2tracker.cache.addOpendotaAPIRequestLog(path, 1);
    return data;
  }

  async requestParseMatch(matchId: number) {
    // 创建解析请求路径
    const path = `/request/${matchId}`;
    // 发送解析请求并返回解析job
    const job = await this.fetchData("POST", path);
    // 记录请求到今日缓存，并记录次数
    this.ctx.dota2tracker.cache.addOpendotaAPIRequestLog(path, 10);
    return job;
  }

  private async fetchData(type: "GET" | "POST", path: string, data?: any) {
    const config: AxiosRequestConfig = {
      headers: {},
      httpAgent: undefined,
      httpsAgent: undefined,
    };

    // 优先处理代理
    if (this.config.proxyAddress) {
      config.httpsAgent = new HttpsProxyAgent(this.config.proxyAddress);
      config.httpAgent = new HttpsProxyAgent(this.config.proxyAddress);
    }
    // 仅在 *没有* 代理时，才应用 IPv4 强制策略
    else if (this.config.OpenDotaIPStack === "ipv4") {
      // 强制 axios 使用 family: 4
      config.httpAgent = new HttpAgent({ family: 4 });
      config.httpsAgent = new HttpsAgent({ family: 4 });
    }

    if (this.config.OPENDOTA_API_KEY) {
      config.headers["Authorization"] = `Bearer ${this.config.OPENDOTA_API_KEY}`;
    }

    try {
      let response;
      if (type === "GET") {
        response = await this.http.get(path, config);
      } else {
        response = await this.http.post(path, data, config);
      }
      return response.data;
    } catch (error) {
      processFetchError(error, "OpenDota", path);
    }
  }
}
