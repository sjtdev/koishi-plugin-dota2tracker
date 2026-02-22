import { I18NService } from "../common/i18n";
import { HeroService } from "./hero.service";
import { MatchService } from "./match.service";
import { ParsePollingTask } from "../tasks/parse-polling.task";
import { CacheService } from "../data/cache";
import { StratzAPI } from "../data/stratz.api";
import { ValveAPI } from "../data/valve.api";
import { ViewRenderer } from "../presentation/view.renderer";
import { MessageBuilder } from "../presentation/message.builder";
import { ItemService } from "./item.service";
import { MatchWatcherTask } from "../tasks/match-watcher.task";
import { PlayerService } from "./player.service";
import { DatabaseService } from "../data/database";
import { DailyReportTask } from "../tasks/daily-report.task";
import { OpenDotaAPI } from "../data/opendota.api";
import { OpenDotaAdapter } from "./opendota.adapter";
import { DailyReportService } from "./daily-report.service";
import { FontService } from "../presentation/font.service";
import type ConstantsType from "dotaconstants";

export interface DOTA2TrackerServices {
  // 工具层
  i18n: I18NService;
  // 展现层
  view: ViewRenderer;
  messageBuilder: MessageBuilder;
  font: FontService;
  // 核心服务层
  match: MatchService;
  player: PlayerService;
  hero: HeroService;
  item: ItemService;
  opendotaAdapter: OpenDotaAdapter;
  dailyReport: DailyReportService;
  // 任务层
  matchWatcher: MatchWatcherTask;
  parsePolling: ParsePollingTask;
  dailyReportTask: DailyReportTask;
  // 数据层
  valveAPI: ValveAPI;
  stratzAPI: StratzAPI;
  database: DatabaseService;
  cache: CacheService;
  opendotaAPI: OpenDotaAPI;
  dotaconstants: typeof ConstantsType;
}

declare module "koishi" {
  interface Context {
    dota2tracker: DOTA2TrackerServices;
  }
}
