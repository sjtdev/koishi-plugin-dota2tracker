import path from "path";
import fs from "fs";
import ejs from "ejs";
import * as utils from "../src/utils";
// import { GraphqlLanguageEnum } from "../src/index";
import * as dotaconstants from "dotaconstants";
import moment from "moment";
import i18next from "i18next";
import yaml from "js-yaml";
import puppeteer, { Browser } from "puppeteer";
import http from "http";
import https from "https";
import url from "url";

enum GraphqlLanguageEnum {
  "en-US" = "ENGLISH",
  "zh-CN" = "S_CHINESE",
}

(async () => {
  await i18next.init({
    ns: ["translation"], // 使用默认的命名空间
    defaultNS: "translation",
    fallbackLng: "zh-CN",
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
      skipOnVariables: false, // 即使缺少变量也会进行插值处理
      // 自定义处理未被替换的占位符
      // nsSeparator: false, // 禁用命名空间分隔符
      // keySeparator: false, // 禁用键分隔符
      // 使用正则表达式移除未被替换的占位符
      format: function (value, format, lng, options) {
        // 移除未被替换的 {xxx} 占位符
        return value.replace(/\{[^{}]+\}/g, "");
      },
    },
  });

  const localesDir = path.join(__dirname, "..", "src", "locales");

  for (const locale of fs.readdirSync(localesDir)) {
    const filePath = path.join(localesDir, locale);
    const data = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(locale).slice(1).toLowerCase();
    const parsedData = ext === "yml" || ext === "yaml" ? yaml.load(data) : JSON.parse(data);
    i18next.addResourceBundle(locale.split(".")[0], "translation", parsedData, true, true);
  }

  const browser = await puppeteer.launch({
    headless: "new" as any,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--allow-file-access-from-files"],
  });

  try {
    const templatesPath = path.join(__dirname, "..", "template");
    const dataPath = path.join(__dirname, "..", "src", "docs", ".vitepress", "data");
    for (const languageTag of Object.keys(GraphqlLanguageEnum)) {
      for (const templateType of fs.readdirSync(templatesPath)) {
        for (const template of fs.readdirSync(path.join(templatesPath, templateType))) {
          if (template.endsWith(".ejs") && ["match", "player", "hero", "rank", "daily", "item"].some((targets) => template.startsWith(targets))) {
            const templateFile = path.join(templatesPath, templateType, template);
            if (templateType === "match") {
              const matchQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}.json`), "utf-8"));
              const constantsQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `constants_${languageTag}.json`), "utf-8"));
              const data = utils.getFormattedMatchData(matchQuery, constantsQuery);
              await renderImage({ data, languageTag, templateFile, template, browser });
            }
            if (templateType === "player") {
              const playerQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}.json`), "utf-8"));
              const playerExtraQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}ExtraInfo.json`), "utf-8"));
              const data = utils.getFormattedPlayerData({ playerQuery, playerExtraQuery });
              await renderImage({ data, languageTag, templateFile, template, browser });
              const miniPlayerData = Object.assign({}, playerQuery);
              const miniPlayerExtraData = Object.assign({}, playerExtraQuery);
              miniPlayerData.player.matches = miniPlayerData.player.matches.slice(0, 10);
              miniPlayerExtraData.player.heroesPerformance = miniPlayerExtraData.player.heroesPerformance.slice(0, 5);
              miniPlayerExtraData.player.dotaPlus = miniPlayerExtraData.player.dotaPlus.sort((a, b) => (a.level < b.level ? 1 : -1)).slice(0, 3);
              await renderImage({ data: utils.getFormattedPlayerData({ playerQuery: miniPlayerData, playerExtraQuery: miniPlayerExtraData }), languageTag, templateFile, template, browser, suffix: "mini" });
              const anonymousPlayerData = Object.assign({}, playerQuery);
              anonymousPlayerData.player.steamAccount.isAnonymous = true;
              anonymousPlayerData.player.matches = [];
              anonymousPlayerData.player.performance = null;
              anonymousPlayerData.player.heroesPerformance = [];
              const anonymousData = utils.getFormattedPlayerData({ playerQuery: anonymousPlayerData });
              await renderImage({ data: anonymousData, languageTag, templateFile, template, browser, suffix: "anonymous" });
            }
            if (templateType === "hero") {
              const heroIds = getRandomThree(Object.keys(dotaconstants.heroes));
              for (let i = 0; i < heroIds.length; i++) {
                const data = await utils.getFormattedHeroData(await queryHeroDetailsFromValve(Number(heroIds[i]), languageTag));
                await renderImage({ data, languageTag, templateFile, template, browser, suffix: i as any });
              }
            }
            if (templateType === "rank") {
              const data = Object.assign(JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}.json`), "utf-8")), { date: moment.utc("2025-01-01 00:00:00") });
              await renderImage({ data, languageTag, templateFile, template, browser, suffix: "up" });
              Object.assign(data, {
                isRising: false,
                prevRank: { medal: 2, star: 2 },
                currRank: { medal: 2, star: 1 },
              });
              await renderImage({ data, languageTag, templateFile, template, browser, suffix: "down" });
            }
            if (templateType === "report") {
              let titleKey = "dota2tracker.template.yesterdays_summary";
              const data = {
                ...JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}.json`), "utf-8")),
                title: i18next.t(titleKey, { lng: languageTag }),
              };
              await renderImage({ data, languageTag, templateFile, template, browser });
              await renderImage({ data: Object.assign(data, { showCombi: false }), languageTag, templateFile, template, browser, suffix: "hideCombi" });
            }
            if (templateType === "item") {
              const itemList = await utils.getFormattedItemListData(await queryItemListFromValve(languageTag));
              const item = Object.assign(
                await queryItemDetailsFromValve(125, languageTag),
                itemList.find((item) => item.id === 125)
              );
              if (templateFile.endsWith("item.ejs")) await renderImage({ data: item, languageTag, templateFile, template, browser });
              if (templateFile.endsWith("itemlist.ejs")) await renderImage({ data: itemList, languageTag, templateFile, template, browser });
            }
          }
        }
      }
    }
  } catch (error) {
    throw error;
  } finally {
    if (browser) browser.close();
  }
})();

// const fontPath = path.resolve(__dirname, "..", "src", "docs", "public", "fonts", "MiSans-VF.ttf");
// const fontData = fs.readFileSync(fontPath);
// const base64Font = fontData.toString("base64");
// const fontFaceCSS = `
// @font-face {
//   font-family: 'MiSans';
//   src: url('data:font/ttf;charset=utf-8;base64,${base64Font}') format('truetype-variations');
//   font-weight: 100 900;
//   font-stretch: 75% 100%;
//   font-style: normal;
//   font-display: swap;
// }`;

async function renderImage(params: { data: object; languageTag: string; templateFile: string; template: string; browser: Browser; suffix?: string[] | string }) {
  const { data, languageTag, templateFile, template, browser, suffix } = params;
  const imageFileName = [template.split(".")[0], ...(Array.isArray(suffix) ? suffix : [suffix])].filter((item) => item !== null && item !== undefined).join("-");

  const templateData = {
    data,
    utils,
    ImageType: utils.ImageType,
    ImageFormat: utils.ImageFormat,
    dotaconstants,
    moment: moment.utc,
    eh: (str: string) => {
      if (str == null) return "";
      return str.replace(/[&<>"']/g, function (match) {
        const escape = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return escape[match];
      });
    },
    $t: (key: string, param?: object) => i18next.t(key, { ...param, lng: languageTag }),
    languageTag,
    fontFamily: [`"小米兰亭"`, `"MiSans VF"`, `MiSans`],
  };
  const html = await ejs.renderFile(templateFile, templateData);
  // const html_fontInjected = html.replace("<head>", `<head><style>${fontFaceCSS}</style>`);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await Promise.all([
    page.evaluate(async () => {
      await document.fonts.ready;
      document.documentElement.classList.add("fonts-loaded");
    }),

    page.waitForNetworkIdle({
      idleTime: 500, // 500ms内没有网络请求
      timeout: 30000, // 最长等待30秒
    }),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // 获取页面的实际尺寸
  const dimensions = await page.evaluate(() => {
    const body = document.documentElement.getElementsByTagName("body")[0];
    return {
      width: body?.scrollWidth ?? 0,
      height: body?.scrollHeight ?? 0,
    };
  });

  // 重新设置视口
  await page.setViewport({
    deviceScaleFactor: 1.5,
    width: dimensions.width,
    height: dimensions.height,
  });

  const buffer = await page.screenshot({ type: "png", fullPage: true });
  // fs.writeFileSync(path.join(__dirname, "..", "src", "docs", "public", (languageTag == "zh-CN" ? "" : languageTag) as string, "generated", `${imageFileName}.html`), html_fontInjected);
  fs.writeFileSync(path.join(__dirname, "..", "src", "docs", "public", (languageTag == "zh-CN" ? "" : languageTag) as string, "generated", `${imageFileName}.png`), buffer);
  console.log(languageTag, imageFileName);
  await page.close();
}
enum valveLanguageTag {
  "zh-CN" = "schinese",
  "en-US" = "english",
}
async function queryHeroDetailsFromValve(heroId: number, languageTag = "zh-CN") {
  return JSON.parse(await httpGet(`https://www.dota2.com/datafeed/herodata?language=${valveLanguageTag[languageTag]}&hero_id=${heroId}`)).result.data.heroes[0];
}
async function queryItemListFromValve(languageTag = "zh-CN"): Promise<any[]> {
  return JSON.parse(await httpGet(`https://www.dota2.com/datafeed/itemlist?language=${valveLanguageTag[languageTag]}`)).result.data.itemabilities;
}
async function queryItemDetailsFromValve(itemId: number, languageTag = "zh-CN") {
  return JSON.parse(await httpGet(`https://www.dota2.com/datafeed/itemdata?language=${valveLanguageTag[languageTag]}&item_id=${itemId}`)).result.data.items[0];
}
async function queryLastPatchNumber(): Promise<string> {
  return JSON.parse(await httpGet("https://www.dota2.com/datafeed/patchnoteslist")).patches.at(-1).patch_number;
}

function httpGet(urlString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(urlString);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    protocol
      .get(urlString, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
function getRandomThree<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}
