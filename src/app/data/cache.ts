import {} from "@koishijs/cache";
import * as graphql from "../../@types/graphql-generated";
import { ItemList, WeeklyHeroMeta } from "./types";
import { DAYS_30 } from "../common/constants";
import { Context, Service } from "koishi";
import { DateTime } from "luxon";

declare module "@koishijs/cache" {
  interface Tables {
    dt_facets_constants: graphql.ConstantsQuery; // 游戏数据
    dt_itemlist_constants: { itemList: ItemList; gameVersion: string };
    dt_previous_query_results: { data: graphql.MatchInfoQuery; pluginVersion: string };
    dt_sended_match_id: undefined;
    dt_weekly_metadata: WeeklyHeroMeta;
  }
}

export class CacheService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.cache", true);
  }

  private get msUntilUTCEndOfDay() {
    const now = DateTime.utc();
    const endOfDay = now.endOf("day");
    const ttl = endOfDay.diff(now).toMillis();
    return ttl;
  }

  setWweeklyMetaCache(key: string, value: WeeklyHeroMeta) {
    this.ctx.cache.set("dt_weekly_metadata", key, value, this.msUntilUTCEndOfDay);
  }

  async getWeeklyMetaCache(key: string): Promise<WeeklyHeroMeta> {
    return this.ctx.cache.get("dt_weekly_metadata", key);
  }

  cacheItemListConstants(languageTag: string, itemList: ItemList, gameVersion: string) {
    this.ctx.cache.set("dt_itemlist_constants", languageTag, {
      gameVersion,
      itemList,
    });
  }

  async getItemListConstants(languageTag: string) {
    return this.ctx.cache.get("dt_itemlist_constants", languageTag);
  }

  async getMatchCache(matchId: string | number) {
    return this.ctx.cache.get("dt_previous_query_results", String(matchId));
  }

  setMatchCache(matchId: string | number, matchQuery: any, pluginVersion: string) {
    this.ctx.cache.set("dt_previous_query_results", String(matchQuery.match.id), { data: matchQuery, pluginVersion }, DAYS_30);
  }

  markMatchAsSended(matchId: string | number) {
    this.ctx.cache.set("dt_sended_match_id", String(matchId), undefined, DAYS_30);
  }

  deleteMatchCache(matchId: string | number) {
    this.ctx.cache.delete("dt_previous_query_results", String(matchId));
  }
  /**
   * 获取所有近期已发送过的比赛ID。
   * @returns 返回一个包含所有已发送ID的 Set，便于高效查询。
   */
  public async getSendedMatchIds(): Promise<Set<number>> {
    const sendedIds = new Set<number>();
    // 迭代所有符合前缀的 key
    for await (const key of this.ctx.cache.keys("dt_sended_match_id")) {
      sendedIds.add(Number(key));
    }
    return sendedIds;
  }

  async getFacetConstantsCache(languageTag: string) {
    return this.ctx.cache.get("dt_facets_constants", languageTag);
  }

  setFacetConstantsCache(languageTag: string, constants: graphql.ConstantsQuery) {
    this.ctx.cache.set("dt_facets_constants", languageTag, constants, DAYS_30);
  }

  deleteFacetConstantsCache(languageTag: string) {
    this.ctx.cache.delete("dt_facets_constants", languageTag);
  }
}
