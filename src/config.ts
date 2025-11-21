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
  suppressApiNetworkErrors: boolean;
  enableOpenDotaFallback: boolean;
  OPENDOTA_API_KEY: string;
  OpenDotaIPStack: string;
  enableConsole: boolean;

  useHeroNicknames: boolean;
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
const templateDir = path.join(__dirname, "templates");
// 读取 schema.yml 文件
const allI18nConfigs = Object.fromEntries(Object.keys(LanguageTags).map((lang) => [lang, require(`./locales/${lang}.schema.yml`)._config]));
export const Config: Schema = Schema.intersect([
  Schema.intersect([
    Schema.object({
      STRATZ_API_TOKEN: Schema.string().required().role("secret"),
      dataParsingTimeoutMinutes: Schema.number().default(60).min(0).max(1440),
      proxyAddress: Schema.string(),
      suppressStratzNetworkErrors: Schema.boolean().default(false).deprecated(),
      suppressApiNetworkErrors: Schema.boolean().default(false),
      enableOpenDotaFallback: Schema.boolean().default(false),
      enableConsole: Schema.boolean().default(false).experimental(),
    }).i18n(getI18n("base")),
    Schema.union([
      Schema.object({
        enableOpenDotaFallback: Schema.const(true).required(),
        OPENDOTA_API_KEY: Schema.string().role("secret"),
        OpenDotaIPStack: Schema.union(["auto", "ipv4"]).default("auto"),
      }),
      Schema.object({}),
    ]).i18n(getI18n("base")),
  ]),
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
    }).i18n(getI18n("message")),
    Schema.union([
      Schema.object({
        rankBroadSwitch: Schema.const(true).required(),
        rankBroadStar: Schema.boolean().default(true),
        rankBroadLeader: Schema.boolean().default(true),
        rankBroadFun: Schema.boolean().default(false),
      }),
      Schema.object({}),
    ]).i18n(getI18n("message")),
  ]),
  Schema.intersect([
    Schema.object({
      dailyReportSwitch: Schema.boolean().default(false),
    }).i18n(getI18n("report")),
    Schema.union([
      Schema.object({
        dailyReportSwitch: Schema.const(true).required(),
        dailyReportHours: Schema.number().min(0).max(23).default(6),
        dailyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]).i18n(getI18n("report")),
    Schema.object({
      weeklyReportSwitch: Schema.boolean().default(false),
    })
      .i18n(getI18n("report"))
      .description(undefined),
    Schema.union([
      Schema.object({
        weeklyReportSwitch: Schema.const(true).required(),
        weeklyReportDayHours: Schema.tuple([Schema.number().min(1).max(7), Schema.number().min(0).max(23)]).default([1, 10]),
        weeklyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]).i18n(getI18n("report")),
  ]),
  Schema.object({
    template_match: Schema.union([...readDirectoryFilesSync(path.join(templateDir, "match"))]).default("match_1"),
    template_player: Schema.union([...readDirectoryFilesSync(path.join(templateDir, "player"))]).default("player_1"),
    template_hero: Schema.union([...readDirectoryFilesSync(path.join(templateDir, "hero"))]).default("hero_1"),
    playerRankEstimate: Schema.boolean().default(true),
    templateFonts: Schema.array(String).default([]).role("table"),
  }).i18n(getI18n("template")),
]);

/**
 * 从预加载的数据中提取特定类别的 i18n 配置
 * @param key - 要提取的类别 (例如 'base', 'message', 'report')
 * @returns 供 Schema.i18n() 使用的对象
 */
function getI18n(key: "base" | "message" | "report" | "template") {
  return Object.fromEntries(
    Object.entries(allI18nConfigs).map(([lang, config]) => [
      lang,
      config[key], // 提取对应语言的对应类别
    ]),
  );
}

/** 读取目录下所有 .ejs 文件名并去除后缀名后返回文件名数组。 */
function readDirectoryFilesSync(directoryPath: string): string[] {
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
