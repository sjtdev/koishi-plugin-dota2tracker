import { Context, Session } from "koishi";

/**
 * 一个指令层的辅助函数，用于解析玩家输入并处理常见的错误情况。
 * @returns 成功时返回 steamId (number)，失败时发送错误消息并返回 null。
 */
export async function resolvePlayerAndHandleErrors(ctx: Context, session: Session, input: string | undefined): Promise<number | null> {
  // 1. 检查指令是否可以在当前上下文运行
  if (session.isDirect && !input) {
    session.send(session.text("commands.dota2tracker.common.messages.user_not_in_group"));
    return null;
  }

  // 2. 调用 PlayerService 来解析 SteamID
  const result = await ctx.dota2tracker.player.resolveSteamId(session, input);

  // 3. 统一处理所有失败情况
  if (result.success === false) {
    switch (result.reason) {
      case "NOT_BINDED":
        session.send(session.text("commands.dota2tracker.common.messages.user_not_binded_in_channel"));
        break;
      case "NICKNAME_NOT_FOUND":
      case "INVALID_INPUT":
        session.send(session.text("commands.dota2tracker.common.messages.invalid_input_include_steam_id"));
        break;
    }
    return null;
  }

  // 4. 成功，返回 SteamID
  return Number(result.steamId);
}
