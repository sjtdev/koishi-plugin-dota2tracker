import { Context } from "koishi";

export function registerHelpCommand(ctx: Context) {
  ctx
    .command("dota2tracker.help")
    .alias("DOTA2指南")
    .alias("DOTA2帮助")
    .alias("DOTA2说明")
    .action(async ({ session }) => {
      const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
      const pluginName = "dota2tracker";
      return ctx.dota2tracker.messageBuilder.buildHelpMessage(languageTag, pluginName);
    });
}
