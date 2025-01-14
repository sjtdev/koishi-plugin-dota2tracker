"use strict";
import { HTTP, Schema } from "koishi";
import fs from "fs";
import * as dotaconstants from "dotaconstants";
import os from "os";
import path from "path";
import * as graphql from "./@types/graphql-generated";
import {} from "@koishijs/cache";
import { Random } from "koishi";

declare module "koishi" {
  interface Tables {
    dt_subscribed_guilds: dt_subscribed_guilds;
    dt_subscribed_players: dt_subscribed_players;
  }
}
export interface dt_subscribed_players {
  id: number;
  userId: string;
  guildId: string;
  platform: string;
  steamId: number;
  nickName: string;
  rank: { rank: number; leader: number };
}

export interface dt_subscribed_guilds {
  id: number;
  guildId: string;
  platform: string;
}

// export interface dt_sended_match_id {
//     matchId: number;
//     sendTime: Date;
// }

// export interface dt_previous_query_results {
//     matchId: number;
//     data: object;
//     queryTime: Date;
// }

declare module "@koishijs/cache" {
  interface Tables {
    dt_facets_constants: graphql.ConstantsQuery; // 游戏数据
    dt_previous_query_results: graphql.MatchInfoQuery;
    dt_sended_match_id: undefined;
  }
}

interface QueryFormat {
  query: string;
  variables?: {};
}
interface QueryResult {
  data: any;
  errors?: [{ message: string }];
}

const pluginDir = path.join(__dirname, "..");
export const CONFIGS = { STRATZ_API: { URL: "https://api.stratz.com/graphql", TOKEN: "" } };
let http: HTTP = null;
let setTimeout: Function;
export function init(newHttp: HTTP, newSetTimeout: Function, APIKEY: string) {
  http = newHttp;
  setTimeout = newSetTimeout;
  CONFIGS.STRATZ_API.TOKEN = APIKEY;
}
async function fetchData(query: QueryFormat): Promise<QueryResult> {
  return await http.post(CONFIGS.STRATZ_API.URL, JSON.stringify(query), {
    responseType: "json",
    headers: {
      "User-Agent": "STRATZ_API",
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIGS.STRATZ_API.TOKEN}`,
    },
  });
}
export async function query<TVariables, TData>(
  queryName: string, // 定义 query_func 为字符串
  variables?: TVariables // 查询变量
): Promise<TData> {
  // 判断是否是需要分批的查询
  if (queryName.startsWith("Players") && (variables as { steamAccountIds?: any[] })?.steamAccountIds.length > 5) {
    const playerIds = (variables as { steamAccountIds?: any[] })?.steamAccountIds ?? [];
    const chunkSize = 5;
    let allPlayers = [];

    // 将玩家ID数组分割成多个5个一组的子数组
    for (let i = 0; i < playerIds.length; i += chunkSize) {
      const chunk = playerIds.slice(i, i + chunkSize);
      (variables as { steamAccountIds?: any[] }).steamAccountIds = chunk;

      // 对每个分批的查询调用query_func, 并确保传入多个参数
      const query_str = loadGraphqlFile(queryName); // 如果有额外的参数，保持传递下去

      // 等待请求之间加入延迟
      const result: QueryResult = await new Promise((resolve) => setTimeout(async () => resolve(await fetchData({ query: query_str, variables })), 200));
      if (result?.errors) throw { errors: result.errors };

      // 确保每次请求返回的是{ data: { players: [...] } }格式
      if (result.data && result.data.players) {
        allPlayers = allPlayers.concat(result.data.players);
      }
    }

    // 将所有players合并到data字段下
    return { players: allPlayers } as TData;
  } else {
    // 如果不需要分批，直接进行查询
    const query_str = loadGraphqlFile(queryName);
    const result = await fetchData({ query: query_str, variables });
    if (result.errors) throw { errors: result.errors };
    return result.data as TData;
  }
}

function loadGraphqlFile(queryName: string): string {
  return fs.readFileSync(path.join(pluginDir, "queries", `${queryName}.graphql`), { encoding: "utf-8" }).replace(/[\r\n]+/g, " ");
}

export async function queryHeroFromValve(heroId: number, languageTag = "zh-CN") {
  enum language {
    "zh-CN" = "schinese",
    "en-US" = "english",
  }
  return (await http.get(`https://www.dota2.com/datafeed/herodata?language=${language[languageTag]}&hero_id=${heroId}`)).result.data.heroes[0];
}

export enum HeroDescType {
  Normal = "normal",
  Facet = "facet",
  Scepter = "scepter",
  Shard = "shard",
}
export enum ImageType {
  Icons = "icons",
  IconsFacets = "icons/facets",
  Heroes = "heroes",
  HeroIcons = "heroes/icons",
  HeroStats = "heroes/stats",
  Items = "items",
  Abilities = "abilities",
  Local = "local",
}
export enum ImageFormat {
  png = "png",
  svg = "svg",
}
export function getImageUrl(image: string, type: ImageType = ImageType.Local, format: ImageFormat = ImageFormat.png) {
  if (type === ImageType.Local) {
    try {
      if (format === ImageFormat.svg) return fs.readFileSync(path.join(pluginDir, "template", "images", `${image}.svg`));
      const imageData = fs.readFileSync(path.join(pluginDir, "template", "images", `${image}.${format}`));
      const base64Data = imageData.toString("base64");
      return `data:image/png;base64,${base64Data}`;
    } catch (error) {
      console.error(error);
      return "";
    }
  } else return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/${type}/${image}.${format}`;
}

export interface MatchInfoEx extends NonNullable<graphql.MatchInfoQuery["match"]> {
  radiant: MatchInfoExTeam;
  dire: MatchInfoExTeam;
  party: { [key: string]: string }; // party 是一个对象，key 是 partyId，value 是 party_mark 中的字符串
  players: PlayerTypeEx[];
}
interface MatchInfoExTeam {
  killsCount: number;
  damageReceived: number;
  heroDamage: number;
  networth: number;
  experience: number;
}
type PlayerType = NonNullable<graphql.MatchInfoQuery["match"]["players"]>[number];
interface PlayerTypeEx extends PlayerType {
  team: "radiant" | "dire";
  rank: RankInfo;
  killContribution: number;
  deathContribution: number;
  damageReceived: number;
  titles: { name: string; color: string }[];
  mvpScore: number;
  order: number;
  buffs: {
    key: string;
    stackCount?: number | null;
  }[];
  laneResult: "stomp" | "stomped" | "tie" | "advantage" | "disadvantage" | "jungle";
  supportItemsCount: { [key: number]: number };
  items: ItemInfo[];
  backpacks?: ItemInfo[];
  unitItems?: ItemInfo[];
  unitBackpacks?: ItemInfo[];
  facet: NonNullable<graphql.ConstantsQuery["constants"]["facets"]>[number];
}
export interface RankInfo {
  medal: number;
  star: number;
  leaderboard: number;
  inTop100: "8" | "8b" | "8c";
}
interface ItemInfo {
  id: string;
  name: string;
  time: any;
  isRecipe: boolean;
}
// 对比赛数据进行补充以供生成模板函数使用
export function getFormattedMatchData(matchQuery: graphql.MatchInfoQuery, constantsQuery: graphql.ConstantsQuery) {
  const match = matchQuery.match as MatchInfoEx;
  const constants = constantsQuery.constants;
  // if (!match.parsedDateTime)
  //     return match;
  // ↓ 累加团队击杀数，并初始化团队[总对英雄造成伤害]与[总受到伤害]
  // 获取到的团队击杀数是每分钟击杀数的数组，需要累加计算，由radiantKills/direKills累加计算存为match.radiant.KillsCount/match.dire.KillsCount
  ["radiant", "dire"].forEach((team) => {
    match[team] = { killsCount: match?.[team + "Kills"]?.reduce((acc: number, cva: number) => acc + cva, 0) ?? 0, damageReceived: 0, heroDamage: 0, networth: 0, experience: 0 };
  });
  // 未解析比赛时radiantKills/direKills为null，需要遍历玩家数组
  if (!match.parsedDateTime) {
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
  let laneResult = { top: {}, mid: {}, bottom: {} };
  laneResult.top = processLaneOutcome(match.topLaneOutcome);
  laneResult.mid = processLaneOutcome(match.midLaneOutcome);
  laneResult.bottom = processLaneOutcome(match.bottomLaneOutcome);

  // 遍历所有玩家，为需要的数据进行处理
  match.players.forEach((player: PlayerTypeEx) => {
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
      player.imp * 0.25;
    // 直接储存pick顺序（从0开始）
    player.order = heroOrderList[player.hero.id];
    if (player.partyId != null) {
      if (!match.party[player.partyId]) match.party[player.partyId] = party_mark[party_index++];
    }

    // 对player.stats.matchPlayerBuffEvent（buff列表）进行处理，取stackCount（叠加层数）最高的对象并去重
    if (player.stats.matchPlayerBuffEvent) {
      // 使用 reduce 方法处理，筛选出 stackCount 最大的 buff
      const maxStackCountsByAbilityOrItem = player.stats.matchPlayerBuffEvent.reduce((acc, event) => {
        // 确定唯一键
        const key = event.abilityId !== null ? `ability-${event.abilityId}` : `item-${event.itemId}`;
        // 更新逻辑
        if (!acc[key] || event.stackCount > acc[key].stackCount) {
          acc[key] = event;
        }
        return acc;
      }, {});

      // 将结果存入 player.buffs，转换为数组格式
      player.buffs = Object.entries(maxStackCountsByAbilityOrItem).map(([key, event]) => ({
        key,
        event,
      }));
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

    let items_timelist = {};
    const supportItemIds = [30, 40, 42, 43, 188];
    player.supportItemsCount = supportItemIds.reduce((obj, key) => {
      obj[key] = 0;
      return obj;
    }, {});

    if (player.stats?.itemPurchases) {
      const getNextElement = function () {
        let currentIndex = 0; // 从数组开头开始
        return function () {
          if (currentIndex >= this.length) {
            return null; // 或者你可以返回其他值表示没有更多元素
          }
          const element = this[currentIndex];
          currentIndex++;
          return element;
        };
      };

      for (let item of player.stats.itemPurchases) {
        if (!supportItemIds.includes(item.itemId)) {
          if (!items_timelist[item.itemId]) {
            items_timelist[item.itemId] = [];
            items_timelist[item.itemId].getNextElement = getNextElement.call(items_timelist[item.itemId]);
          }
          items_timelist[item.itemId].push(item.time);
        }
        switch (item.itemId) {
          case 30:
          case 40:
          case 42:
          case 43:
          case 188:
            player.supportItemsCount[item.itemId]++;
            break;
        }
      }
    }
    // 为玩家创建物品数组
    player.items = [];
    player.backpacks = [];
    const prefix = "recipe_";
    // 提取 item0Id 到 item5Id
    for (let i = 0; i <= 5; i++) {
      const key = `item${i}Id`;
      const itemId = player[key];
      if (itemId === undefined || itemId === null) {
        player.items.push(null); // 占位，因为itemId为null或undefined
      } else if (dotaconstants.item_ids[itemId]) {
        const name = dotaconstants.item_ids[itemId];
        const isRecipe = name.startsWith(prefix);
        const cleanName = isRecipe ? name.substring(prefix.length) : name;
        player.items.push({
          id: itemId,
          name: cleanName,
          time: items_timelist[itemId]?.getNextElement ? items_timelist[itemId].getNextElement() : undefined,
          isRecipe: isRecipe,
        });
      } else {
        player.items.push(null); // 如果没有对应的dotaconstants条目
      }
    }

    // 提取 backpack0Id 到 backpack2Id
    for (let i = 0; i <= 2; i++) {
      const key = `backpack${i}Id`;
      const itemId = player[key];
      if (itemId === undefined || itemId === null) {
        player.backpacks.push(null); // 占位，因为itemId为null或undefined
      } else if (dotaconstants.item_ids[itemId]) {
        const name = dotaconstants.item_ids[itemId];
        const isRecipe = name.startsWith(prefix);
        const cleanName = isRecipe ? name.substring(prefix.length) : name;
        player.backpacks.push({
          id: itemId,
          name: cleanName,
          time: items_timelist[itemId],
          isRecipe: isRecipe,
        });
      } else {
        player.backpacks.push(null); // 如果没有对应的dotaconstants条目
      }
    }
    // 如果有附加单位（目前应该是仅有熊德），为玩家创建单位物品数组
    if (player.additionalUnit) {
      player.unitItems = [];
      player.unitBackpacks = [];
      const prefix = "recipe_";
      // 提取 item0Id 到 item5Id
      for (let i = 0; i <= 5; i++) {
        const key = `item${i}Id`;
        const itemId = player.additionalUnit[key];
        if (itemId === undefined || itemId === null) {
          player.unitItems.push(null); // 占位，因为itemId为null或undefined
        } else if (dotaconstants.item_ids[itemId]) {
          const name = dotaconstants.item_ids[itemId];
          const isRecipe = name.startsWith(prefix);
          const cleanName = isRecipe ? name.substring(prefix.length) : name;
          player.unitItems.push({
            id: itemId,
            name: cleanName,
            time: items_timelist[itemId],
            isRecipe: isRecipe,
          });
        } else {
          player.unitItems.push(null); // 如果没有对应的dotaconstants条目
        }
      }

      // 提取 backpack0Id 到 backpack2Id
      for (let i = 0; i <= 2; i++) {
        const key = `backpack${i}Id`;
        const itemId = player.additionalUnit[key];
        if (itemId === undefined || itemId === null) {
          player.unitBackpacks.push(null); // 占位，因为itemId为null或undefined
        } else if (dotaconstants.item_ids[itemId]) {
          const name = dotaconstants.item_ids[itemId];
          const isRecipe = name.startsWith(prefix);
          const cleanName = isRecipe ? name.substring(prefix.length) : name;
          player.unitBackpacks.push({
            id: itemId,
            name: cleanName,
            time: items_timelist[itemId],
            isRecipe: isRecipe,
          });
        } else {
          player.unitBackpacks.push(null); // 如果没有对应的dotaconstants条目
        }
      }
    }
    // 命石处理
    if (player.variant != null) {
      player.facet = constants.facets.find((facet) => facet.id == player.hero.facets[player.variant - 1].facetId);
      player.facet.name = player.facet.language.displayName ?? player.facet.name;
    }
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
        return player as PlayerTypeEx; // 主属性决定返回哪个玩家
      } else if (player[primaryProperty] === result[primaryProperty] && secondaryProperty && secondaryComparison) {
        // 主属性相同，检查次属性
        return player as PlayerTypeEx;
      }
      return result as PlayerTypeEx; // 保持当前结果
    });

    return (maxPlayer[primaryProperty] > 0 ? maxPlayer : null) as PlayerTypeEx; // 如果最大属性为0，则不返回玩家对象
  }
  findMaxByProperty(
    "mvpScore",
    undefined,
    match.players.filter((player) => match.didRadiantWin == player.isRadiant)
  )?.titles.push({ name: "MVP", color: "#FFA500" });
  findMaxByProperty(
    "mvpScore",
    undefined,
    match.players.filter((player) => match.didRadiantWin != player.isRadiant)
  )?.titles.push({ name: "魂", color: "#6cf" });
  findMaxByProperty("networth")?.titles.push({ name: "富", color: "#FFD700" });
  findMaxByProperty("experiencePerMinute")?.titles.push({ name: "睿", color: "#8888FF" });
  if (match.parsedDateTime && match.players.every((player) => player?.stats?.heroDamageReport?.dealtTotal)) {
    (
      match.players.reduce((max, player) =>
        player.stats.heroDamageReport.dealtTotal.stunDuration + player.stats.heroDamageReport.dealtTotal.disableDuration / 2 + player.stats.heroDamageReport.dealtTotal.slowDuration / 4 >
        max.stats.heroDamageReport.dealtTotal.stunDuration + max.stats.heroDamageReport.dealtTotal.disableDuration / 2 + max.stats.heroDamageReport.dealtTotal.slowDuration / 4
          ? player
          : max
      ) as PlayerTypeEx
    ).titles.push({ name: "控", color: "#FF00FF" });
    (
      match.players.reduce((max, player) =>
        player.stats.heroDamageReport.receivedTotal.physicalDamage + player.stats.heroDamageReport.receivedTotal.magicalDamage + player.stats.heroDamageReport.receivedTotal.pureDamage >
        max.stats.heroDamageReport.receivedTotal.physicalDamage + max.stats.heroDamageReport.receivedTotal.magicalDamage + max.stats.heroDamageReport.receivedTotal.pureDamage
          ? player
          : max
      ) as PlayerTypeEx
    ).titles.push({ name: "耐", color: "#84A1C7" });
  }
  findMaxByProperty("heroDamage")?.titles.push({ name: "爆", color: "#CC0088" });
  findMaxByProperty("kills", "heroDamage")?.titles.push({ name: "破", color: "#DD0000" });
  findMaxByProperty("deaths", "networth", undefined, undefined, ComparisonMode.Min)?.titles.push({ name: "鬼", color: "#CCCCCC" });
  findMaxByProperty("assists", "heroDamage")?.titles.push({ name: "助", color: "#006400" });
  findMaxByProperty("towerDamage", "heroDamage")?.titles.push({ name: "拆", color: "#FEDCBA" });
  findMaxByProperty("heroHealing")?.titles.push({ name: "奶", color: "#00FF00" });
  (
    match.players.reduce((lowest: PlayerTypeEx, player: PlayerTypeEx) => {
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
    }) as PlayerTypeEx
  ).titles.push({ name: "摸", color: "#DDDDDD" });
  return match;
}

export interface PlayerInfoEx extends NonNullable<graphql.PlayerInfoWith25MatchesQuery["player"]>, NonNullable<graphql.PlayerExtraInfoQuery["player"]> {
  heroesPerformanceTop10: any[];
  genHero: { name: string };
  rank: RankInfo;
  isEstimatedRank?: boolean;
}

export function getFormattedPlayerData(param: { playerQuery: graphql.PlayerInfoWith25MatchesQuery; playerExtraQuery?: graphql.PlayerExtraInfoQuery; genHero?: { heroId: number; name: string }; estimateRank?: boolean }) {
  const { playerQuery, playerExtraQuery, genHero, estimateRank } = param;
  const player = playerQuery.player as PlayerInfoEx;
  const playerExtra = playerExtraQuery?.player;
  if (player.steamAccount.isAnonymous) {
    for (let index = 0; index < 25; index++) {
      const random = new Random(() => enhancedSimpleHashToSeed(`${player.steamAccount.id}-${index}`));
      player.matches.push({
        id: 1000000000 + index,
        gameMode: "UNKNOWN" as any,
        lobbyType: "UNRANKED" as any,
        didRadiantWin: random.bool(0.5),
        rank: random.int(0, 8) * 10,
        radiantKills: [random.int(0, 30)],
        direKills: [random.int(0, 30)],
        parsedDateTime: 1,
        players: [
          {
            steamAccount: { id: player.steamAccount.id },
            isRadiant: true,
            kills: random.int(0, 20),
            deaths: random.int(0, 20),
            assists: random.int(0, 20),
            hero: { id: random.pick(Object.keys(dotaconstants.heroes)), shortName: dotaconstants.heroes[random.pick(Object.keys(dotaconstants.heroes))].name.match(/^npc_dota_hero_(.+)$/)[1] },
          },
        ],
      });
    }
  }
  // 过滤和保留最高 level 的记录
  let filteredDotaPlus = {};
  playerExtra?.dotaPlus?.forEach((item) => {
    if (!filteredDotaPlus[item.heroId] || filteredDotaPlus[item.heroId].level < item.level) {
      filteredDotaPlus[item.heroId] = {
        heroId: item.heroId,
        level: item.level,
      };
    }
  });

  // 合并 heroesPerformance 数据
  playerExtra?.heroesPerformance?.forEach((hero) => {
    if (filteredDotaPlus[hero.hero.id]) {
      filteredDotaPlus[hero.hero.id].shortName = hero.hero.shortName;
      filteredDotaPlus[hero.hero.id].winCount = hero.winCount;
      filteredDotaPlus[hero.hero.id].matchCount = hero.matchCount;
    }
  });

  // 如果玩家没有段位，为玩家估算段位；必要条件：玩家没有段位信息 且 配置允许推算 且 玩家并未隐藏数据。（若隐藏数据则没有推算用的比赛段位数据）
  if (!player.steamAccount.seasonRank && estimateRank && !player.steamAccount.isAnonymous) {
    function estimateWeightedRank(player: PlayerInfoEx): number | string {
      const ranks = player.matches.map((match) => match.rank);

      const validRanks = ranks.filter(validateRank);

      if (validRanks.length === 0) {
        return "Unknown";
      }

      const totalWeight = validRanks.reduce((sum, _, index) => sum + calculateWeight(index, validRanks.length), 0);

      const weightedAverage =
        validRanks.reduce((sum, rank, index) => {
          const value = rankToValue(rank);
          const weight = calculateWeight(index, validRanks.length);
          return sum + value * weight;
        }, 0) / totalWeight;
      const tier = Math.floor(weightedAverage / 6);
      const stars = Math.round(weightedAverage % 6);
      return tier * 10 + stars;
      function rankToValue(rank: number): number {
        const tier = Math.floor(rank / 10);
        const stars = rank % 10;
        return tier * 6 + stars;
      }
      function calculateWeight(index: number, total: number): number {
        return 1.0 - (0.5 / (total - 1)) * index;
      }
      function validateRank(rank: number): boolean {
        if (rank === 80) return true;
        const tier = Math.floor(rank / 10);
        const stars = rank % 10;
        return tier >= 1 && tier <= 8 && stars >= 0 && stars <= 5;
      }
    }
    player.isEstimatedRank = true;
    player.steamAccount.seasonRank = estimateWeightedRank(player);
  }

  // 储存玩家分段
  player.rank = {
    medal: parseInt(player.steamAccount.seasonRank?.toString().split("")[0] ?? 0),
    star: parseInt(player.steamAccount.seasonRank?.toString().split("")[1] ?? 0),
    leaderboard: player.steamAccount.seasonLeaderboardRank,
    inTop100: player.steamAccount.seasonLeaderboardRank ? (player.steamAccount.seasonLeaderboardRank <= 10 ? "8c" : player.steamAccount.seasonLeaderboardRank <= 100 ? "8b" : undefined) : undefined,
  };

  // 转换为数组
  player.dotaPlus = Object.values(filteredDotaPlus); // 排序 dotaPlus 数组
  player.dotaPlus?.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return a.heroId - b.heroId;
  });

  // 取场次前十的英雄表现数据附加到原player对象中
  player.heroesPerformanceTop10 = playerExtra?.heroesPerformance.slice(0, 10) ?? [];

  if (genHero) {
    const { matchCount, winCount, imp } = player.heroesPerformanceTop10[0];
    player.matchCount = matchCount;
    player.winCount = winCount;
    player.performance.imp = imp;
    player.dotaPlus = player.dotaPlus.filter((dpHero) => dpHero.heroId == genHero.heroId);
    player.genHero = genHero;
  }

  return player;
}

// 英雄数据处理
export function getFormattedHeroData(rawHero: any) {
  let hero = Object.assign({}, rawHero);
  hero.facet_abilities.forEach((fa, i) => {
    if (fa.abilities.length) {
      fa.abilities.forEach((ab) => {
        if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
        if ((hero.facets[i] as any).description_loc !== ab.desc_loc)
          (hero.facets[i] as any).abilities.push({
            id: ab.id,
            name: ab.name,
            name_loc: ab.name_loc,
            description_ability_loc: formatHeroDesc(ab.desc_loc, ab.special_values, HeroDescType.Facet),
          });
        else (hero.facets[i] as any).description_loc = formatHeroDesc((hero.facets[i] as any).description_loc, ab.special_values, HeroDescType.Facet);
        ab.ability_is_facet = true;
        ab.facet = hero.facets[i];
        hero.abilities.push(ab);
      });
    }
  });
  // 遍历技能处理命石（facet）
  const all_special_values = [...hero.abilities.flatMap((ab) => ab.special_values), ...hero.facet_abilities.flatMap((fas) => fas.abilities.flatMap((fa) => fa.special_values))];
  hero.abilities.forEach((ab) => {
    // 遍历修改技能的命石，将描述与技能回填
    ab.facets_loc.forEach((facet, i) => {
      i = i + (hero.facets.length - ab.facets_loc.length);
      if (i < 0) return;
      if (facet) {
        if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
        (hero.facets[i] as any).abilities.push({
          id: ab.id,
          name: ab.name,
          name_loc: ab.name_loc,
          description_ability_loc: formatHeroDesc(facet, ab.special_values, HeroDescType.Facet),
          attributes: [],
        });
      }
    });
    hero.facets.forEach((facet) => {
      const svs = ab.special_values.filter((sv) => sv.facet_bonus.name === facet.name);
      svs.forEach((sv) => {
        if (sv.heading_loc) {
          if (!facet.abilities) facet.abilities = [];
          (facet as any).abilities
            .find((ability: any) => ab.id == ability.id)
            ?.attributes.push({
              heading_loc: sv.heading_loc,
              values: [...sv.facet_bonus.values],
              is_percentage: sv.is_percentage,
            });
        }
      });
      facet.description_loc = formatHeroDesc(facet.description_loc, svs, HeroDescType.Facet);
    });
    // 处理技能本身说明
    ab.desc_loc = formatHeroDesc(ab.desc_loc, ab.special_values, (ab as any).ability_is_facet ? HeroDescType.Facet : undefined);
    ab.notes_loc = ab.notes_loc.map((note) => formatHeroDesc(note, ab.special_values));
    // 处理神杖与魔晶说明
    if (ab.ability_has_scepter) ab.scepter_loc = formatHeroDesc(ab.scepter_loc, ab.special_values, HeroDescType.Scepter);
    if (ab.ability_has_shard) ab.shard_loc = formatHeroDesc(ab.shard_loc, ab.special_values, HeroDescType.Shard);
  });

  // 处理天赋
  hero.talents.forEach((talent: any) => {
    // Regular expression to match {s:some_value}
    const regex = /\{s:(.*?)\}/g;
    let match;

    // Loop through all matches
    while ((match = regex.exec(talent.name_loc)) !== null) {
      const specialValueName = match[1];

      // Find the target special value in the talent's special values
      const target = talent.special_values?.find((sv: any) => sv.name === specialValueName);
      if (target) {
        talent.name_loc = talent.name_loc.replace(match[0], target.values_float.join("/"));
      } else {
        // Find the ability that contains the bonus associated with the talent
        const abilities = hero.abilities.filter((ability: any) => ability.special_values.some((specialValue: any) => specialValue.bonuses.some((bonus: any) => bonus.name === talent.name)));

        for (const ability of abilities) {
          // Find the special value in the ability that contains the bonus
          const specialValues = ability.special_values.filter((specialValue: any) => specialValue.bonuses.some((bonus: any) => bonus.name === talent.name));

          const regex = /{s:bonus_(.*?)}/g;
          let match: RegExpExecArray | null;
          const replacements: {
            original: string;
            replacement: any;
          }[] = [];

          while ((match = regex.exec(talent.name_loc)) !== null) {
            const specialValue = specialValues.find((sv) => sv.name === String((match as any)[1]));
            const replacement = specialValue?.bonuses.find((bonus) => bonus.name === talent.name)?.value;
            if (replacement !== undefined) {
              replacements.push({
                original: match[0],
                replacement,
              });
            }
          }

          // 进行所有替换
          replacements.forEach(({ original, replacement }) => {
            talent.name_loc = talent.name_loc.replace(original, replacement);
          });
        }
      }
    }
  });
  return hero;
}

/** 秒数格式化，返回"分钟:秒数"，运算失败返回"--:--"。 */
export function sec2time(sec: number) {
  return sec ? (sec < 0 ? "-" : "") + Math.floor(Math.abs(sec) / 60) + ":" + ("00" + (Math.abs(sec) % 60)).slice(-2) : "--:--";
}

/** 数字格式化，返回带千分位数字 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 读取目录下所有 .ejs 文件名并去除后缀名后返回文件名数组。 */
export function readDirectoryFilesSync(directoryPath: string): string[] {
  try {
    // 同步读取目录下的所有文件名
    const files = fs.readdirSync(directoryPath);

    // 过滤出 .ejs 文件并去除扩展名
    const fileNames = files
      .filter(file => path.extname(file).toLowerCase() === '.ejs')
      .map(file => path.basename(file, '.ejs'));

    return fileNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return []; // 发生错误时返回空数组
  }
}

/** 根据输入的胜率（0.00~1.00）返回HEX颜色值。0.5时为白色，靠近0向纯红转变，靠近1向纯绿转变。 */
export function winRateColor(value) {
  value = value * 100;
  value = Math.max(0, Math.min(100, value));

  let red, green, blue;

  if (value <= 50) {
    // 从纯红到纯白
    let scale = Math.round(255 * (value / 50)); // Scale of 0 to 255
    red = 255;
    green = scale;
    blue = scale;
  } else {
    // 从纯白到纯绿
    let scale = Math.round(255 * ((value - 50) / 50)); // Scale of 0 to 255
    red = 255 - scale;
    green = 255;
    blue = 255 - scale;
  }

  // 将RGB值转换为两位十六进制代码
  const toHex = (color) => color.toString(16).padStart(2, "0").toUpperCase();

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

/** 使用stratzAPI查询，根据传入的SteamID验证此Steam账号是否为有效的DOTA2玩家账号，返回对象{isValid:boolean,reason:"如果失败此处为失败原因"}。 */
export async function playerisValid(input): Promise<{ isValid: boolean; isAnonymous?: boolean; reason?: string }> {
  try {
    const steamAccountId = parseInt(input);
    let queryRes = await query<graphql.VerifyingPlayerQueryVariables, graphql.VerifyingPlayerQuery>("VerifyingPlayer", { steamAccountId: steamAccountId });
    if (queryRes.player.matchCount != null) return { isValid: true, isAnonymous: queryRes.player.steamAccount.isAnonymous };
    else return { isValid: false, reason: ".reason_without_match" };
  } catch (error) {
    console.error(error);
    return { isValid: false, reason: ".reason_fetch_failed" };
    // session.send("获取比赛信息失败。");
  }
}

/** 四舍五入小数
 * @param decimalPlaces 保留位数
 * @param number 进行四舍五入的数值
 * @returns 四舍五入后的数值
 */
export function roundToDecimalPlaces(number, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
}

export function formatHeroDesc(template: string, special_values: any[], type: HeroDescType = HeroDescType.Normal): string {
  return template.replace(/%%|%([^%]+)%|\{([^}]+)\}/g, (match, p1, p2) => {
    const field = p1 || p2;

    if (match === "%%") {
      return "%";
    } else {
      // 处理 "s:" 前缀和 "shard_" 前缀，然后转换为小写
      const fieldName = field
        .replace(/^s:/, "")
        .replace(/^shard_/, "")
        .toLowerCase();
      const specialValue = special_values.find((sv) => {
        const nameLower = sv.name.toLowerCase();
        // 匹配字段名，忽略 "bonus_" 和 "shard_" 的有无
        return nameLower === fieldName || nameLower === `bonus_${fieldName}` || nameLower === `shard_${fieldName}` || `bonus_${nameLower}` === fieldName || `shard_${nameLower}` === fieldName;
      });
      if (specialValue) {
        let valuesToUse = "";
        switch (type) {
          case HeroDescType.Facet:
            valuesToUse = specialValue.facet_bonus.name ? specialValue.facet_bonus.values.join(" / ") : specialValue.values_float.join(" / ");
            break;
          case HeroDescType.Scepter:
            valuesToUse = specialValue.values_scepter.length ? specialValue.values_scepter.join(" / ") : specialValue.values_float.join(" / ");
            break;
          case HeroDescType.Shard:
            valuesToUse = specialValue.values_shard.length ? specialValue.values_shard.join(" / ") : specialValue.values_float.join(" / ");
            break;
          default:
            valuesToUse = specialValue.values_float.join(" / ");
        }
        return `<span class="value">${valuesToUse}</span>`;
      } else {
        return match; // 如果未找到对应的特殊值，则保持原样
      }
    }
  });
}

export function enhancedSimpleHashToSeed(inputString) {
  // 将字符串转化为 Base64 编码
  const encoded = btoa(inputString);

  // 多轮处理以增加散列性
  let total = 0;
  let complexFactor = 1; // 引入一个复杂因子，每次循环后递增
  for (let i = 0; i < encoded.length; i++) {
    // 计算字符代码，并通过复杂因子增加变化
    total += encoded.charCodeAt(i) * complexFactor;
    // 逐轮改变复杂因子，例如递增
    complexFactor++;
    // 为避免数字过大，及时应用取模
    total %= 9973; // 使用质数增加随机性
  }

  // 应用更复杂的散列方法，不必等到最后再平方
  total = ((total % 9973) * (total % 9973)) % 9973; // 再次应用模以保持数字大小

  // 通过取模操作和除法将总和转化为 [0, 1) 区间内的数
  return (total % 1000) / 1000;
}
