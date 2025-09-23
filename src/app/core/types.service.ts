import { I18NService } from "../common/i18n";
import { HeroService } from "./hero.service";
import { MatchService } from "./match.service";
import { ParsePollingTask } from "../tasks/parse-polling.task";
import { CacheService } from "../data/cache";
import { StratzAPI } from "../data/stratz.api";
import { ValveAPI } from "../data/valve.api";
import { ImageRenderer } from "../presentation/image.renderer";
import { MessageBuilder } from "../presentation/message.builder";
import { ItemService } from "./item.service";
import { MatchWatcherTask } from "../tasks/match-watcher.task";
import { PlayerService } from "./player.service";
import { DatabaseService } from "../data/database";
import { ReportTask } from "../tasks/report.task";

export interface DOTA2TrackerServices {
  // 工具层
  i18n: I18NService;
  // 展现层
  image: ImageRenderer;
  messageBuilder: MessageBuilder;
  // 业务层
  match: MatchService;
  player: PlayerService;
  hero: HeroService;
  item: ItemService;
  matchWatcher: MatchWatcherTask;
  parsePolling: ParsePollingTask;
  report: ReportTask;
  // 数据层
  valveAPI: ValveAPI;
  stratzAPI: StratzAPI;
  database: DatabaseService;
  cache: CacheService;
}

declare module "koishi" {
  interface Context {
    dota2tracker: DOTA2TrackerServices;
  }
}
