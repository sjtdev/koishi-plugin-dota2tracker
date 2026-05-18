import { Context, Service } from "koishi";
import { Config } from "../../config";

export class StaticDataService extends Service<Config> {
  private inFlightRequests: Map<string, Promise<any[]>> = new Map();

  constructor(ctx: Context) {
    super(ctx, "dota2tracker.staticData", true);
    this.config = ctx.config;
    this.logger = ctx.logger("dota2tracker.staticData");
  }

  getPatchNotes(languageTag: string, onDownloadingStalePatch?: () => void): Promise<any[]> {
    const cacheKey = languageTag;
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    const promise = this._getPatchNotes(languageTag, onDownloadingStalePatch).finally(() => {
      this.inFlightRequests.delete(cacheKey);
    });

    this.inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  private async _getPatchNotes(languageTag: string, onDownloadingStalePatch?: () => void): Promise<any[]> {
    const patchesList = await this.ctx.dota2tracker.valveAPI.queryPatchList();
    if (!patchesList || patchesList.length === 0) return [];

    const latestPatch = patchesList[patchesList.length - 1];
    const latestMajorMatch = latestPatch.patch_name.match(/^(\d+\.\d+)/);
    if (!latestMajorMatch) return [];
    
    const targetPatches = [];
    const collectedMajors = new Set<string>();

    // 从最新的小版本开始往前遍历，收集用户配置的的大版本数下所有的连续小版本
    for (let i = patchesList.length - 1; i >= 0; i--) {
      const p = patchesList[i];
      const majorMatch = p.patch_name.match(/^(\d+\.\d+)/);
      if (!majorMatch) continue;
      
      collectedMajors.add(majorMatch[1]);
      if (collectedMajors.size > this.config.patchNotesRetrievalDepth) {
        break;
      }
      
      targetPatches.push(p);
    }
    
    // 恢复正向时间顺序（由旧到新）
    targetPatches.reverse();
    
    const result = [];
    const latestPatchNumber = latestPatch.patch_number;

    let hasFiredCallback = false;

    for (const p of targetPatches) {
      const isLatest = p.patch_number === latestPatchNumber;
      let notes = null;
      const fileName = `${p.patch_number}-${languageTag}.json`;
      
      if (isLatest) {
        // 最新版本日志认为不可信，存入缓存
        notes = await this.ctx.dota2tracker.cache.getPatchNoteCache(fileName);
        if (!notes) {
          notes = await this.ctx.dota2tracker.valveAPI.queryPatchNotes(p.patch_number, languageTag);
          if (notes && notes.success) {
            this.ctx.dota2tracker.cache.setPatchNoteCache(fileName, notes);
          }
        }
      } else {
        // 旧版本的固化日志，存入 FileService 持久化本地文件
        notes = await this.ctx.dota2tracker.file.readJSON("raw_data/patch_notes", fileName);
        if (!notes) {
          if (!hasFiredCallback && onDownloadingStalePatch) {
            onDownloadingStalePatch();
            hasFiredCallback = true;
          }
          notes = await this.ctx.dota2tracker.valveAPI.queryPatchNotes(p.patch_number, languageTag);
          if (notes && notes.success) {
            await this.ctx.dota2tracker.file.writeJSON("raw_data/patch_notes", fileName, notes);
          }
        }
      }
      
      if (notes) {
        result.push(notes);
      }
    }

    return result;
  }
}
