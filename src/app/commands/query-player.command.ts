import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { Config } from "../../config";
import { resolvePlayerAndHandleErrors } from "./_helper";

export function registerQueryPlayerCommand(ctx: Context) {
  ctx
    .command("dota2tracker.query-player <input_data>")
    .option("hero", "-o <value:string>")
    .alias("查询玩家")
    .action(async ({ session, options }, input_data) => {
      if (session.guild || (!session.guild && input_data)) {
        const steamId = await resolvePlayerAndHandleErrors(ctx, session, input_data);
        if (steamId === null) return;
        session.send(session.text(".querying_player"));
        const heroId = ctx.dota2tracker.i18n.findHeroIdInLocale(options.hero);
        const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
        const formattedPlayerData = await ctx.dota2tracker.player.getFormattedPlayerData(steamId, heroId, languageTag);
        const image = await ctx.dota2tracker.image.renderToImageByFile(formattedPlayerData, ctx.config.template_player, TemplateType.Player, languageTag);
        const message = ctx.dota2tracker.messageBuilder.buildPlayerMessage(steamId);
        return message + image;
      } else {
        return session.text("commands.dota2tracker.common.messages.user_not_in_group");
      }
    });
}
