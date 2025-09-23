import { Context } from "koishi";

export function registerHelpCommand(ctx: Context) {
  ctx
    .command("dota2tracker.help")
    .alias("DOTA2指南")
    .alias("DOTA2帮助")
    .alias("DOTA2说明")
    .action(async ({ session }) => {
      return session.text(".content");
    });
}
