import path from "path";
import fs from "fs";
import ejs from "ejs";
import * as utils from "../src/utils";
// import { GraphqlLanguageEnum } from "../src/index";
import * as dotaconstants from "dotaconstants";
import moment from "moment";
import i18next from "i18next";
import yaml from "js-yaml";
import puppeteer from "puppeteer";

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
    const data = fs.readFileSync(path.join(localesDir, locale), "utf8");
    const ext = path.extname(locale).slice(1).toLowerCase();
    const parsedData = ext === "yml" || ext === "yaml" ? yaml.load(data) : JSON.parse(data);

    // 不需要再取 dota2tracker 下的内容，而是直接使用整个解析后的数据
    i18next.addResourceBundle(
      locale.split(".")[0], // 语言代码
      "translation", // 使用默认命名空间
      parsedData, // 整个解析后的数据
      true, // deep merge
      true // overwrite
    );
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  try {
    const templatesPath = path.join(__dirname, "..", "template");
    const dataPath = path.join(__dirname, "..", "src", "docs", ".vitepress", "data");
    for (const languageTag of Object.keys(GraphqlLanguageEnum)) {
      for (const templateType of fs.readdirSync(templatesPath)) {
        for (const template of fs.readdirSync(path.join(templatesPath, templateType))) {
          if (template.endsWith(".ejs") && ["match"].some((targets) => template.startsWith(targets))) {
            const templateFile = fs.readFileSync(path.join(templatesPath, templateType, template), "utf-8");
            let data: object;
            if (templateType === "match") {
              const matchQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `${templateType}.json`), "utf-8"));
              const constantsQuery = JSON.parse(fs.readFileSync(path.join(dataPath, `constants_${languageTag}.json`), "utf-8"));
              data = utils.getFormattedMatchData(matchQuery, constantsQuery);
            }
            if (templateType === "player") {
            }
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
            const html = await ejs.render(templateFile, templateData, { async: true });

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
            fs.writeFileSync(path.join(__dirname, "..", "src", "docs", "public", (languageTag == "zh-CN" ? "" : languageTag) as string, "images", "generated", `${template}-result.png`), buffer);
            console.log(template, dimensions);
            await page.close();
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
