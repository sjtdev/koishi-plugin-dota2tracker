import { Context, Service, Session } from "koishi";
import * as graphql from "../../@types/graphql-generated";
import { MatchInfoEx, PlayerInfoExInMatch, PlayerInfoEx } from "../data/types";
import * as dotaconstants from "dotaconstants";
import { sec2time, formatNumber } from "../common/utils";
import { HeroService } from "./hero.service";

export class MatchService extends Service {
  constructor(
    ctx: Context,
    private pluginVersion: string,
  ) {
    super(ctx, "dota2tracker.match", true);
  }

  public async getMatchResult({
    matchId,
    requestParse,
    requsetOpenDota,
  }: {
    matchId: number;
    requestParse?: boolean;
    requsetOpenDota?: boolean;
  }): Promise<{ status: "READY"; matchData: graphql.MatchInfoQuery } | { status: "PENDING"; matchId: number } | { status: "NOT_FOUND" }> {
    const matchQuery = await this.getMatchData(matchId);
    if (matchQuery) {
      // 未解析 & 请求解析 & 存在 cron
      if (!MatchService.isMatchParsed(matchQuery) && requestParse && this.ctx.cron) {
        if (requsetOpenDota) {
          const odMatchQuery = await this.getOpenDotaMatchData(matchId);
          if (odMatchQuery) {
            return {
              status: "READY",
              matchData: odMatchQuery,
            };
          }
        }
        return {
          status: "PENDING",
          matchId,
        };
      }

      return {
        status: "READY",
        matchData: matchQuery,
      };
    }
    return {
      status: "NOT_FOUND",
    };
  }

  public async generateMatchData(rawMatchData: graphql.MatchInfoQuery, languageTag: string) {
    return await this.formatMatchData(rawMatchData, languageTag);
  }

  private async getMatchData(matchId: number) {
    try {
      let queryLocal = await this.ctx.dota2tracker.cache.getMatchCache(matchId);
      let matchQuery: graphql.MatchInfoQuery;
      if (queryLocal?.data && queryLocal.pluginVersion == this.pluginVersion) {
        matchQuery = queryLocal.data;
        this.ctx.dota2tracker.cache.setMatchCache(matchId, matchQuery, this.pluginVersion);
      } else {
        matchQuery = await this.ctx.dota2tracker.stratzAPI.queryMatchInfo(matchId);
        if (MatchService.isMatchParsed(matchQuery)) {
          this.ctx.dota2tracker.cache.setMatchCache(matchId, matchQuery, this.pluginVersion);
        }
      }
      return matchQuery;
    } catch (error) {
      this.ctx.dota2tracker.cache.deleteMatchCache(matchId);
      throw error;
    }
  }

  private async getOpenDotaMatchData(matchId: number): Promise<graphql.MatchInfoQuery> {
    const odMatch = await this.ctx.dota2tracker.opendotaAPI.queryMatchInfo(matchId);
    if (odMatch?.od_data?.has_parsed) {
      const odMatchQuery = { match: this.ctx.dota2tracker.opendotaAdapter.transform(odMatch) };
      this.ctx.dota2tracker.cache.setMatchCache(matchId, odMatchQuery, this.pluginVersion);
      return odMatchQuery;
    }
  }

  private async formatMatchData(matchQuery: graphql.MatchInfoQuery, languageTag: string): Promise<MatchInfoEx> {
    try {
      // Step 3: 检查Constants缓存
      let constantsQuery: graphql.ConstantsQuery = await this.ctx.dota2tracker.cache.getFacetConstantsCache(languageTag);
      const isFromOpenDota = (matchQuery.match as any)?.odParsed === true;

      // 定义一个变量来决定是否需要重新获取 constants
      let needsRefetch = false;

      if (!constantsQuery) {
        // 1. 如果缓存本身就为空，则必须获取
        needsRefetch = true;
      } else if (!isFromOpenDota) {
        // 2. 如果数据源是 Stratz，则进行版本校验
        if (!matchQuery.constants?.gameVersions?.[0]?.id || !constantsQuery.constants?.gameVersions?.[0]?.id || matchQuery.constants.gameVersions[0].id !== constantsQuery.constants.gameVersions[0].id) {
          needsRefetch = true;
        }
      }
      // (如果数据源是 OpenDota，且缓存存在，则 needsRefetch 保持 false，直接使用缓存)

      if (needsRefetch) {
        constantsQuery = await this.ctx.dota2tracker.stratzAPI.queryConstants(languageTag);
      }
      const facetData = await MatchService.constantsInjectFacetData(constantsQuery, matchQuery, languageTag, this.ctx.dota2tracker.hero);
      this.ctx.dota2tracker.cache.setFacetConstantsCache(languageTag, constantsQuery);
      // Step 4: 扩展比赛数据
      const match = MatchService.extendMatchData(matchQuery, facetData);
      return match;
    } catch (error) {
      // 查询失败时删除缓存
      this.ctx.dota2tracker.cache.deleteFacetConstantsCache(languageTag);
      throw error;
    }
  }

  public static async constantsInjectFacetData(constantsQuery: graphql.ConstantsQuery, matchQuery: graphql.MatchInfoQuery, languageTag: string, heroService?: HeroService) {
    const facetData = {};
    for (let player of (matchQuery.match as MatchInfoEx).players) {
      // 命石处理
      if (player.variant != null) {
        const constantsFacet = constantsQuery.constants.facets.find((facet) => facet.id === player.hero.facets[player.variant - 1]?.facetId || facet.name === player.hero.facets[player.variant - 1]?.name);

        let displayName = constantsFacet?.language?.displayName;
        if (!displayName && heroService) {
          const valveFacet = (await heroService.getHeroDetails(player.hero.id, languageTag)).facets.find((facet) => facet.index === player.variant - 1);

          constantsFacet.language.displayName = valveFacet.title_loc;
          constantsFacet.name = valveFacet.name;
          constantsFacet.icon = valveFacet.icon;
        }
        facetData[player.steamAccountId] = { id: constantsFacet.id, name: constantsFacet.name, icon: constantsFacet.icon, color: constantsFacet.color, displayName: constantsFacet.language?.displayName };
      }
    }
    return facetData;
  }

  // 对比赛数据进行补充以供生成模板函数使用
  public static extendMatchData(matchQuery: graphql.MatchInfoQuery, facetData: Record<string, PlayerInfoExInMatch["facet"]>): MatchInfoEx {
    const match = matchQuery.match as MatchInfoEx;
    // if (!match.parsedDateTime)
    //     return match;
    // ↓ 累加团队击杀数，并初始化团队[总对英雄造成伤害]与[总受到伤害]
    // 获取到的团队击杀数是每分钟击杀数的数组，需要累加计算，由radiantKills/direKills累加计算存为match.radiant.KillsCount/match.dire.KillsCount
    const matchParsed = MatchService.isMatchParsed(matchQuery);
    ["radiant", "dire"].forEach((team) => {
      match[team] = { killsCount: match?.[team + "Kills"]?.reduce((acc: number, cva: number) => acc + cva, 0) ?? 0, damageReceived: 0, heroDamage: 0, networth: 0, experience: 0 };
    });
    // 未解析比赛时radiantKills/direKills为null，需要遍历玩家数组
    if (!matchParsed) {
      match.players.reduce((acc, player) => {
        if (player.isRadiant) {
          acc.radiant.killsCount += player.kills;
        } else {
          acc.dire.killsCount += player.kills;
        }
        return acc;
      }, match);
    }
    // 定义开黑小队相关变量
    match.party = {};
    let party_index = 0;
    const party_mark = ["I", "II", "III", "IV"];
    // 定义禁选相关变量并填充禁用英雄模板
    let heroOrderList = {};
    for (let hero of match.pickBans ?? []) {
      if (hero.isPick) heroOrderList[hero.heroId] = hero.order;
    }
    // 对线模块
    // 定义对线情况处理函数----对线情况枚举一共有五种结果，根据这五种结果判断对线情况
    let processLaneOutcome = function (outcome) {
      switch (outcome) {
        case "RADIANT_VICTORY":
          return { radiant: "advantage", dire: "disadvantage" };
        case "RADIANT_STOMP":
          return { radiant: "stomp", dire: "stomped" };
        case "DIRE_VICTORY":
          return { radiant: "disadvantage", dire: "advantage" };
        case "DIRE_STOMP":
          return { radiant: "stomped", dire: "stomp" };
        default:
          return { radiant: "tie", dire: "tie" };
      }
    };
    // 对线结果存储变量
    const laneResult = { top: {}, mid: {}, bottom: {} };
    laneResult.top = processLaneOutcome(match.topLaneOutcome);
    laneResult.mid = processLaneOutcome(match.midLaneOutcome);
    laneResult.bottom = processLaneOutcome(match.bottomLaneOutcome);

    // 遍历所有玩家，为需要的数据进行处理
    match.players.forEach((player: PlayerInfoExInMatch) => {
      // 储存玩家所属队伍（字符串类型非队伍对象）
      player.team = player.isRadiant ? "radiant" : "dire";
      // 储存玩家分段
      player.rank = {
        medal: parseInt(player.steamAccount.seasonRank?.toString().split("")[0] ?? 0),
        star: parseInt(player.steamAccount.seasonRank?.toString().split("")[1] ?? 0),
        leaderboard: player.steamAccount.seasonLeaderboardRank,
        inTop100: player.steamAccount.seasonLeaderboardRank ? (player.steamAccount.seasonLeaderboardRank <= 10 ? "8c" : player.steamAccount.seasonLeaderboardRank <= 100 ? "8b" : undefined) : undefined,
      };
      // 参战率与参葬率
      player.killContribution = (player.kills + player.assists) / match[player.team].killsCount;
      player.deathContribution = player.deaths / match[player.team === "radiant" ? "dire" : "radiant"].killsCount;
      // 受到伤害计算
      player.damageReceived = (player.stats?.heroDamageReport?.receivedTotal?.physicalDamage ?? 0) + (player.stats?.heroDamageReport?.receivedTotal?.magicalDamage ?? 0) + (player.stats?.heroDamageReport?.receivedTotal?.pureDamage ?? 0);
      // 团队造成英雄伤害与受到伤害累加
      match[player.team].heroDamage = (match[player.team].heroDamage ?? 0) + player.heroDamage;
      match[player.team].damageReceived = (match[player.team].damageReceived ?? 0) + player.damageReceived;
      // 团队经济经验累加（无有效API获取总经验，仅能通过每分钟经验数据推算）
      match[player.team].networth += player.networth;
      match[player.team].experience += Math.floor((player.experiencePerMinute / 60) * match.durationSeconds);
      // 直接储存pick顺序（从0开始）
      player.order = heroOrderList[player.hero.id];
      if (player.partyId != null) {
        if (!match.party[player.partyId]) match.party[player.partyId] = party_mark[party_index++];
      }

      // 对player.stats.matchPlayerBuffEvent（buff列表）进行处理，取stackCount（叠加层数）最高的对象并去重
      if (player.stats.matchPlayerBuffEvent) {
        // 使用 Map 代替对象提升性能 (O(1) 查找)
        const buffMap = new Map<string, { type: "ability" | "item"; id: number; stackCount: number }>();

        for (const event of player.stats.matchPlayerBuffEvent) {
          // 确定类型和ID
          const isAbility = event.abilityId != null;
          const id = isAbility ? event.abilityId! : event.itemId!;
          const type = isAbility ? "ability" : "item";

          // 生成复合键 (类型+ID)
          const compositeKey = `${type}|${id}`;

          // 仅保留最大层数
          const current = buffMap.get(compositeKey);
          if (!current || event.stackCount > current.stackCount) {
            buffMap.set(compositeKey, {
              id,
              type,
              stackCount: event.stackCount ?? 0,
            });
          }
        }

        // 转换为数组并赋值
        player.buffs = Array.from(buffMap.values());
      } else {
        player.buffs = []; // 确保始终是数组
      }

      switch (player.lane) {
        case "SAFE_LANE":
          player.laneResult = laneResult[player.isRadiant ? "bottom" : "top"][player.team];
          break;
        case "OFF_LANE":
          player.laneResult = laneResult[!player.isRadiant ? "bottom" : "top"][player.team];
          break;
        case "JUNGLE":
          player.laneResult = "jungle";
          break;
        default:
          player.laneResult = laneResult.mid[player.team];
          break;
      }

      player.utilityScore = (player.stats?.campStack?.at(-1) || 0) * 100; // 初始化为屯野数积分
      const utilityItemIds = [
        30, // 真视宝石
        40, // 显影之尘
        42, // 侦查守卫 (假眼)
        43, // 岗哨守卫 (真眼)
        188, // 诡计之雾
      ];
      const supportItemsCount: { [key: number]: number } = utilityItemIds.reduce((obj, key) => {
        obj[key] = 0;
        return obj;
      }, {});

      // 预处理购买时间
      const purchaseTimesMap: { [key: number]: number[] } = {};
      if (player.stats?.itemPurchases) {
        for (const item of player.stats.itemPurchases) {
          if (!utilityItemIds.includes(item.itemId)) {
            if (!purchaseTimesMap[item.itemId]) {
              purchaseTimesMap[item.itemId] = [];
            }
            purchaseTimesMap[item.itemId].push(item.time);
          } else {
            const itemName = dotaconstants.item_ids[item.itemId];
            if (itemName) {
              const itemDetails = dotaconstants.items[itemName];
              if (itemDetails && itemDetails.cost) {
                player.utilityScore += itemDetails.cost;
              }
            }
            supportItemsCount[item.itemId]++;
          }
        }
      }

      player.supportItemsCount = [];
      for (let itemId in supportItemsCount) {
        if (supportItemsCount[itemId] === 0) continue;
        player.supportItemsCount.push({
          name: dotaconstants.item_ids[itemId],
          count: supportItemsCount[itemId],
        });
      }

      // 创建一个 Map 来追踪每个物品时间
      const purchaseTimeIndices = new Map<number, number>();

      // 为玩家创建物品数组
      player.items = [];
      for (let i = 0; i <= 5; i++) {
        const itemId = player[`item${i}Id`];
        const itemObject = createItemObject(itemId, purchaseTimesMap, purchaseTimeIndices);
        player.items.push(itemObject);
      }

      // 为玩家创建背包数组
      player.backpacks = [];
      for (let i = 0; i <= 2; i++) {
        const itemId = player[`backpack${i}Id`];
        const itemObject = createItemObject(itemId, purchaseTimesMap, purchaseTimeIndices);
        player.backpacks.push(itemObject);
      }

      // 如果有附加单位（目前应该是仅有熊德），为玩家创建单位物品数组
      if (player.additionalUnit) {
        player.unitItems = [];
        player.unitBackpacks = [];
        // 提取 item0Id 到 item5Id
        for (let i = 0; i <= 5; i++) {
          const itemId = player.additionalUnit[`item${i}Id`];
          const itemObject = createItemObject(itemId, purchaseTimesMap, purchaseTimeIndices);
          player.unitItems.push(itemObject);
        }

        // 提取 backpack0Id 到 backpack2Id
        for (let i = 0; i <= 2; i++) {
          const itemId = player.additionalUnit[`backpack${i}Id`];
          const itemObject = createItemObject(itemId, purchaseTimesMap, purchaseTimeIndices);
          player.unitBackpacks.push(itemObject);
        }
      }

      player.formattedNetworth = formatNumber(player.networth);

      player.facet = facetData[player.steamAccountId];

      player.titles = []; // 添加空的称号数组
      player.mvpScore = // 计算MVP分数
        player.kills * 5 +
        player.assists * 3 +
        ((player.stats.heroDamageReport?.dealtTotal.stunDuration ?? 0) / 100) * 0.1 +
        ((player.stats.heroDamageReport?.dealtTotal.disableDuration ?? 0) / 100) * 0.05 +
        ((player.stats.heroDamageReport?.dealtTotal.slowDuration ?? 0) / 100) * 0.025 +
        player.heroDamage * 0.001 +
        player.towerDamage * 0.01 +
        player.heroHealing * 0.002 +
        player.imp * 0.25 +
        player.utilityScore * 0.005;
    });
    enum ComparisonMode {
      Max = "max",
      Min = "min",
    }
    function findMaxByProperty(primaryProperty, secondaryProperty = null, players = match.players, primaryMode: ComparisonMode = ComparisonMode.Max, secondaryMode: ComparisonMode = ComparisonMode.Max) {
      let maxPlayer = players.reduce((result, player) => {
        const primaryComparison = primaryMode === ComparisonMode.Max ? player[primaryProperty] > result[primaryProperty] : player[primaryProperty] < result[primaryProperty];
        const secondaryComparison = secondaryMode === ComparisonMode.Max ? player[secondaryProperty] > result[secondaryProperty] : player[secondaryProperty] < result[secondaryProperty];
        if (primaryComparison) {
          return player as PlayerInfoExInMatch; // 主属性决定返回哪个玩家
        } else if (player[primaryProperty] === result[primaryProperty] && secondaryProperty && secondaryComparison) {
          // 主属性相同，检查次属性
          return player as PlayerInfoExInMatch;
        }
        return result as PlayerInfoExInMatch; // 保持当前结果
      });

      return (maxPlayer[primaryProperty] > 0 ? maxPlayer : null) as PlayerInfoExInMatch; // 如果最大属性为0，则不返回玩家对象
    }
    findMaxByProperty(
      "mvpScore",
      undefined,
      match.players.filter((player) => match.didRadiantWin == player.isRadiant),
    )?.titles.push("dota2tracker.template.titles.MVP");
    findMaxByProperty(
      "mvpScore",
      undefined,
      match.players.filter((player) => match.didRadiantWin != player.isRadiant),
    )?.titles.push("dota2tracker.template.titles.Soul");
    findMaxByProperty("networth")?.titles.push("dota2tracker.template.titles.Rich");
    findMaxByProperty("experiencePerMinute")?.titles.push("dota2tracker.template.titles.Wise");
    if (matchParsed) {
      (
        match.players.reduce((max, player) =>
          player.stats.heroDamageReport.dealtTotal.stunDuration + player.stats.heroDamageReport.dealtTotal.disableDuration / 2 + player.stats.heroDamageReport.dealtTotal.slowDuration / 4 >
          max.stats.heroDamageReport.dealtTotal.stunDuration + max.stats.heroDamageReport.dealtTotal.disableDuration / 2 + max.stats.heroDamageReport.dealtTotal.slowDuration / 4
            ? player
            : max,
        ) as PlayerInfoExInMatch
      ).titles.push("dota2tracker.template.titles.Controller");
      (
        match.players.reduce((max, player) =>
          player.stats.heroDamageReport.receivedTotal.physicalDamage + player.stats.heroDamageReport.receivedTotal.magicalDamage + player.stats.heroDamageReport.receivedTotal.pureDamage >
          max.stats.heroDamageReport.receivedTotal.physicalDamage + max.stats.heroDamageReport.receivedTotal.magicalDamage + max.stats.heroDamageReport.receivedTotal.pureDamage
            ? player
            : max,
        ) as PlayerInfoExInMatch
      ).titles.push("dota2tracker.template.titles.Tank");
    }
    findMaxByProperty("heroDamage")?.titles.push("dota2tracker.template.titles.Nuker");
    findMaxByProperty("kills", "heroDamage")?.titles.push("dota2tracker.template.titles.Breaker");
    findMaxByProperty("deaths", "networth", undefined, undefined, ComparisonMode.Min)?.titles.push("dota2tracker.template.titles.Ghost");
    if (matchParsed) findMaxByProperty("utilityScore", "networth", match.players, ComparisonMode.Max, ComparisonMode.Min)?.titles.push("dota2tracker.template.titles.Utility");
    findMaxByProperty("assists", "heroDamage")?.titles.push("dota2tracker.template.titles.Assister");
    findMaxByProperty("towerDamage", "heroDamage")?.titles.push("dota2tracker.template.titles.Demolisher");
    findMaxByProperty("heroHealing")?.titles.push("dota2tracker.template.titles.Healer");
    (
      match.players.reduce((lowest: PlayerInfoExInMatch, player: PlayerInfoExInMatch) => {
        const currentContribution = (player.kills + player.assists) / match[player.team].killsCount;
        const lowestContribution = (lowest.kills + lowest.assists) / match[lowest.team].killsCount;

        if (currentContribution < lowestContribution) {
          return player; // 当前玩家的贡献比最低的还低
        } else if (currentContribution === lowestContribution) {
          // 贡献相同，比较总击杀加助攻
          const currentPlayerScore = player.kills + player.assists;
          const lowestPlayerScore = lowest.kills + lowest.assists;

          if (currentPlayerScore < lowestPlayerScore) {
            return player; // 当前玩家的总分比最低的还低
          } else if (currentPlayerScore === lowestPlayerScore) {
            // 总分也相同，比较英雄伤害
            return player.heroDamage < lowest.heroDamage ? player : lowest;
          }
        }
        return lowest; // 保持当前最低的玩家
      }) as PlayerInfoExInMatch
    ).titles.push("dota2tracker.template.titles.Idle");

    match.durationTime = sec2time(match.durationSeconds);

    return match;
  }

  private static isMatchParsed(matchQuery: graphql.MatchInfoQuery) {
    return matchQuery?.match?.parsedDateTime && matchQuery?.match?.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0;
  }
}

function createItemObject(itemId: number, purchaseTimesMap: { [key: number]: number[] }, purchaseTimeIndices: Map<number, number>) {
  if (itemId === undefined || itemId === null) {
    return null; // 如果没有物品ID，直接返回null
  }

  if (dotaconstants.item_ids[itemId]) {
    const currentIndex = purchaseTimeIndices.get(itemId) || 0;
    const seconds = purchaseTimesMap[itemId]?.[currentIndex];
    purchaseTimeIndices.set(itemId, currentIndex + 1);

    const name = dotaconstants.item_ids[itemId];
    const prefix = "recipe_";
    const isRecipe = name.startsWith(prefix);
    const cleanName = isRecipe ? name.substring(prefix.length) : name;

    return {
      id: itemId,
      name: cleanName,
      seconds: seconds,
      time: sec2time(seconds),
      isRecipe: isRecipe,
    };
  }

  return null; // 如果在 dotaconstants 中找不到，也返回 null
}
