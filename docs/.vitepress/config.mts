import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: "@sjtdev/dota2tracker",
  description: "koishi插件-追踪群友的DOTA2对局",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "介绍", link: "/" },
      { text: "详细功能", link: "/markdown-examples" },
      { text: "更新日志", link: "/changelog" },
      { text: "tests", link: "/tests" },
    ],

    sidebar: [
      {
        text: "启动",
        items: [
          { text: "安装插件", link: "/starter" },
          { text: "配置项说明", link: "/configs" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/" }],
  },
  locales: {
    root: {
      label: "中文",
      lang: "zh-CN",
    },
    "en-US": {
      label: "English",
      lang: "en-US",
    },
  },
});
