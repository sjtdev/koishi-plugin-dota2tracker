import { defineConfig } from "vitepress";
import yamlPlugin from "./vite-plugin-yaml.mts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/koishi-plugin-dota2tracker/",
  title: "@sjtdev/dota2tracker",
  themeConfig: {
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [{ icon: "github", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/" }],
  },
  locales: {
    root: {
      label: "中文",
      lang: "zh-CN",
      description: "koishi插件-追踪群友的DOTA2对局",
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: "主页", link: "/" },
          { text: "指南", link: "/starter" },
          { text: "更新日志", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
        ],

        sidebar: [
          {
            text: "安装与使用",
            items: [
              { text: "安装插件", link: "/starter" },
              {
                text: "使用插件",
                link: "/usage",
                items: [
                  { text: "主动消息", link: "/active-message" },
                  { text: "被动消息（查询指令）", link: "/passive-message" },
                ],
              },
            ],
          },
          {
            text: "详细说明",
            items: [
              { text: "配置项", link: "/configs" },
              { text: "指令说明", link: "/commands" },
              {
                text: "模板展示",
                link: "/template",
                items: [
                  { text: "对局信息模板", link: "/template-match" },
                  { text: "玩家信息模板", link: "/template-player" },
                  { text: "英雄信息模板", link: "/template-hero" },
                  { text: "物品信息模板", link: "/template-item" },
                  { text: "段位整活模板", link: "/template-rank" },
                ],
              },
              { text: "本地化与自定义文本", link: "/i18n" },
            ],
          },
          {
            text: "其他",
            items: [
              { text: "更新日志", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
              { text: "鸣谢", link: "/thanks" },
            ],
          },
        ],

        outline: "deep",
        outlineTitle: "页面导航",
      },
    },
    "en-US": {
      label: "English",
      lang: "en-US",
      description:"Koishi Plugin - Track Friends' DOTA2 Matches",
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: "Home", link: "/en-US/" },
          { text: "Guide", link: "/en-US/starter" },
          { text: "Changelog", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
        ],

        sidebar: [
          {
            text: "Installation and Usage",
            items: [
              { text: "Install Plugin", link: "/en-US/starter" },
              {
                text: "Use Plugin",
                link: "/en-US/usage",
                items: [
                  { text: "Active Messages", link: "/en-US/active-message" },
                  { text: "Passive Messages (Query Commands)", link: "/en-US/passive-message" },
                ],
              },
            ],
          },
          {
            text: "Detailed Description",
            items: [
              { text: "Configuration Items", link: "/en-US/configs" },
              { text: "Command Instructions", link: "/en-US/commands" },
              {
                text: "Template Display",
                link: "/en-US/template",
                items: [
                  { text: "Match Info Template", link: "/en-US/template-match" },
                  { text: "Player Info Template", link: "/en-US/template-player" },
                  { text: "Hero Info Template", link: "/en-US/template-hero" },
                  { text: "Item Info Template", link: "/en-US/template-item" },
                  { text: "Rank Template", link: "/en-US/template-rank" },
                ],
              },
              { text: "Localization", link: "/en-US/i18n" },
            ],
          },
          {
            text: "Others",
            items: [
              { text: "Changelog", link: "https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md" },
              { text: "Acknowledgments", link: "/en-US/thanks" },
            ],
          },
        ],

        outline: "deep",
        outlineTitle: "Page Navigation",
      },
    },
  },
  markdown: {
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  vite: { plugins: [yamlPlugin()] },
});
