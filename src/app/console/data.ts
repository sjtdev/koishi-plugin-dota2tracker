import { Context } from "koishi";
import { DataService } from "@koishijs/plugin-console";
import { DOTA2TrackerServices } from "../core/types.service";
import { APICountData } from "./types";

export class CustomProvider extends DataService<APICountData> {
  // 临时存储dota2tracker对象
  constructor(ctx: Context, private tracker: DOTA2TrackerServices) {
    super(ctx, "apiCount");
    this.tracker = tracker;
  }

  async get() {
    return { opendota: await this.tracker.cache.getTodayOpendotaAPIRequestCount() };
  }
}
