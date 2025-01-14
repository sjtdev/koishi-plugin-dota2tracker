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
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const templatesPath = path.join(__dirname, "..", "template");
    const dataPath = path.join(__dirname, "..", "src", "docs", ".vitepress", "data");
    for (const languageTag of Object.keys(GraphqlLanguageEnum)) {
      for (const templateType of fs.readdirSync(templatesPath)) {
        for (const template of fs.readdirSync(path.join(templatesPath, templateType))) {
          if (template.endsWith(".ejs") && ["player"].some((targets) => template.startsWith(targets))) {
            // const templateFile = fs.readFileSync(path.join(templatesPath, templateType, template), "utf-8");
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
              const anonymousPlayerQuery = Object.assign({}, playerQuery);
              anonymousPlayerQuery.player.steamAccount.isAnonymous = true;
              anonymousPlayerQuery.player.matches = [];
              anonymousPlayerQuery.player.performance = null;
              anonymousPlayerQuery.player.heroesPerformance = [];
              const anonymousData = utils.getFormattedPlayerData({ playerQuery: anonymousPlayerQuery });
              await renderImage({ data: anonymousData, languageTag, templateFile, template, browser, imageFileName: "player_1-anonymous" });
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

async function renderImage(params: { data: object; languageTag: string; templateFile: string; template: string; browser: Browser; imageFileName?: string }) {
  const { data, languageTag, templateFile, template, browser, imageFileName } = params;

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
  };
  const html = await ejs.renderFile(templateFile, templateData);

  const page = await browser.newPage();
  await page.setContent(html);
  // 等待网络空闲，确保大部分资源加载完成
  await page.waitForNetworkIdle({
    idleTime: 500, // 500ms内没有网络请求
    timeout: 5000, // 最长等待5秒
  });
  await page.evaluate(() => {
    return new Promise((resolve) => {
      // 等待页面所有资源加载完成
      if (document.readyState === "complete") {
        resolve(null);
      } else {
        window.addEventListener("load", resolve);
      }
    });
  });
  // 获取页面的实际尺寸
  const dimensions = await page.evaluate(() => {
    const body = document.documentElement;
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
  // fs.writeFileSync(path.join(__dirname, "..", "public", (languageTag == "zh-CN" ? "" : languageTag) as string, "images", `${template}-result.html`), html);
  fs.writeFileSync(path.join(__dirname, "..", "src", "docs", "public", (languageTag == "zh-CN" ? "" : languageTag) as string, "generated", `${imageFileName ?? template.split(".")[0]}.png`), buffer);
  console.log(template, dimensions);
  await page.close();
}
