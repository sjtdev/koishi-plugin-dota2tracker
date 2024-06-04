"use strict";
import { HTTP, Schema } from "koishi";
import fs from "fs";
import * as dotaconstants from "dotaconstants";
import os from "os";
import path from "path";
import * as queries from "./queries.ts";

declare module "koishi" {
    interface Tables {
        dt_subscribed_guilds: dt_subscribed_guilds;
        dt_subscribed_players: dt_subscribed_players;
        dt_sended_match_id: dt_sended_match_id;
        dt_previous_query_results: dt_previous_query_results;
        dt_hero_data_cache: dt_hero_data_cache;
    }
}
export interface dt_subscribed_players {
    id: number;
    userId: string;
    guildId: string;
    platform: string;
    steamId: number;
    nickName: string;
}

export interface dt_subscribed_guilds {
    id: number;
    guildId: string;
    platform: string;
}

export interface dt_sended_match_id {
    matchId: number;
    sendTime: Date;
}

export interface dt_previous_query_results {
    matchId: number;
    data: object;
    queryTime: Date;
}

export interface dt_hero_data_cache {
    id: number;
    gameVersionId: number;
    hero: object;
}

export const CONFIGS = { STRATZ_API: { URL: "https://api.stratz.com/graphql", TOKEN: "" } };
let http: HTTP = null;
export function setHttp(newHttp: HTTP) {
    http = newHttp;
}
export async function query(query_str) {
    return await http.post(CONFIGS.STRATZ_API.URL, query_str, {
        responseType: "json",
        headers: {
            "Content-Type": "application/graphql",
            Authorization: `Bearer ${CONFIGS.STRATZ_API.TOKEN}`,
        },
    });
}

export async function queryHeroFromValve(heroId: number) {
    // return (await http.get("http://localhost:8099")).result.data.heroes[0];
    return (await http.get(`https://www.dota2.com/datafeed/herodata?language=schinese&hero_id=${heroId}`)).result.data.heroes[0];
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
            const imageData = fs.readFileSync(`./node_modules/@sjtdev/koishi-plugin-dota2tracker/template/images/${image}.png`);
            const base64Data = imageData.toString("base64");
            return `data:image/png;base64,${base64Data}`;
        } catch (error) {
            console.error(error);
            return "";
        }
    } else return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/${type}/${image}.${format}`;
}

// 对比赛数据进行补充以供生成模板函数使用
export function getFormattedMatchData(match) {
    // if (!match.parsedDateTime)
    //     return match;
    // ↓ 累加团队击杀数，并初始化团队[总对英雄造成伤害]与[总受到伤害]
    // 获取到的团队击杀数是每分钟击杀数的数组，需要累加计算，由radiantKills/direKills累加计算存为match.radiant.KillsCount/match.dire.KillsCount
    ["radiant", "dire"].forEach((team) => {
        match[team] = { killsCount: match[team + "Kills"]?.reduce((acc: number, cva: number) => acc + cva, 0) ?? 0, damageReceived: 0, heroDamage: 0, networth: 0, experience: 0 };
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
                return { radiant: "victory", dire: "fail" };
            case "RADIANT_STOMP":
                return { radiant: "stomp", dire: "stomped" };
            case "DIRE_VICTORY":
                return { radiant: "fail", dire: "victory" };
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
    match.players.forEach((player) => {
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
        player.deathContribution = player.deaths / match[player.team === "radiant" ? "dire" : player.team].killsCount;
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
            // 使用reduce方法处理数组，以abilityId或itemId作为键，并保留stackCount最大的对象
            const maxStackCountsByAbilityOrItem = player.stats.matchPlayerBuffEvent.reduce((acc, event) => {
                // 创建一个唯一键，能力ID或物品ID，取决于哪一个不为null
                const key = event.abilityId !== null ? `ability-${event.abilityId}` : `item-${event.itemId}`;
                // 如果当前key还未存在于accumulator中，或当前event的stackCount更大，则更新记录
                if (!acc[key] || event.stackCount > acc[key].stackCount) {
                    acc[key] = event;
                }
                return acc;
            }, {});
            // 将结果对象转换为数组，并重新赋值给原数组
            player.stats.matchPlayerBuffEvent.splice(0, player.stats.matchPlayerBuffEvent.length, ...Object.values(maxStackCountsByAbilityOrItem));
        }

        switch (player.lane) {
            case "SAFE_LANE":
                player.laneResult = laneResult[player.isRadiant ? "bottom" : "top"][player.team];
                break;
            case "OFF_LANE":
                player.laneResult = laneResult[!player.isRadiant ? "bottom" : "top"][player.team];
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

        if (player.playbackData) {
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

            for (let item of player.playbackData.purchaseEvents) {
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
    });
    enum ComparisonMode {
        Max = "max",
        Min = "min",
    }
    function findMaxByProperty(primaryProperty, secondaryProperty = null, players = match.players, primaryMode: ComparisonMode = ComparisonMode.Max, secondaryMode: ComparisonMode = ComparisonMode.Max) {
        return players.reduce((result, player) => {
            const primaryComparison = primaryMode === ComparisonMode.Max ? player[primaryProperty] > result[primaryProperty] : player[primaryProperty] < result[primaryProperty];

            const secondaryComparison = secondaryMode === ComparisonMode.Max ? player[secondaryProperty] > result[secondaryProperty] : player[secondaryProperty] < result[secondaryProperty];

            if (primaryComparison) {
                return player; // 主属性决定返回哪个玩家
            } else if (player[primaryProperty] === result[primaryProperty] && secondaryProperty && secondaryComparison) {
                // 主属性相同，检查次属性
                return player;
            }
            return result; // 保持当前结果
        });
    }
    findMaxByProperty(
        "mvpScore",
        undefined,
        match.players.filter((player) => match.didRadiantWin == player.isRadiant)
    ).titles.push({ name: "MVP", color: "#FFA500" });
    findMaxByProperty(
        "mvpScore",
        undefined,
        match.players.filter((player) => match.didRadiantWin != player.isRadiant)
    ).titles.push({ name: "魂", color: "#6cf" });
    findMaxByProperty("networth").titles.push({ name: "富", color: "#FFD700" });
    findMaxByProperty("experiencePerMinute").titles.push({ name: "睿", color: "#8888FF" });
    if (match.parsedDateTime) {
        match.players
            .reduce((max, player) =>
                player.stats.heroDamageReport.dealtTotal.stunDuration + player.stats.heroDamageReport.dealtTotal.disableDuration / 2 + player.stats.heroDamageReport.dealtTotal.slowDuration / 4 >
                max.stats.heroDamageReport.dealtTotal.stunDuration + max.stats.heroDamageReport.dealtTotal.disableDuration / 2 + max.stats.heroDamageReport.dealtTotal.slowDuration / 4
                    ? player
                    : max
            )
            .titles.push({ name: "控", color: "#FF00FF" });
        match.players
            .reduce((max, player) =>
                player.stats.heroDamageReport.receivedTotal.physicalDamage + player.stats.heroDamageReport.receivedTotal.magicalDamage + player.stats.heroDamageReport.receivedTotal.pureDamage >
                max.stats.heroDamageReport.receivedTotal.physicalDamage + max.stats.heroDamageReport.receivedTotal.magicalDamage + max.stats.heroDamageReport.receivedTotal.pureDamage
                    ? player
                    : max
            )
            .titles.push({ name: "耐", color: "#84A1C7" });
    }
    findMaxByProperty("heroDamage").titles.push({ name: "爆", color: "#CC0088" });
    findMaxByProperty("kills", "heroDamage").titles.push({ name: "破", color: "#DD0000" });
    findMaxByProperty("deaths", "networth", undefined, undefined, ComparisonMode.Min).titles.push({ name: "鬼", color: "#CCCCCC" });
    findMaxByProperty("assists", "heroDamage").titles.push({ name: "助", color: "#006400" });
    findMaxByProperty("towerDamage", "heroDamage").titles.push({ name: "拆", color: "#FEDCBA" });
    findMaxByProperty("heroHealing").titles.push({ name: "奶", color: "#00FF00" });
    match.players
        .reduce((lowest, player) => {
            const currentContribution = (player.kills + player.assists) / match[player.team].KillsCount;
            const lowestContribution = (lowest.kills + lowest.assists) / match[lowest.team].KillsCount;

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
        })
        .titles.push({ name: "摸", color: "#DDDDDD" });
    return match;
}

/** 秒数格式化，返回"分钟:秒数"，运算失败返回"--:--"。 */
export function sec2time(sec: number) {
    return sec ? (sec < 0 ? "-" : "") + Math.floor(Math.abs(sec) / 60) + ":" + ("00" + (Math.abs(sec) % 60)).slice(-2) : "--:--";
}

/** 数字格式化，返回带千分位数字 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 读取目录下所有文件名去除后缀名后返回文件名数组。 */
export function readDirectoryFilesSync(directoryPath) {
    try {
        // 同步读取目录下的所有文件名
        const files = fs.readdirSync(directoryPath);

        // 使用 map 函数去除每个文件名的扩展名
        const fileNames = files.map((file) => path.basename(file, path.extname(file)));

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
export async function playerisValid(steamAccountId): Promise<{ isValid: boolean; reason?: string }> {
    try {
        let queryRes = await query(queries.VERIFYING_PLAYER(steamAccountId));
        if (queryRes.data.player.matchCount != null) return { isValid: true };
        else return { isValid: false, reason: "SteamID无效或无任何场次。" };
    } catch (error) {
        console.error(error);
        return { isValid: false, reason: "网络状况不佳SteamID验证失败，请稍后重试。" };
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

export function formatHeroDesc(template: string, special_values, type: HeroDescType = HeroDescType.Normal): string {
    return template.replace(/%%|%([^%]+)%/g, (match, p1) => {
        if (match === "%%") {
            return "%";
        } else {
            const specialValue = special_values.find((sv) => {
                const match2 = /bonus_(.*)/.exec(p1);
                return sv.name === p1 || sv.name === match2?.[1];
            });
            if (specialValue) {
                let valuesToUse = "";
                if (type == HeroDescType.Facet) {
                    valuesToUse = specialValue.facet_bonus.name ? specialValue.facet_bonus.values.join(" / ") : specialValue.values_float.join(" / ");
                } else if (type == HeroDescType.Scepter) {
                    valuesToUse = specialValue.values_scepter.length ? specialValue.values_scepter.join(" / ") : specialValue.values_float.join(" / ");
                } else if (type == HeroDescType.Shard) {
                    valuesToUse = specialValue.values_shard.length ? specialValue.values_shard.join(" / ") : specialValue.values_float.join(" / ");
                } else {
                    valuesToUse = specialValue.values_float.join(" / ");
                }
                return `<span class="value">${valuesToUse}</span>`;
            } else {
                return match; // 如果未找到对应的特殊值，则保持原样
            }
        }
    });
}
