import { Context } from "koishi";
import { resolvePlayerAndHandleErrors, TaskMessenger } from "./_helper";
import { DateTime } from "luxon";
import { PlayerService } from "../core/player.service";
import { WeeklyHeroMeta } from "../data/types";
import { clamp } from "../common/utils";
import { handleError } from "../common/error";

export function registerHeroOfTheDayCommand(ctx: Context) {
  const name = "hero-of-the-day";
  const logger = ctx.logger("command/" + name);
  ctx
    .command(`dota2tracker.${name} <input_data>`)
    .alias("今日英雄")
    .option("days", "-d <value:number>")
    .action(async ({ session, options }, input_data) => {
      const task = new TaskMessenger(session, { autoRecall: ctx.config.autoRecallTips });
      try {
        await task.send(session.text(".querying"));
        const steamId = await resolvePlayerAndHandleErrors(ctx, session, input_data);
        if (steamId === null) return;
        const days = clamp(options.days, 1, 180, 30);
        const result = await ctx.dota2tracker.stratzAPI.queryPlayerPerformanceForHeroRecommendation({
          steamAccountId: steamId,
          recentDateTime: DateTime.now().minus({ days }).toUnixInteger(),
        });

        const recommendationPromise = ctx.dota2tracker.player.getHeroRecommendation(steamId, result.player);
        const metaPromise: Promise<{ recommendation: WeeklyHeroMeta; targetTiers: number[] }> = ctx.dota2tracker.hero.getWeeklyHeroMeta(PlayerService.estimateWeightedRank(result.player));

        const [recommendation, weeklyHeroMeta] = await Promise.all([recommendationPromise, metaPromise]);
        const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
        await task.finish();
        const message = ctx.dota2tracker.messageBuilder.buildHeroOfTheDayMessage(languageTag, recommendation, weeklyHeroMeta);
        return message;
      } catch (error) {
        await task.finish();
        handleError(error, logger, ctx.dota2tracker.i18n, ctx.config);
        return session.text(".query_failed");
      }
    });
}
