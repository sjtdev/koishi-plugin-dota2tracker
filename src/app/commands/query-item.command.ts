import { Context } from "koishi";
import { TemplateType } from "../common/types";
import { TaskMessenger } from "./_helper";
import { handleError } from "../common/error";

export function registerQueryItemCommand(ctx: Context) {
  const name = "query-item";
  const logger = ctx.logger("command/" + name);

  ctx
    .command(`dota2tracker.${name} <input_data>`)
    .alias("查询物品")
    .action(async ({ session }, input_data) => {
      const task = new TaskMessenger(session, { autoRecall: ctx.config.autoRecallTips });

      // 1. 【卫语句】优先处理 "无输入且不允许显示列表" 的情况
      // 这种情况不需要 TaskMessenger，直接报错并退出
      if (!input_data && !ctx.config.showItemListAtTooMuchItems) {
        await session.send(session.text(".empty_input"));
        return;
      }

      // 到这里说明：要么有输入，要么配置允许显示列表

      try {
        // 2. 统一启动 Loading
        await task.send(session.text(".querying_item"));

        // 3. 统一获取基础数据 (语言 & 列表)
        const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
        const itemList = await ctx.dota2tracker.item.getItemList({ languageTag, onCacheMissTip: () => task.send(session.text(".cache_building")) });

        // 4. 分支处理：渲染全量列表 OR 搜索物品
        if (!input_data) {
          // --- 分支 A: 无输入 -> 显示全量列表 ---
          const image = await ctx.dota2tracker.view.renderToImageByFile(itemList, "itemlist", TemplateType.Item, languageTag);

          await task.finish(); // ✅ 渲染完成，撤回
          await session.send(image);
          return; // 结束
        }

        // --- 分支 B: 有输入 -> 进行搜索 ---
        const matchedItemList = ctx.dota2tracker.item.searchItems(itemList, input_data, languageTag, ctx.config);

        // 5. 处理搜索结果
        if (matchedItemList.length === 0) {
          await task.finish();
          await session.send(session.text(".not_found"));
          return;
        }

        if (matchedItemList.length > ctx.config.maxSendItemCount) {
          await task.finish(); // 先撤回 Loading
          await session.send(session.text(".too_many_items", { count: matchedItemList.length, max: ctx.config.maxSendItemCount }));

          if (ctx.config.showItemListAtTooMuchItems) {
            // 这里重新生成一次搜索结果列表的图
            const image = await ctx.dota2tracker.view.renderToImageByFile(matchedItemList, "itemlist", TemplateType.Item, languageTag);
            await session.send(image);
          }
          return;
        }

        // 6. 正常发送详情
        await task.finish(); // 先撤回 Loading
        await session.send(session.text(".finded_items", { items: matchedItemList }));

        for (const basicItemInfo of matchedItemList) {
          try {
            const itemDetails = await ctx.dota2tracker.item.getItemDetails(basicItemInfo.id, languageTag);
            const finalItemData = { ...itemDetails, ...basicItemInfo };
            const image = await ctx.dota2tracker.view.renderToImageByFile(finalItemData, "item", TemplateType.Item, languageTag);
            await session.send(image);
          } catch (error) {
            ctx.logger.error(`查询物品[${basicItemInfo.name_loc}]详情失败:`, error);
            await session.send(session.text(".query_item_failed", { name: basicItemInfo.name_loc }));
          }
        }
      } catch (error) {
        await task.finish(); // 确保撤回
        handleError(error, logger, ctx.dota2tracker.i18n, ctx.config);
        return session.text(".query_list_failed");
      }
    });
}
