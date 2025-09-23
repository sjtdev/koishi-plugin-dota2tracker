import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { Config } from "../../config";

export function registerQueryHeroCommand(ctx: Context): void {
  ctx
    .command("dota2tracker.query-hero <input_data>")
    .option("random", "-r")
    .alias("查询英雄")
    .action(async ({ session, options }, input_data) => {
      if (input_data) {
        await session.send(session.text(".querying_hero"));
        const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
        const heroData = await ctx.dota2tracker.hero.getHeroDetails(input_data, languageTag, options.random);
        if (!heroData) return session.text(".not_found");
        const image = await ctx.dota2tracker.image.renderToImageByFile(heroData, ctx.config.template_hero, TemplateType.Hero, languageTag);
        const message = ctx.dota2tracker.messageBuilder.buildHeroMessage(heroData);
        await session.send(message + image);
      }
    });
}
