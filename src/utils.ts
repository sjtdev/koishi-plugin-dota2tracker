"use strict";
import { Schema } from "koishi";
import axios from "axios";
import fs from "fs";
import * as dotaconstants from "dotaconstants";
import os from "os";
import path from "path";

declare module "koishi" {
    interface Tables {
        dt_subscribed_guilds: dt_subscribed_guilds;
        dt_subscribed_players: dt_subscribed_players;
        dt_sended_match_id: dt_sended_match_id;
        dt_previous_query_results: dt_previous_query_results;
        dt_constants_abilities_cn: dt_constants_abilities_cn;
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

export interface dt_constants_abilities_cn {
    id: number;
    data: object;
    gameVersionId: number;
    gameVersionName: string;
}

export const CONFIGS = { STRATZ_API: { URL: "https://api.stratz.com/graphql", TOKEN: "" } };

export async function query(query_str) {
    return await axios.post(CONFIGS.STRATZ_API.URL, query_str, {
        headers: {
            "Content-Type": "application/graphql",
            Authorization: `Bearer ${CONFIGS.STRATZ_API.TOKEN}`,
        },
    });
}

export enum ImageType {
    Icons = "icons",
    Heroes = "heroes",
    HeroIcons = "heroes/icons",
    Items = "items",
    Abilities = "abilities",
    Local = "local",
}
export function getImageUrl(image: string, type: ImageType = ImageType.Local) {
    if (type === ImageType.Local) {
        try {
            const imageData = fs.readFileSync(`./node_modules/@sjtdev/koishi-plugin-dota2tracker/images/${image}.png`);
            const base64Data = imageData.toString("base64");
            return `data:image/png;base64,${base64Data}`;
        } catch (error) {
            console.error(error);
            return "";
        }
    } else return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/${type}/${image}.png`;
}

// 对比赛数据进行补充以供生成模板函数使用
export function getFormattedMatchData(match) {
    // 获取到的团队击杀数是每分钟击杀数的数组，需要累加计算
    match.radiantKillsCount = match.radiantKills ? match.radiantKills.reduce((acc: number, cva: number) => acc + cva, 0) : 0;
    match.direKillsCount = match.direKills ? match.direKills.reduce((acc: number, cva: number) => acc + cva, 0) : 0;
    // 定义开黑小队相关变量
    match.party = {};
    let party_index = 0;
    const party_mark = ["I", "II", "III", "IV"];
    // 定义禁选相关变量并填充禁用英雄模板
    let heroOrderList = {};
    for (let hero of match.pickBans) {
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
        // 参战率与参葬率
        player.killContribution = (player.kills + player.assists) / (player.isRadiant ? match.radiantKillsCount : match.direKillsCount);
        player.deathContribution = player.deaths / (player.isRadiant ? match.direKillsCount : match.radiantKillsCount);
        player.titles = []; // 添加空的称号数组
        player.mvpScore = // 计算MVP分数
            player.kills * 5 +
            player.assists * 3 +
            (player.stats.heroDamageReport.dealtTotal.stunDuration / 100) * 0.1 +
            ((player.stats.heroDamageReport.dealtTotal.slowDuration + player.stats.heroDamageReport.dealtTotal.disableDuration) / 100) * 0.05 +
            player.heroDamage * 0.001 +
            player.towerDamage * 0.01 +
            player.heroHealing * 0.002 +
            player.imp * 0.25;
        player.order = heroOrderList[player.hero.id];
        if (player.partyId != null) {
            if (!match.party[player.partyId]) match.party[player.partyId] = party_mark[party_index++];
        }

        // 对player.stats.matchPlayerBuffEvent（buff列表）进行处理，取stackCount（叠加层数）最高的对象并去重
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

        switch (player.lane) {
            case "SAFE_LANE":
                player.laneResult = laneResult[player.isRadiant ? "bottom" : "top"][player.isRadiant ? "radiant" : "dire"];
                break;
            case "OFF_LANE":
                player.laneResult = laneResult[!player.isRadiant ? "bottom" : "top"][player.isRadiant ? "radiant" : "dire"];
                break;
            default:
                player.laneResult = laneResult.mid[player.isRadiant ? "radiant" : "dire"];
                break;
        }

        let items_timelist = {};
        player.supportItemsCount = { 30: 0, 40: 0, 42: 0, 43: 0, 188: 0 };
        if (player.playbackData) {
            for (let item of player.playbackData.purchaseEvents) {
                items_timelist[item.itemId] = item.time;
                if (item.itemId == 42 || item.itemId == 43) items_timelist[218] = item.time;
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
                    time: items_timelist[itemId],
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
    match.players
        .reduce((max, player) =>
            player.stats.heroDamageReport.dealtTotal.stunDuration + player.stats.heroDamageReport.dealtTotal.disableDuration + player.stats.heroDamageReport.dealtTotal.slowDuration / 2 >
            max.stats.heroDamageReport.dealtTotal.stunDuration + max.stats.heroDamageReport.dealtTotal.disableDuration + max.stats.heroDamageReport.dealtTotal.slowDuration / 2
                ? player
                : max
        )
        .titles.push({ name: "控", color: "#FF00FF" });
    findMaxByProperty("heroDamage").titles.push({ name: "爆", color: "#CC0088" });
    findMaxByProperty("kills", "heroDamage").titles.push({ name: "破", color: "#DD0000" });
    findMaxByProperty("deaths", "networth", undefined, undefined, ComparisonMode.Min).titles.push({ name: "鬼", color: "#CCCCCC" });
    findMaxByProperty("assists", "heroDamage").titles.push({ name: "助", color: "#006400" });
    findMaxByProperty("towerDamage", "heroDamage").titles.push({ name: "拆", color: "#FEDCBA" });
    findMaxByProperty("heroHealing").titles.push({ name: "奶", color: "#00FF00" });
    match.players
        .reduce((max, player) =>
            player.stats.heroDamageReport.receivedTotal.physicalDamage + player.stats.heroDamageReport.receivedTotal.magicalDamage + player.stats.heroDamageReport.receivedTotal.pureDamage >
            max.stats.heroDamageReport.receivedTotal.physicalDamage + max.stats.heroDamageReport.receivedTotal.magicalDamage + max.stats.heroDamageReport.receivedTotal.pureDamage
                ? player
                : max
        )
        .titles.push({ name: "耐", color: "#84A1C7" });
    match.players
        .reduce((lowest, player) => {
            const currentContribution = (player.kills + player.assists) / (player.isRadiant ? match.radiantKillsCount : match.direKillsCount);
            const lowestContribution = (lowest.kills + lowest.assists) / (lowest.isRadiant ? match.radiantKillsCount : match.direKillsCount);

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
