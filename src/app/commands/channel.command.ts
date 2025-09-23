import { Context } from "koishi";

export function registerSubscibeCommand(ctx: Context) {
  ctx
    .command("dota2tracker.subscribe")
    .alias("订阅本群")
    .action(async ({ session }) => {
      if (!session.isDirect) {
        if (await ctx.dota2tracker.database.isChannelSubscribed(session)) return session.text(".subscribed");
        else {
          ctx.dota2tracker.database.subscribeChannel(session);
          return session.text(".subscribe_success");
        }
      }
    });

  ctx
    .command("dota2tracker.unsubscribe")
    .alias("取消订阅")
    .action(async ({ session }) => {
      if (!session.isDirect) {
        if (await ctx.dota2tracker.database.isChannelSubscribed(session)) {
          ctx.dota2tracker.database.unSubscribeChannel(session);
          return session.text(".unsubscribe_success");
        } else return session.text(".not_subscribed");
      }
    });
}
