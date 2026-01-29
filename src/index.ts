import { Context } from "koishi";
import {} from "koishi-plugin-cron";
import path from "path";
import { I18NService } from "./app/common/i18n.ts";
import { HeroService } from "./app/core/hero.service.ts";
import { ItemService } from "./app/core/item.service.ts";
import { MatchService } from "./app/core/match.service.ts";
import { PlayerService } from "./app/core/player.service.ts";
import { DOTA2TrackerServices } from "./app/core/types.service.ts";
import { CacheService } from "./app/data/cache.ts";
import { DatabaseService } from "./app/data/database.ts";
import { StratzAPI } from "./app/data/stratz.api.ts";
import { ValveAPI } from "./app/data/valve.api.ts";
import { ViewRenderer } from "./app/presentation/view.renderer.ts";
import { MessageBuilder } from "./app/presentation/message.builder.ts";
import { MatchWatcherTask } from "./app/tasks/match-watcher.task.ts";
import { ParsePollingTask } from "./app/tasks/parse-polling.task.ts";
import { ReportTask } from "./app/tasks/report.task.ts";
import { type Config } from "./config.ts";

import { registerSubscibeCommand } from "./app/commands/channel.command.ts";
import { registerHelpCommand } from "./app/commands/help.command.ts";
import { registerHeroOfTheDayCommand } from "./app/commands/hero-of-the-day.command.ts";
import { registerQueryHeroCommand } from "./app/commands/query-hero.command.ts";
import { registerQueryItemCommand } from "./app/commands/query-item.command.ts";
import { registerQueryMatchCommand } from "./app/commands/query-match.command.ts";
import { registerQueryMembersCommand } from "./app/commands/query-members.command.ts";
import { registerQueryPlayerCommand } from "./app/commands/query-player.command.ts";
import { registerUserCommand } from "./app/commands/user.command.ts";
import { OpenDotaAPI } from "./app/data/opendota.api.ts";
import { OpenDotaAdapter } from "./app/core/opendota.adapter.ts";

export const name = "dota2tracker";
export let usage = "";
// export const inject = ["http", "database", "cron", "puppeteer", "cache"]; // 声明依赖
export const inject = {
  required: ["database", "puppeteer", "cache"],
  optional: ["cron", "console"],
};

export { Config } from "./config.ts";

export async function apply(ctx: Context, config: Config) {
  // write your plugin here
  const lib = await import("dotaconstants");
  const dotaconstants = lib.default || lib;
  const logger = ctx.logger("dota2tracker");
  const currentDir = path.resolve(__dirname);
  const pluginVersion = require(path.join(currentDir, "..", "package.json")).version as string;
  // 注册模块为自定义服务
  ctx.dota2tracker = {} as any;
  ctx.dota2tracker.dotaconstants = dotaconstants;
  ctx.dota2tracker.i18n = new I18NService(ctx);
  ctx.dota2tracker.view = new ViewRenderer(ctx, currentDir);
  ctx.dota2tracker.messageBuilder = new MessageBuilder(ctx);
  ctx.dota2tracker.match = new MatchService(ctx, pluginVersion);
  ctx.dota2tracker.player = new PlayerService(ctx);
  if (ctx.cron) {
    ctx.dota2tracker.matchWatcher = new MatchWatcherTask(ctx);
    ctx.dota2tracker.parsePolling = new ParsePollingTask(ctx);
    ctx.dota2tracker.report = new ReportTask(ctx);
    // 追踪与轮询需要固定顺序所以从match-watcher与parse-polling的构造器中取出在这里定义。
    ctx.cron("* * * * *", async () => {
      await ctx.dota2tracker.matchWatcher.discovery();
      await ctx.dota2tracker.parsePolling.polling();
    });
  } else {
    logger.info(ctx.dota2tracker.i18n.gt("dota2tracker.logger.cron_not_enabled"));
  }
  ctx.dota2tracker.hero = new HeroService(ctx);
  ctx.dota2tracker.item = new ItemService(ctx);
  ctx.dota2tracker.cache = new CacheService(ctx);
  ctx.dota2tracker.database = new DatabaseService(ctx);
  ctx.dota2tracker.valveAPI = new ValveAPI(ctx);
  ctx.dota2tracker.stratzAPI = new StratzAPI(ctx, currentDir);
  if (config.enableOpenDotaFallback) {
    ctx.dota2tracker.opendotaAPI = new OpenDotaAPI(ctx);
    ctx.dota2tracker.opendotaAdapter = new OpenDotaAdapter(ctx);
  }
  ctx.dota2tracker = ctx.dota2tracker as DOTA2TrackerServices;

  // 注册配置页说明
  usage = await ctx.dota2tracker.i18n.generateUsage();

  // 注册指令
  registerHelpCommand(ctx);
  registerSubscibeCommand(ctx);
  registerUserCommand(ctx);
  registerQueryMembersCommand(ctx);
  registerQueryMatchCommand(ctx);
  registerQueryPlayerCommand(ctx);
  registerQueryHeroCommand(ctx);
  registerQueryItemCommand(ctx);
  registerHeroOfTheDayCommand(ctx);
}
