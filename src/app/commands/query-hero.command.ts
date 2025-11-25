import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { handleError } from "../common/error";

export function registerQueryHeroCommand(ctx: Context): void {
  ctx
    .command("dota2tracker.query-hero <input_data>")
    .option("random", "-r")
    .alias("查询英雄")
    .action(async ({ session, options }, input_data) => {
      const name = "query-hero";
      try {
        if (input_data || options.random) {
          await session.send(session.text(".querying_hero"));
          const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
          const heroData = await ctx.dota2tracker.hero.getHeroDetails(input_data, languageTag, options.random);
          if (!heroData) return session.text(".not_found");
          const image = await ctx.dota2tracker.image.renderToImageByFile(heroData, ctx.config.template_hero, TemplateType.Hero, languageTag);
          const message = ctx.dota2tracker.messageBuilder.buildHeroMessage(heroData);
          await session.send(message + image);
        }
      } catch (error) {
        handleError(error, ctx.logger(name), ctx.dota2tracker.i18n, ctx.config);
      }
    });
}
