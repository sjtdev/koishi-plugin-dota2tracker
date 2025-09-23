import { Schema } from "koishi";
import fs from "fs";
import path from "path";
import { LanguageTags } from "./app/common/i18n";

// 配置项
export interface Config {
  STRATZ_API_TOKEN: string;
  dataParsingTimeoutMinutes: number;
  proxyAddress: string;
  suppressStratzNetworkErrors: boolean;

  useHeroNicknames:boolean;
  urlInMessageType: Array<string>;
  maxSendItemCount: number;
  showItemListAtTooMuchItems: boolean;
  customItemAlias: { keyword: string; alias: string }[];
  rankBroadSwitch: boolean;
  rankBroadStar: boolean;
  rankBroadLeader: boolean;
  rankBroadFun: boolean;

  dailyReportSwitch: boolean;
  dailyReportHours: number;
  dailyReportShowCombi: boolean;
  weeklyReportSwitch: boolean;
  weeklyReportDayHours: Array<number>;
  weeklyReportShowCombi: boolean;

  template_match: string;
  template_player: string;
  template_hero: string;
  playerRankEstimate: boolean;
  templateFonts: string[];
}
const pluginDir = path.resolve(__dirname, "..");
export const Config: Schema = Schema.intersect([
  Schema.object({
    STRATZ_API_TOKEN: Schema.string().required().role("secret"),
    dataParsingTimeoutMinutes: Schema.number().default(60).min(0).max(1440),
    proxyAddress: Schema.string(),
    suppressStratzNetworkErrors: Schema.boolean().default(false),
  }).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.base), acc), {})),
  Schema.intersect([
    Schema.object({
      useHeroNicknames: Schema.boolean().default(true),
      urlInMessageType: Schema.array(Schema.union([Schema.const("match"), Schema.const("player"), Schema.const("hero")])).role("checkbox"),
      maxSendItemCount: Schema.number().default(5).min(1).max(10),
      showItemListAtTooMuchItems: Schema.boolean().default(true),
      customItemAlias: Schema.array(
        Schema.object({
          keyword: Schema.string().required(),
          alias: Schema.string().required(),
        }),
      )
        .default([])
        .role("table"),
      rankBroadSwitch: Schema.boolean().default(false),
    }).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.message), acc), {})),
    Schema.union([
      Schema.object({
        rankBroadSwitch: Schema.const(true).required(),
        rankBroadStar: Schema.boolean().default(true),
        rankBroadLeader: Schema.boolean().default(true),
        rankBroadFun: Schema.boolean().default(false),
      }),
      Schema.object({}),
    ]).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.message), acc), {})),
  ]),
  Schema.intersect([
    Schema.object({
      dailyReportSwitch: Schema.boolean().default(false),
    }).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.report), acc), {})),
    Schema.union([
      Schema.object({
        dailyReportSwitch: Schema.const(true).required(),
        dailyReportHours: Schema.number().min(0).max(23).default(6),
        dailyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.report), acc), {})),
    Schema.object({
      weeklyReportSwitch: Schema.boolean().default(false),
    })
      .i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.report), acc), {}))
      .description(undefined),
    Schema.union([
      Schema.object({
        weeklyReportSwitch: Schema.const(true).required(),
        weeklyReportDayHours: Schema.tuple([Schema.number().min(1).max(7), Schema.number().min(0).max(23)]).default([1, 10]),
        weeklyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.report), acc), {})),
  ]),
  Schema.object({
    template_match: Schema.union([...readDirectoryFilesSync(path.join(pluginDir, "template", "match"))]).default("match_1"),
    template_player: Schema.union([...readDirectoryFilesSync(path.join(pluginDir, "template", "player"))]).default("player_1"),
    template_hero: Schema.union([...readDirectoryFilesSync(path.join(pluginDir, "template", "hero"))]).default("hero_1"),
    playerRankEstimate: Schema.boolean().default(true),
    templateFonts: Schema.array(String).default([]).role("table"),
  }).i18n(Object.keys(LanguageTags).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.template), acc), {})),
]);
/** 读取目录下所有 .ejs 文件名并去除后缀名后返回文件名数组。 */
export function readDirectoryFilesSync(directoryPath: string): string[] {
  try {
    // 同步读取目录下的所有文件名
    const files = fs.readdirSync(directoryPath);

    // 过滤出 .ejs 文件并去除扩展名
    const fileNames = files.filter((file) => path.extname(file).toLowerCase() === ".ejs").map((file) => path.basename(file, ".ejs"));

    return fileNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return []; // 发生错误时返回空数组
  }
}
