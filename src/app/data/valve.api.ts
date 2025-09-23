import { Context, HTTP, Service } from "koishi";

export  class ValveAPI extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.valve-api", true);
  }
  async queryHeroDetailsFromValve(heroId: number, languageTag = "zh-CN") {
    return (await this.ctx.http.get(`https://www.dota2.com/datafeed/herodata?language=${this.ctx.dota2tracker.i18n.getValveLanguageTag(languageTag)}&hero_id=${heroId}`)).result.data.heroes[0];
  }

  async queryItemListFromValve(languageTag = "zh-CN"): Promise<any[]> {
    return (await this.ctx.http.get(`https://www.dota2.com/datafeed/itemlist?language=${this.ctx.dota2tracker.i18n.getValveLanguageTag(languageTag)}`)).result.data.itemabilities;
  }

  async queryItemDetailsFromValve(itemId: number, languageTag = "zh-CN") {
    return (await this.ctx.http.get(`https://www.dota2.com/datafeed/itemdata?language=${this.ctx.dota2tracker.i18n.getValveLanguageTag(languageTag)}&item_id=${itemId}`)).result.data.items[0];
  }

  async queryLastPatchNumber(): Promise<string> {
    return (await this.ctx.http.get("https://www.dota2.com/datafeed/patchnoteslist")).patches.at(-1).patch_number;
  }
}
