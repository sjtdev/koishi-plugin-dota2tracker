import { Config } from "../../config";
import { ItemList } from "../data/types";
import { Context, Service } from "koishi";

export  class ItemService extends Service<Config> {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.item", true);
    this.config = ctx.config;
  }

  async getItemDetails(itemId: number, languageTag: string) {
    return await this.ctx.dota2tracker.valveAPI.queryItemDetailsFromValve(itemId, languageTag);
  }

  async getItemList({ languageTag, onCacheMissTip }: { languageTag: string; onCacheMissTip: () => Promise<any> }): Promise<ItemList> {
    const currentGameVersion = await this.ctx.dota2tracker.valveAPI.queryLastPatchNumber();
    // Step 1: 读取物品列表缓存
    let itemList: ItemList;
    const cache = await this.ctx.dota2tracker.cache.getItemListConstants(languageTag);
    try {
      // Step 1.1: 检测缓存状态，判断是否需要重新获取
      if (!cache || cache.gameVersion != currentGameVersion) {
        await onCacheMissTip?.();
        itemList = ItemService.getFormattedItemListData(await this.ctx.dota2tracker.valveAPI.queryItemListFromValve(languageTag));
        this.ctx.dota2tracker.cache.cacheItemListConstants(languageTag, itemList, currentGameVersion);
      } else {
        itemList = cache.itemList;
      }
    } catch (error) {
      throw error;
    }
    return itemList;
  }
  public static getFormattedItemListData(rawItems): ItemList {
    // 预处理阶段：去除item_前缀并创建ID映射表
    const processItemName = (name: string) => name.replace(/^item_/i, "").replace(/^recipe_/i, "recipe_"); // 保留recipe前缀

    const [recipes, items] = rawItems.reduce(
      (acc, item) => {
        const processed = {
          ...item,
          name: processItemName(item.name),
          name_loc: item.name_loc,
          name_english_loc: item.name_english_loc,
        };
        item.name.includes("_recipe_") ? acc[0].push(processed) : acc[1].push(processed);
        return acc;
      },
      [[], []] as [any[], any[]],
    );

    // 创建ID到物品对象的映射表
    const itemMap = new Map<number, any>();
    items.concat(recipes).forEach((item) =>
      itemMap.set(item.id, {
        id: item.id,
        name: item.name,
        name_loc: item.name_loc,
      }),
    );

    // 第一阶段：合并基础物品与配方
    const processedItems = items.map((baseItem) => {
      const recipe = recipes.find((r) => r.name === `recipe_${baseItem.name.replace("item_", "")}`);

      return {
        ...baseItem,
        recipes: (recipe?.recipes || baseItem.recipes).map((recipe) => ({
          ...recipe,
          // 转换ID数组为对象数组
          items: recipe.items.map((id) => itemMap.get(id)).filter(Boolean),
        })),
        required_recipe: recipe ? !!recipe.name_loc.trim() : false,
        builds_into: [],
      };
    });

    // 第二阶段：构建合成关系映射表（存储对象）
    const buildsIntoMap = new Map<number, any[]>();
    processedItems.forEach((item) => {
      item.recipes.forEach((recipe) => {
        recipe.items.forEach((material) => {
          // 这里material已经是对象
          if (!buildsIntoMap.has(material.id)) {
            buildsIntoMap.set(material.id, []);
          }
          // 存入完整的物品对象
          buildsIntoMap.get(material.id).push(itemMap.get(item.id));
        });
      });
    });

    // 第三阶段：转换最终结构
    return processedItems.map((item) => ({
      ...item,
      builds_into: (buildsIntoMap.get(item.id) || []).map((target) => ({
        id: target.id,
        name: target.name,
        name_loc: target.name_loc,
      })),
    }));
  }

  public searchItems(items: ItemList, keyword: string, languageTag: string, config: Config): ItemList {
    if (!keyword) return [];
    const alias = this.ctx.dota2tracker.i18n.getConstantLocale(languageTag).dota2tracker.items_alias?.[keyword] ?? config.customItemAlias.filter((cia) => cia.alias == keyword).map((cia) => cia.keyword);
    // 优先检查完全匹配项（不区分大小写和前后空格）
    const exactMatch = items.filter(
      (item) => alias?.some((a) => item.name_loc.trim().toLowerCase() == a.toLowerCase()) || item.name_loc.trim().toLowerCase() === keyword.trim().toLowerCase() || (Number.isInteger(Number(keyword)) && item.id === Number(keyword)),
    );
    if (exactMatch.length) return exactMatch;

    return this.fuzzySearchItems(alias.length ? alias : [keyword], items);
  }

  private fuzzySearchItems(keywords: string[], items: ItemList) {
    const resultMap = new Map<number, ItemList[number]>();

    if (!keywords.length) return [];

    // 遍历物品列表
    for (const item of items) {
      // 预处理物品名称
      const cleanName = item.name_loc
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "")
        .trim();

      let matchAllKeywords = true;

      // 检查是否匹配所有关键词
      for (const keyword of keywords) {
        // 预处理关键词
        const cleanKeyword = keyword
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]/gu, "")
          .trim();

        // 空关键词跳过
        if (cleanKeyword.length === 0) continue;

        // 核心匹配逻辑
        const keywordChars = Array.from(cleanKeyword);
        const isMatched =
          // 完全连续匹配（如"水剑"）
          cleanName.includes(cleanKeyword) ||
          // 包含所有字符（如同时有"水"和"剑"）
          keywordChars.every((c) => cleanName.includes(c));

        // 发现任一关键词不匹配则终止检查
        if (!isMatched) {
          matchAllKeywords = false;
          break;
        }
      }

      // 满足所有关键词时加入结果
      if (matchAllKeywords) {
        resultMap.set(item.id, item);
      }
    }

    return Array.from(resultMap.values());
  }
}
