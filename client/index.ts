import { Context, icons } from "@koishijs/client";
import Page from "./page.vue";
import { APICountData } from "./types";
import Dota2Icon from "./components/dota2-icon.vue";

export default (ctx: Context) => {
  // 注册DOTA2图标
  icons.register("dota2", Dota2Icon);
  ctx.page({
    name: "DOTA2Tracker（实验性）",
    path: "/dota2tracker",
    component: Page,
    fields: ["apiCount"],
    icon: "dota2",
  });
};
