import { resolve } from "path";
import {} from "@koishijs/plugin-console";
import { Context } from "koishi";
import { CustomProvider } from "./app/console/data";

export function registerConsolePage(ctx: Context) {
  const tracker = ctx.dota2tracker;

  if (!tracker) {
    ctx.logger('dota2tracker').warn("dota2tracker service is missing during console registration!");
    return;
  }
  new CustomProvider(ctx, tracker);

  // 3. 注册页面
  ctx.console.addEntry({
    dev: resolve(__dirname, "../client/index.ts"),
    prod: resolve(__dirname, "../dist"),
  });
}
