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

export class TaskMessenger {
  private tipIds: string[] = [];

  constructor(private session: Session) {}
  /**
   * 发送一条提示消息，并记录其 ID 以便后续撤回
   * @param content 提示内容
   * @returns 返回 this 实例，支持链式调用
   */
  async send(content: string): Promise<this> {
    try {
      const result = await this.session.send(content);
      // 统一处理数组或单值，扁平化存入
      const newIds = Array.isArray(result) ? result : [result];
      this.tipIds.push(...newIds);
    } catch (e) {
      // 发送失败不阻断流程，仅做静默处理或记录日志
    }
    return this;
  }

  /**
   * 任务结束，撤回所有提示消息
   */
  async finish() {
    if (this.tipIds.length === 0) return;

    // 倒序撤回通常体验更好（先撤回最新的），不过顺序也无所谓
    // 复制一份副本进行遍历，避免边删边改可能带来的副作用
    const idsToRecall = [...this.tipIds].reverse();
    this.tipIds = []; // 立即清空，防止重复调用

    for (const id of idsToRecall) {
      try {
        await this.session.bot.deleteMessage(this.session.channelId, id);
      } catch (e) {
        // 忽略撤回失败
      }
    }
  }
}
