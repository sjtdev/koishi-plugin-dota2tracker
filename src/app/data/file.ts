import { Context, Service } from "koishi";
import { Config } from "../../config";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";

export class FileService extends Service<Config> {
  private baseDir: string;

  constructor(ctx: Context) {
    super(ctx, "dota2tracker.file", true);
    this.config = ctx.config;
    this.baseDir = path.join(ctx.baseDir, "data", "dota2tracker");
    
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async readJSON(subDir: string, filename: string): Promise<any> {
    const targetPath = path.join(this.baseDir, subDir, filename);
    if (!existsSync(targetPath)) {
      return null;
    }
    try {
      const data = await fs.readFile(targetPath, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      this.logger.error(`Failed to read JSON file from ${targetPath}:`, e);
      return null;
    }
  }

  async writeJSON(subDir: string, filename: string, data: any): Promise<boolean> {
    const targetDir = path.join(this.baseDir, subDir);
    const targetPath = path.join(targetDir, filename);

    try {
      if (!existsSync(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
      }
      await fs.writeFile(targetPath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      this.logger.error(`Failed to write JSON file to ${targetPath}:`, e);
      return false;
    }
  }
}
