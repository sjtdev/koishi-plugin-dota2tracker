// .vitepress/theme/index.ts
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ChatPanel from "@cordisjs/vitepress/client/components/chat-panel.vue";
import ChatMessage from "@cordisjs/vitepress/client/components/chat-message.vue";
import ImageViewer from "./components/ImageViewer.vue";
import Command from "./components/Command.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("chat-panel", ChatPanel); // 全局注册组件
    app.component("chat-message", ChatMessage); // 全局注册组件
    app.component("ImageViewer", ImageViewer);
    app.component("Command", Command);
  },
} satisfies Theme;
