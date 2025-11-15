import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Context, Service } from "koishi";
import { HttpsProxyAgent } from "https-proxy-agent"; // 2. 导入代理
import { processFetchError } from "../common/error"; // 4. 导入错误工具
import { Config } from "../../config";

export class ValveAPI extends Service<Config> {
  private readonly baseURL: string = "https://www.dota2.com/datafeed";
  private readonly http: AxiosInstance;
  private readonly abortController = new AbortController();

  constructor(ctx: Context) {
    super(ctx, "dota2tracker.valve-api", true);
    // 6. 实例化 config
    this.config = ctx.config;
    this.http = axios.create({ timeout: 10000, signal: this.abortController.signal, baseURL: this.baseURL });
    ctx.on("dispose", () => this.dispose());
  }

  dispose() {
    this.abortController.abort();
  }

  // 7. 提取通用的 fetchData
  private async fetchData(path: string, languageTag?: string) {
    const config: AxiosRequestConfig = {
      headers: {},
      httpAgent: undefined,
      httpsAgent: undefined,
      params: {},
    };

    // 8. 实现代理逻辑 (修复 Bug)
    if (this.config.proxyAddress) {
      config.httpsAgent = new HttpsProxyAgent(this.config.proxyAddress);
      config.httpAgent = new HttpsProxyAgent(this.config.proxyAddress);
    }
    // (Valve API 不需要强制 IPv4，所以我们省略了 opendotaIpStack 的检查)

    // 9. 处理 languageTag
    if (languageTag) {
      config.params.language = this.ctx.dota2tracker.i18n.getValveLanguageTag(languageTag);
    }

    try {
      const response = await this.http.get(path, config);
      return response.data;
    } catch (error) {
      processFetchError(error, this.name, path);
    }
  }


  async queryHeroDetailsFromValve(heroId: number, languageTag = "zh-CN") {
    // 路径中不再拼接 language
    const data = await this.fetchData(`/herodata?hero_id=${heroId}`, languageTag);
    return data.result.data.heroes[0];
  }

  async queryItemListFromValve(languageTag = "zh-CN"): Promise<any[]> {
    const data = await this.fetchData(`/itemlist`, languageTag);
    return data.result.data.itemabilities;
  }

  async queryItemDetailsFromValve(itemId: number, languageTag = "zh-CN") {
    const data = await this.fetchData(`/itemdata?item_id=${itemId}`, languageTag);
    return data.result.data.items[0];
  }

  async queryLastPatchNumber(): Promise<string> {
    // 传入 undefined, fetchData 会跳过 language 参数
    const data = await this.fetchData("/patchnoteslist", undefined);
    return data.patches.at(-1).patch_number;
  }
}
