import { Context, Random, Service } from "koishi";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { type Config } from "../../config";
import {} from "koishi-plugin-puppeteer";
import { TemplateType } from "../common/types";

import * as dotaconstants from "dotaconstants";
import { ImageFormat, ImageType } from "../common/types";
import { DateTime } from "luxon";

export class ImageRenderer extends Service<Config> {
  constructor(
    ctx: Context,
    private pluginDir: string,
  ) {
    super(ctx, "dota2tracker.image", true);
    this.config = ctx.config;
  }
  async renderToImageByFile(data: object, templateName: string, type: TemplateType, languageTag: string): Promise<string> {
    const html = await this.generateHTML(data, { source: "FILE", templateName, type }, languageTag);
    return this.ctx.puppeteer.render(html);
  }
  async renderToImageByEJSCode(data: object, ejsCode: string, languageTag: string): Promise<string> {
    const html = await this.generateHTML(data, { source: "CODE", code: ejsCode }, languageTag);
    return this.ctx.puppeteer.render(html);
  }
  async renderToImageByHTML(html: string): Promise<string> {
    return this.ctx.puppeteer.render(html);
  }
  private async generateHTML(data: object, template: { source: "FILE"; templateName: string; type: TemplateType } | { source: "CODE"; code: string }, languageTag: string) {
    const templateData = {
      data,
      ImageType,
      ImageFormat,
      dotaconstants,
      DateTime,
      $t: (key: string, params?: any) => this.ctx.dota2tracker.i18n.$t(languageTag, key, params),
      languageTag,
      Random,
      fontFamily: this.config.templateFonts.map(f => `${f}`).join(", "),
      getImageUrl: this.getImageUrl.bind(this),
    };
    try {
      let html: string;
      if (template.source === "FILE") {
        const templatePath = path.join(this.pluginDir, "template", template.type, `${template.templateName}.ejs`);
        html = await ejs.renderFile(templatePath, templateData, {
          strict: false,
        });
      } else {
        html = await ejs.render(template.code, templateData, {
          strict: false,
          async: true,
        });
      }
      if (process.env.NODE_ENV === "development") fs.writeFileSync(path.join(this.pluginDir, "temp.html"), html);
      return html;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  private getImageUrl(image: string, type: ImageType = ImageType.Local, format: ImageFormat = ImageFormat.png) {
    if (type === ImageType.Local) {
      try {
        if (format === ImageFormat.svg) return fs.readFileSync(path.join(this.pluginDir, "template", "images", `${image}.svg`));
        const imageData = fs.readFileSync(path.join(this.pluginDir, "template", "images", `${image}.${format}`));
        const base64Data = imageData.toString("base64");
        return `data:image/png;base64,${base64Data}`;
      } catch (error) {
        console.error(error);
        return "";
      }
    } else return `https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/${type}/${image}.${format}`;
  }
}
