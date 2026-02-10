import { Context, Random, Service } from "koishi";
import ejs from "ejs";
import fs from "node:fs";
import path from "node:path";
import { type Config } from "../../config";
import {} from "koishi-plugin-puppeteer";
import { type FontInfo } from "./font.service";
import { TemplateType } from "../common/types";
import { ImageFormat, ImageType } from "../common/types";
import { DateTime } from "luxon";
import { pathToFileURL } from "node:url";

export class ViewRenderer extends Service<Config> {
  private readonly templateDir: string;
  constructor(ctx: Context, currentDir: string) {
    super(ctx, "dota2tracker.image", true);
    this.config = ctx.config;
    this.templateDir = path.join(currentDir, "templates");
  }
  async renderToImageByFile(data: object, templateName: string, type: TemplateType, languageTag: string): Promise<string> {
    const html = await this.generateHTML(data, { source: "FILE", templateName, type }, languageTag);
    return this.render(html);
  }
  async renderToImageByEJSCode(data: object, ejsCode: string, languageTag: string): Promise<string> {
    const html = await this.generateHTML(data, { source: "CODE", code: ejsCode }, languageTag);
    return this.render(html);
  }
  async renderToImageByHTML(html: string): Promise<string> {
    return this.render(html);
  }
  private async render(html: string): Promise<string> {
    const { fonts } = this.config;
    const finalHtml = html.replace("</head>", `${this.getFontStyleBlock()}</head>`);
    
    // Construct font family list (flatten arrays and deduplicate)
    const fontFamilies = Array.from(new Set([
      ...(fonts.sans || []),
      ...(fonts.serif || []),
      ...(fonts.mono || [])
    ])).filter(Boolean);

    return this.ctx.puppeteer.render(
      finalHtml,
      fontFamilies.length === 0
        ? undefined
        : async (page, next) => {
            // --- Step A: (Node environment) Prepare ---
            let fontInfos: FontInfo[] = [];
            try {
              // Use internal FontService
              fontInfos = this.ctx.dota2tracker.font.getFonts(fontFamilies);
            } catch (e) {
              this.ctx.logger.warn("Failed to get font info, using fallback fonts:", e);
            }

            // --- Step B: (Browser environment) Inject fonts ---
            if (fontInfos.length > 0) {
              await page.exposeFunction("dota2tracker_font_service_get_format", (format: string) => {
                return this.ctx.dota2tracker.font.getFontFormat(format);
              });

              await page.evaluate(async (fonts: FontInfo[]) => {
                // @ts-ignore
                const win = window as any;

                const loaders = fonts.map(async (font: FontInfo) => {
                  const format = await win.dota2tracker_font_service_get_format(font.format);
                  
                  // pathToFileURL logic was removed in favor of standard URL if path is absolute?
                  // Puppeteer page.evaluate context cannot access Node's 'path' or 'url' modules.
                  // We should convert path to URL in Node context before passing to browser if needed.
                  // But 'font.path' comes from FontService. FontService stores absolute paths.
                  // Browser needs 'file://' URL or base64. 
                  // Previous implementation used 'font.path' directly which worked because Puppeteer allows local file access if configured?
                  // Wait, previous code used `url("${font.path}")`. `font.path` from `koishi-plugin-fonts` is absolute path.
                  // Puppeteer standard behavior usually requires file:// for local files.
                  // I will convert it to file URL in Node context to be safe/correct.
                  
                  const fontFace = new win.FontFace(font.family, `url("${font.path}") format("${format}")`, font.descriptors);
                  win.document.fonts.add(fontFace);
                  await fontFace.load();
                });

                await Promise.all(loaders);
                await win.document.fonts.ready;
              }, fontInfos.map(f => ({ ...f, path: pathToFileURL(f.path).href }))); // Convert to file URL here
            }

            // --- Step C: (Node environment) Screenshot ---
            const body = await page.$("body");
            return next(body);
          },
    );
  }
  private async generateHTML(data: object, template: { source: "FILE"; templateName: string; type: TemplateType } | { source: "CODE"; code: string }, languageTag: string) {
    const templateData = {
      data,
      ImageType,
      ImageFormat,
      dotaconstants: this.ctx.dota2tracker.dotaconstants,
      DateTime,
      $t: (key: string, params?: any) => this.ctx.dota2tracker.i18n.$t(languageTag, key, params),
      languageTag,
      Random,
      fontFamily: this.config.templateFonts.map((f) => `${f}`).join(", "),
      getImageUrl: this.getImageUrl.bind(this),
    };
    try {
      let html: string;
      if (template.source === "FILE") {
        const templatePath = path.join(this.templateDir, template.type, `${template.templateName}.ejs`);
        html = await ejs.renderFile(templatePath, templateData, {
          strict: false,
        });
      } else {
        html = await ejs.render(template.code, templateData, {
          strict: false,
          async: true,
        });
      }
      if (process.env.NODE_ENV === "development") fs.writeFileSync(path.resolve(process.cwd(), "temp.html"), html);
      return html;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  private getImageUrl(image: string, type: ImageType = ImageType.Local, format: ImageFormat = ImageFormat.png) {
    if (type === ImageType.Local) {
      try {
        const absolutePath = path.join(this.templateDir, "images", `${image}.${format}`);
        return pathToFileURL(absolutePath).href;
      } catch (error) {
        console.error(error);
        return "";
      }
    } else return `https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/${type}/${image}.${format}`;
  }

  // 1. 生成 CSS 注入块
  private getFontStyleBlock(): string {
    const { fonts } = this.config;

    // Helper to join font array with quotes
    const formatFontStack = (fontList: string[], fallback: string) => {
      const quoted = fontList.map(f => `"${f}"`).join(", ");
      return quoted ? `${quoted}, ${fallback}` : fallback;
    }

    const sans = formatFontStack(fonts.sans, 'sans-serif');
    const serif = formatFontStack(fonts.serif, 'serif');
    const mono = formatFontStack(fonts.mono, 'monospace');

    return `
    <style>
      /* 1. 定义 CSS 变量 (供原生 CSS 使用) */
      :root {
        --font-sans: ${sans};
        --font-serif: ${serif};
        --font-mono: ${mono};
      }

      /* 2. 暴力劫持 Tailwind 类 (供 Tailwind 使用) */
      /* 使用 !important 确保优先级最高，覆盖 Tailwind 默认生成的样式 */
      .font-sans { font-family: var(--font-sans) !important; }
      .font-serif { font-family: var(--font-serif) !important; }
      .font-mono { font-family: var(--font-mono) !important; }

      /* 3. 设置全局默认字体 */
      body {
        font-family: var(--font-sans);
      }
    </style>
    `;
  }
}

