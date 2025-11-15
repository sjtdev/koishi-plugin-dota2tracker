import { resolve } from "path";
import {} from "@koishijs/plugin-console";
import { Context } from "koishi";

export function registerConsolePage(ctx: Context) {
  ctx.inject(["console"], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, "../client/index.ts"),
      prod: resolve(__dirname, "../dist"),
    });
  });
}
