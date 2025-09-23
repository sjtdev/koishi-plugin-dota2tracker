import { Context } from "koishi";

export function registerQueryMembersCommand(ctx: Context) {
  ctx
    .command("dota2tracker.query-members")
    .alias("查询群友")
    .action(async ({ session }) => {
      if (!session.isDirect) {
        const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
        const members = await ctx.dota2tracker.player.getMembersInChannel(session);
        return await ctx.dota2tracker.messageBuilder.buildMembersMessage(members, languageTag);
      }
    });
}
