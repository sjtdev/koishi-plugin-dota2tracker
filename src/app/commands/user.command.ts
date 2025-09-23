import { Context } from "koishi";

export function registerUserCommand(ctx: Context) {
  ctx
    .command("dota2tracker.bind <steam_id> [nick_name]")
    .alias("绑定")
    .action(async ({ session }, steam_id, nick_name) => {
      if (!session.isDirect) {
        // 预检1：若无输入数据或steamId不符1~11位数字则返回
        if (!steam_id || !/^\d{1,11}$/.test(steam_id)) {
          return session.text(".steam_id_invalid");
        }
        // 预检2：若昵称过长则返回
        if (!/^(?:.{1,20})?$/.test(nick_name ?? "")) {
          return session.text(".nick_name_too_long");
        }
        // 若检测到玩家已绑定则返回
        const sessionPlayer = await ctx.dota2tracker.database.getBindedUser(session);
        if (sessionPlayer) {
          return session.text(".already_binded", sessionPlayer);
        }
        try {
          // 此处执行玩家验证函数，调用API查询玩家比赛数据，若SteamID无效或无场次都将返回
          let verifyRessult = await ctx.dota2tracker.player.validateSteamId(steam_id);
          switch (verifyRessult.status) {
            case "VALID":
              session.send(session.text(".bind_success", { userId: session.event.user.id, nickName: nick_name || "", steamId: steam_id }) + (verifyRessult.isAnonymous ? "\n" + session.text(".is_anonymous") : ""));
              ctx.dota2tracker.database.bindUser(session, steam_id, nick_name);
              break;
            default:
              session.send(session.text(`.bind_failed`, [session.text(verifyRessult.reason)]));
              return;
          }
        } catch (error) {

        }
      }
    });
  ctx
    .command("dota2tracker.unbind")
    .alias("取消绑定")
    .action(async ({ session }) => {
      if (!session.isDirect) {
        const sessionPlayer = await ctx.dota2tracker.database.getBindedUser(session);
        if (sessionPlayer) {
          await ctx.database.remove("dt_subscribed_players", sessionPlayer.id); // 从数据库中删除
          return session.text(".unbind_success");
        } else {
          return session.text(".not_binded");
        }
      }
    });
  ctx
    .command("dota2tracker.rename <nick_name>")
    .alias("改名")
    .action(async ({ session }, nick_name) => {
      if (!session.isDirect) {
        const sessionPlayer = await ctx.dota2tracker.database.getBindedUser(session);
        if (sessionPlayer) {
          if (!nick_name) {
            return session.text(".emtpy_input");
          }
          if (!/^.{1,20}$/.test(nick_name ?? "")) {
            return session.text(".nick_name_too_long");
          }
          if (nick_name === sessionPlayer.nickName){
            return session.text(".nick_name_same");
          }
          await ctx.database.set("dt_subscribed_players", sessionPlayer.id, { nickName: nick_name });
          return session.text(".rename_success", { nick_name });
        } else {
          return session.text(".not_binded");
        }
      }
    });
}
