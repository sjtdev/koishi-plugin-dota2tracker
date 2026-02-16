import { Context, Service, Schema } from "koishi";
import path from "node:path";
import fs from "node:fs";
import fontkit from "fontkit";

const FontFormats = {
  WEB_OPEN_FONT_FORMAT: "woff",
  WEB_OPEN_FONT_FORMAT_2: "woff2",
  TRUE_TYPE_FONT: "ttf",
  OPEN_TYPE_FONT: "otf",
  SPLINE_FONT: "sfnt",
  TRUE_TYPE_COLLECTION: "ttc",
  GOOGLE_FONT: "google",
  MANIFEST: "manifest",
} as const;

export type FontFormat = (typeof FontFormats)[keyof typeof FontFormats];

export interface FontInfo {
  family: string;
  path: string;
  format: string;
  descriptors?: any;
}

export class FontService extends Service {
  private watcher: fs.FSWatcher;
  private debounceTimer: NodeJS.Timeout;
  private fonts: FontInfo[] = [];

  constructor(ctx: Context) {
    super(ctx, "dota2tracker.font", true);
    this.config = ctx.config;
    this.ctx.on("ready", async () => await this.initialize());
  }

  async initialize() {
    const fontsPath = path.resolve(this.ctx.baseDir, this.config.fontPath);

    // 1. 确保目录存在
    if (!fs.existsSync(fontsPath)) {
      try {
        fs.mkdirSync(fontsPath, { recursive: true });
      } catch (e) {
        this.logger.warn(`Failed to create font directory: ${e.message}`);
        return;
      }
    }

    // 2. 初次加载
    await this.loadFonts(fontsPath);

    // 3. 启动文件监听
    try {
      this.watcher = fs.watch(fontsPath, (eventType, filename) => {
        if (filename && /\.(ttf|otf|woff2?|ttc|sfnt)$/.test(filename)) {
          if (this.debounceTimer) clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            this.logger.debug(this.ctx.dota2tracker.i18n.gt("dota2tracker.logger.font_loader", { filename: "batch", eventType: "change" }));
            this.loadFonts(fontsPath);
          }, 200);
        }
      });
    } catch (e) {
      this.logger.warn(`Failed to watch font directory: ${e.message}`);
    }

    // 4. 清理逻辑
    this.ctx.on("dispose", () => {
      if (this.watcher) this.watcher.close();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
    });
  }

  private async loadFonts(fontsPath: string) {
    if (!fs.existsSync(fontsPath)) return;

    const newFonts: FontInfo[] = [];
    try {
      fs.readdirSync(fontsPath).forEach((file) => {
        if (!/\.(ttf|otf|woff2?|ttc|sfnt)$/.test(file)) return;
        const fullPath = path.join(fontsPath, file);

        try {
          const fontOrCollection = fontkit.openSync(fullPath);
          const parsedFonts = "fonts" in fontOrCollection ? fontOrCollection.fonts : [fontOrCollection];

          parsedFonts.forEach((font) => {
            const family = this.getFontFamily(font);
            const descriptors = this.getFontDescriptors(font);

            newFonts.push({
              path: fullPath,
              family,
              format: this.getFileFormat(file),
              descriptors,
            });
          });
        } catch (err) {
          this.logger.warn(`Failed to parse font ${file}: ${err.message}`);
        }
      });

      this.fonts = newFonts;

      const fontFamilies = Array.from(new Set(newFonts.map((f) => f.family))).sort();
      this.ctx.schema.set("dota2tracker.fonts", Schema.union(fontFamilies));
      this.logger.info(`Loaded ${newFonts.length} fonts from ${fontsPath}`);
    } catch (e) {
      this.ctx.logger.warn(`Failed to load fonts: ${e.message}`);
    }
  }

  getFonts(families: string[]): FontInfo[] {
    const uniquePaths = new Set<string>();
    const result: FontInfo[] = [];

    // Deduplicate input families just in case
    const uniqueFamilies = Array.from(new Set(families));

    for (const family of uniqueFamilies) {
      // Find fonts that match the family name
      const matched = this.fonts.filter((f) => f.family === family);

      for (const font of matched) {
        if (!uniquePaths.has(font.path)) {
          uniquePaths.add(font.path);
          result.push(font);
        }
      }
    }
    return result;
  }

  private getFontFamily(font: any): string {
    const records = font.name?.records;
    if (records?.preferredFamily) {
      const langKeys = Object.keys(records.preferredFamily);
      const enKey = langKeys.find((k) => k.startsWith("en"));
      if (enKey) return records.preferredFamily[enKey];
      if (langKeys.length > 0) return records.preferredFamily[langKeys[0]];
    }
    return font.familyName;
  }

  private getFontDescriptors(font: any): any {
    const descriptors: any = {};
    if (font.usWeightClass) {
      descriptors.weight = font.usWeightClass.toString();
    } else if (font["OS/2"] && font["OS/2"].usWeightClass) {
      descriptors.weight = font["OS/2"].usWeightClass.toString();
    }
    if (font.italicAngle && font.italicAngle !== 0) {
      descriptors.style = "italic";
    }
    const widthClass = font["OS/2"]?.usWidthClass;
    if (widthClass) {
      const widthMap: Record<number, string> = {
        1: "ultra-condensed",
        2: "extra-condensed",
        3: "condensed",
        4: "semi-condensed",
        5: "normal",
        6: "semi-expanded",
        7: "expanded",
        8: "extra-expanded",
        9: "ultra-expanded",
      };
      if (widthMap[widthClass] && widthMap[widthClass] !== "normal") {
        descriptors.stretch = widthMap[widthClass];
      }
    }
    return descriptors;
  }

  private getFileFormat(fileName: string): string {
    return path.extname(fileName).slice(1);
  }

  getFontFormat(format: string): string {
    const formatMap: Record<string, string> = {
      [FontFormats.TRUE_TYPE_FONT]: "truetype",
      [FontFormats.OPEN_TYPE_FONT]: "opentype",
      [FontFormats.WEB_OPEN_FONT_FORMAT]: "woff",
      [FontFormats.WEB_OPEN_FONT_FORMAT_2]: "woff2",
      [FontFormats.TRUE_TYPE_COLLECTION]: "collection",
      [FontFormats.SPLINE_FONT]: "sfnt",
    };
    return formatMap[format] || format;
  }
}
