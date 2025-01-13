import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/koishi-plugin-dota2tracker/",
  lang: "zh-CN",
  title: "@sjtdev/dota2tracker",
  description: "koishi插件-追踪群友的DOTA2对局",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "指南", link: "/starter" },
      { text: "更新日志", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
      // { text: "tests", link: "/tests" },
    ],

    sidebar: [
      {
        text: "安装与使用",
        items: [
          { text: "安装插件", link: "/starter" },
          { text: "插件配置说明", link: "/configs" },
        ],
      },
      {
        text: "其他",
        items: [
          {
            text: "模板展示",
            link:"/template",
            items: [
              { text: "对局信息模板", link: "/template-match" },
              { text: "玩家信息模板", link: "/template-player" },
              { text: "英雄信息模板", link: "/template-hero" },
            ],
          },
          { text: "展示区", link: "/previews" },
          { text: "更新日志", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
        ],
      },
    ],

    outline: "deep",
    outlineTitle: "页面导航",

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
