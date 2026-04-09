import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Context, Service } from "koishi";
import { HttpsProxyAgent } from "https-proxy-agent";
import { processFetchError } from "../common/error";
import { MiniQueue } from "../common/miniqueue";
import { Config } from "../../config";

export class ValveAPI extends Service<Config> {
  private readonly baseURL: string = "https://www.dota2.com/datafeed";
  private readonly queue: MiniQueue;
  private readonly http: AxiosInstance;
  private readonly abortController = new AbortController();

  constructor(ctx: Context) {
    super(ctx, "dota2tracker.valve-api", true);
    // 实例化 config
    this.config = ctx.config;
    this.queue = new MiniQueue(ctx, { interval: 200 });
    this.http = axios.create({ timeout: 15000, signal: this.abortController.signal, baseURL: this.baseURL });
    ctx.on("dispose", () => this.dispose());
  }

  dispose() {
    this.queue.dispose();
    this.abortController.abort();
  }

  // 提取通用的 fetchData
  private async fetchData(path: string, languageTag?: string) {
    return this.queue.add(async () => {
      const config: AxiosRequestConfig = {
        headers: {},
        httpAgent: undefined,
        httpsAgent: undefined,
        params: {},
      };

      // 实现代理逻辑 (修复 Bug)
      if (this.config.proxyAddress) {
        config.httpsAgent = new HttpsProxyAgent(this.config.proxyAddress);
        config.httpAgent = new HttpsProxyAgent(this.config.proxyAddress);
      }

      // 处理 languageTag
      if (languageTag) {
        config.params.language = this.ctx.dota2tracker.i18n.getValveLanguageTag(languageTag);
      }

      try {
        const response = await this.http.get(path, config);
        return response.data;
      } catch (error) {
        processFetchError(error, this.name, path);
      }
    });
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

  async queryPatchList(): Promise<any[]> {
    const data = await this.fetchData("/patchnoteslist", undefined);
    return data.patches;
  }

  async queryPatchNotes(version: string, languageTag = "zh-CN"): Promise<any> {
    const data = await this.fetchData(`/patchnotes?version=${version}`, languageTag);
    return data;
  }

  async queryLastPatchNumber(): Promise<string> {
    const patches = await this.queryPatchList();
    return patches.at(-1).patch_number;
  }
}
