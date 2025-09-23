import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { Config } from "../../config";

export function registerQueryItemCommand(ctx: Context) {
  ctx
    .command("dota2tracker.query-item")
    .alias("查询物品")
    .action(async ({ session }, input_data) => {
      // 1. 处理无输入的情况
      if (!input_data) {
        // 根据配置决定是提示，还是直接显示列表
        if (ctx.config.showItemListAtTooMuchItems) {
          await session.send(session.text(".querying_item"));
          const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
          const allItems = await ctx.dota2tracker.item.getItemList({ languageTag, onCacheMissTip: () => session.send(session.text(".cache_building")) });
          const image = await ctx.dota2tracker.image.renderToImageByFile(allItems, "itemlist", TemplateType.Item, languageTag);
          await session.send(image);
        } else {
          await session.send(session.text(".empty_input"));
        }
        return;
      }

      await session.send(session.text(".querying_item"));
      const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });

      // 2. 获取物品列表并搜索
      const itemList = await ctx.dota2tracker.item.getItemList({ languageTag, onCacheMissTip: () => session.send(session.text(".cache_building")) });
      const matchedItemList = ctx.dota2tracker.item.searchItems(itemList, input_data, languageTag, ctx.config);

      // 3. 处理搜索结果
      // 3.1 未找到任何物品
      if (matchedItemList.length === 0) {
        await session.send(session.text(".not_found"));
        return;
      }

      // 3.2 找到过多物品
      if (matchedItemList.length > ctx.config.maxSendItemCount) {
        await session.send(session.text(".too_many_items", { count: matchedItemList.length, max: ctx.config.maxSendItemCount }));
        // 根据配置决定是否显示部分匹配的列表
        if (ctx.config.showItemListAtTooMuchItems) {
          const image = await ctx.dota2tracker.image.renderToImageByFile(matchedItemList, "itemlist", TemplateType.Item, languageTag);
          await session.send(image);
        }
        return;
      }

      // 4. 正常处理：查询详情并逐个发送
      await session.send(session.text(".finded_items", { items: matchedItemList }));

      for (const basicItemInfo of matchedItemList) {
        try {
          // 调用 service 获取单个物品的详细数据
          const itemDetails = await ctx.dota2tracker.item.getItemDetails(basicItemInfo.id, languageTag);

          // 将基础信息和详情信息合并（如果需要的话，例如基础信息中有别名等详情API没有的数据）
          const finalItemData = { ...itemDetails, ...basicItemInfo };

          // 调用 renderer 生成图片
          const image = await ctx.dota2tracker.image.renderToImageByFile(finalItemData, "item", TemplateType.Item, languageTag);
          await session.send(image);
        } catch (error) {
          ctx.logger.error(`查询物品[${basicItemInfo.name_loc}]详情失败:`, error);
          await session.send(session.text(".query_item_failed", { name: basicItemInfo.name_loc }));
        }
      }
    });
}
