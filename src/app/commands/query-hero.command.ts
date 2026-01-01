import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { handleError } from "../common/error";
import { TaskMessenger } from "./_helper";

export function registerQueryHeroCommand(ctx: Context): void {
  const name = "query-hero";
  const logger = ctx.logger("command/" + name);
  ctx
    .command(`dota2tracker.${name} <input_data>`)
    .option("random", "-r")
    .alias("查询英雄")
    .action(async ({ session, options }, input_data) => {
      const task = new TaskMessenger(session);
      try {
        if (input_data || options.random) {
          await task.send(session.text(".querying_hero"));
          const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
          const heroData = await ctx.dota2tracker.hero.getHeroDetails(input_data, languageTag, options.random);
          if (!heroData) {
            await task.finish();
            return session.text(".not_found");
          }
          const image = await ctx.dota2tracker.image.renderToImageByFile(heroData, ctx.config.template_hero, TemplateType.Hero, languageTag);
          const message = ctx.dota2tracker.messageBuilder.buildHeroMessage(heroData);
          await task.finish();
          await session.send(message + image);
        }
      } catch (error) {
        await task.finish();
        handleError(error, logger, ctx.dota2tracker.i18n, ctx.config);
        return session.text(".query_failed");
      }
    });
}
