import { Context, Schema, h } from "koishi";
import * as utils from "./utils.ts";
import * as queries from "./queries.ts";
import { ImageType } from "./utils.ts";
import * as puppeteer from "koishi-plugin-puppeteer";
import fs from "fs";
import * as cheerio from "cheerio";
import moment from "moment";
import * as dotaconstants from "dotaconstants";
import * as d2a from "./dotaconstants_add.json";
import { Random } from "koishi";
import * as cron from "koishi-plugin-cron";
import * as ejs from "ejs";
import path from "path";

export const name = "dota2tracker";
export const usage = "DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。";
export const inject = ["database", "puppeteer", "cron"]; // 声明依赖

// 配置项
export interface Config {
    STRATZ_API_TOKEN: string;
    template_match: string;
    template_player: string;
    template_hero: string;
}
export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        STRATZ_API_TOKEN: Schema.string().required().description("※必须。stratz.com的API TOKEN，可在 https://stratz.com/api 获取"),
    }).description("基础设置"),
    Schema.object({
        template_match: Schema.union([...utils.readDirectoryFilesSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/match`)])
            .default("match_1")
            .description("生成比赛信息图片使用的模板，见 https://github.com/sjtdev/koishi-plugin-dota2tracker/wiki 有模板展示。"),
        template_player: Schema.union([...utils.readDirectoryFilesSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/player`)])
            .default("player_1")
            .description("生成玩家信息图片使用的模板。（目前仅有一张模板）"),
        template_hero: Schema.union([...utils.readDirectoryFilesSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/hero`)])
            .default("hero_1")
            .description("生成英雄信息图片使用的模板。（目前仅有一张模板）"),
    }).description("模板设置"),
]);

let pendingMatches = []; // 待发布的比赛，当获取到的比赛未被解析时存入此数组，在计时器中定时查询，直到该比赛已被解析则生成图片发布
// var subscribedGuilds = []; // 已订阅群组
// var subscribedPlayers = []; // 已绑定玩家
// var sendedMatches = []; // 已发布比赛
const random = new Random(() => Math.random());

export async function apply(ctx: Context, config: Config) {
    // write your plugin here
    utils.CONFIGS.STRATZ_API.TOKEN = config.STRATZ_API_TOKEN; // 读取配置API_TOKEN

    ctx.command("订阅本群", "订阅后还需玩家在本群绑定SteamID")
        .usage("订阅后还需玩家在本群绑定SteamID，BOT将订阅本群中已绑定玩家的新比赛数据，在STRATZ比赛解析完成后将比赛数据生成为图片战报发布至本群中。")
        .action(async ({ session }) => {
            if (session.guild) {
                // let currentGuild = subscribedGuilds.find((item) => item.id == session.event.guild.id && item.platform == session.event.platform);
                let currentGuild = (await ctx.database.get("dt_subscribed_guilds", { guildId: session.event.guild.id, platform: session.event.platform }))[0];
                if (currentGuild) session.send("本群已订阅，无需重复订阅。");
                else {
                    ctx.database.create("dt_subscribed_guilds", { guildId: session.event.guild.id, platform: session.event.platform });
                    session.send("订阅成功。");
                }
            }
        });

    ctx.command("取消订阅", "取消订阅本群").action(async ({ session }) => {
        if (session.guild) {
            let cancelingGuild = (await ctx.database.get("dt_subscribed_guilds", { guildId: session.event.guild.id, platform: session.event.platform }))[0];
            if (cancelingGuild) {
                ctx.database.remove("dt_subscribed_guilds", session.event.guild.id);
                session.send("取消订阅成功。");
                return;
            }
        } else session.send("本群尚未订阅，无需取消订阅。");
    });

    ctx.command("绑定 <steam_id> [nick_name]", "绑定SteamID，并起一个别名（也可以不起）")
        .usage("将你的SteamID与你的账号绑定，若本群已订阅将会实时获取你的新比赛数据发布至群中。")
        .example("-绑定 123456789")
        .example("-绑定 123456789 张三")
        .action(async ({ session }, steam_id, nick_name) => {
            if (session.guild) {
                // 若无输入数据或steamId不符1~11位数字则返回
                if (!steam_id || !/^\d{1,11}$/.test(steam_id)) {
                    session.send("SteamID无效。");
                    return;
                }
                // 若在已绑定玩家中找到调用指令用户则返回
                // let sessionPlayer = subscribedPlayers.find((item) => item.guildId == session.event.guild.id && item.platform == session.event.platform && item.userId == session.event.user.id);
                let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                if (sessionPlayer) {
                    session.send(
                        `
                        你已绑定，无需重复绑定。
                        以下是你的个人信息：
                        ID：${sessionPlayer.userId}
                        别名：${sessionPlayer.nickName || ""}
                        SteamID：${sessionPlayer.steamId}`.replace(/\n\s+/g, " ")
                    );
                    return;
                }
                // 此处执行玩家验证函数，调用API查询玩家比赛数据，若SteamID无效或无场次都将返回
                let verifyRes = await utils.playerisValid(steam_id);
                if (!verifyRes.isValid) {
                    session.send(`绑定失败，${verifyRes.reason}`);
                    return;
                }
                // 以上判定都通过则绑定成功
                session.send(
                    `
                    绑定成功，
                    ID：${session.event.user.id}
                    别名：${nick_name || ""}
                    SteamID：${steam_id}`.replace(/\n\s+/g, " ")
                );
                ctx.database.create("dt_subscribed_players", { userId: session.event.user.id, guildId: session.event.guild.id, platform: session.event.platform, steamId: parseInt(steam_id), nickName: nick_name || null });
            }
        });
    ctx.command("取消绑定", "取消绑定你的个人信息").action(async ({ session }) => {
        if (session.guild) {
            // 在已绑定玩家中查找当前玩家
            let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, userId: session.event.user.id }))[0];
            if (sessionPlayer) {
                await ctx.database.remove("dt_subscribed_players", sessionPlayer.id); // 从数据库中删除
                session.send("取消绑定成功。");
            } else session.send("尚未绑定，无需取消绑定。");
        }
    });

    ctx.command("改名 <nick_name>", "修改绑定时设定的别名")
        .example("-改名 李四")
        .action(async ({ session }, nick_name) => {
            if (session.guild) {
                let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                if (sessionPlayer) {
                    if (!nick_name) {
                        session.send("请输入你的别名。");
                        return;
                    }
                    sessionPlayer.nickName = nick_name;
                    await ctx.database.set("dt_subscribed_players", sessionPlayer.id, { nickName: sessionPlayer.nickName });
                    session.send(`改名成功，现在你叫${nick_name}了。`);
                } else {
                    session.send("请先绑定，绑定时即可设定别名。");
                }
            }
        });

    ctx.command("查询群友", "查询本群已绑定的玩家").action(async ({ session }) => {
        if (session.guild) {
            let queryRes = await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id });
            session.send("开发中，未来此功能会重写。\n" + queryRes.map((item) => `${item.nickName ?? ""}，ID：${item.userId}，SteamID：${item.steamId}`).join("\n"));
        }
    });
    // 查询比赛与查询最近比赛的共用代码块
    async function queryAndDisplayMatch(session, matchId) {
        try {
            let match;
            let queryLocal = await ctx.database.get("dt_previous_query_results", matchId, ["data"]);
            if (queryLocal.length > 0) {
                match = queryLocal[0].data;
                ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
            } else {
                let queryRes = await utils.query(queries.MATCH_INFO(matchId));
                if (queryRes.status == 200) {
                    match = utils.getFormattedMatchData(queryRes.data.data.match);
                }
            }
            if (match && match.parsedDateTime) {
                session.send(await ctx.puppeteer.render(genImageHTML(match, config.template_match, TemplateType.Match)));
                ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
            } else {
                pendingMatches.push({ matchId: matchId, platform: session.event.platform, guildId: session.event.guild.id });
                session.send("比赛尚未解析，将在解析完成后发布。");
            }
        } catch (error) {
            console.error(error);
            session.send("获取比赛信息失败。");
            ctx.database.remove("dt_previous_query_results", { matchId: parseInt(matchId) });
        }
    }

    ctx.command("查询比赛 <match_id>", "查询比赛ID")
        .usage("查询指定比赛ID的比赛数据，生成图片发布。")
        .example("-查询比赛 1234567890")
        .action(async ({ session }, match_id) => {
            if (!match_id) {
                session.send("请输入比赛ID。");
                return;
            }
            JSON.stringify;
            if (!/^\d{10}$/.test(match_id)) {
                session.send("比赛ID无效。");
                return;
            }

            session.send("正在搜索对局详情，请稍后...");

            queryAndDisplayMatch(session, match_id);

            // await ctx.puppeteer.render(await utils.getMatchImage_HTML(match_id));
        });

    ctx.command("查询最近比赛 [input_data]", "查询玩家的最近比赛")
        .usage("查询指定玩家的最近一场比赛的比赛数据，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .example("-查询最近比赛 123456789")
        .example("-查询最近比赛 张三")
        .action(async ({ session }, input_data) => {
            if (session.guild) {
                let sessionPlayer;
                if (!input_data) {
                    sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer = sessionPlayer || (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, nickName: input_data }))[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }

                let lastMatchId = 0;
                try {
                    session.send("正在搜索对局详情，请稍后...");
                    let queryRes = await utils.query(queries.PLAYERS_LASTMATCH([parseInt(flagBindedPlayer ? flagBindedPlayer.steamId : input_data)]));
                    lastMatchId = queryRes.data.data.players[0].matches[0].id;
                } catch {
                    session.send("获取玩家最近比赛失败。");
                    return;
                }
                queryAndDisplayMatch(session, lastMatchId);
            }
        });

    ctx.command("查询玩家 <input_data>", "查询玩家信息")
        .usage("查询指定玩家的个人信息与最近战绩，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .example("-查询玩家 123456789")
        .example("-查询玩家 张三")
        .action(async ({ session }, input_data) => {
            if (session.guild) {
                let sessionPlayer;
                if (!input_data) {
                    sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer = sessionPlayer || (await ctx.database.get("dt_subscribed_players", { guildId: session.event.guild.id, platform: session.event.platform, nickName: input_data }))[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }
                session.send("正在获取玩家数据，请稍后...");
                // let steamId = flagBindedPlayer ? flagBindedPlayer.steamId : input_data;
                let steamId = flagBindedPlayer?.steamId ?? input_data;
                let player;
                try {
                    let queryRes = await utils.query(queries.PLAYER_INFO_WITH_25_MATCHES(steamId));
                    if (queryRes.status == 200) {
                        player = queryRes.data.data.player;
                    } else throw 0;
                    let queryRes2 = await utils.query(queries.PLAYER_EXTRA_INFO(steamId, player.matchCount, Object.keys(dotaconstants.heroes).length));
                    if (queryRes2.status == 200) {
                        let playerExtra = queryRes2.data.data.player;
                        // 过滤和保留最高 level 的记录
                        let filteredDotaPlus = {};
                        playerExtra.dotaPlus.forEach((item) => {
                            if (!filteredDotaPlus[item.heroId] || filteredDotaPlus[item.heroId].level < item.level) {
                                filteredDotaPlus[item.heroId] = {
                                    heroId: item.heroId,
                                    level: item.level,
                                };
                            }
                        });

                        // 合并 heroesPerformance 数据
                        playerExtra.heroesPerformance.forEach((hero) => {
                            if (filteredDotaPlus[hero.hero.id]) {
                                filteredDotaPlus[hero.hero.id].shortName = hero.hero.shortName;
                                filteredDotaPlus[hero.hero.id].winCount = hero.winCount;
                                filteredDotaPlus[hero.hero.id].matchCount = hero.matchCount;
                            }
                        });

                        // 转换为数组
                        player.dotaPlus = Object.values(filteredDotaPlus); // 排序 dotaPlus 数组
                        player.dotaPlus.sort((a, b) => {
                            if (b.level !== a.level) {
                                return b.level - a.level;
                            }
                            return a.heroId - b.heroId;
                        });

                        // 取场次前十的英雄表现数据附加到原player对象中
                        player.heroesPerformanceTop10 = playerExtra.heroesPerformance.slice(0, 10);
                    } else throw 0;
                    session.send(await ctx.puppeteer.render(genImageHTML(player, config.template_player, TemplateType.Player)));
                } catch (error) {
                    console.error(error);
                    session.send("获取玩家信息失败。");
                }
            }
        });

    ctx.command("查询英雄 <input_data>", "查询英雄技能/面板信息")
        .usage("查询英雄的技能说明与各项数据，生成图片发布。\n参数可输入英雄ID、英雄名、英雄常用别名")
        .example("-查询英雄 15")
        .example("-查询英雄 雷泽")
        .example("-查询英雄 电魂")
        .action(async ({ session }, input_data) => {
            if (input_data) {
                let dc_heroes = Object.values(dotaconstants.heroes).map((hero) => ({ id: hero["id"], name: hero["name"], shortName: hero["name"].match(/^npc_dota_hero_(.+)$/)[1] }));
                let cn_heroes = Object.keys(d2a.HEROES_CHINESE).map((key) => ({
                    id: parseInt(key),
                    names_cn: d2a.HEROES_CHINESE[key],
                }));
                const mergedMap = new Map();
                [dc_heroes, cn_heroes].forEach((array) => {
                    array.forEach((item) => {
                        const existingItem = mergedMap.get(item.id);
                        if (existingItem) mergedMap.set(item.id, { ...existingItem, ...item });
                        else mergedMap.set(item.id, item);
                    });
                });
                let heroes = Array.from(mergedMap.values());
                let findingHero = heroes.find((hero) => hero.names_cn.includes(input_data) || hero.shortName === input_data.toLowerCase() || hero.id == input_data);
                if (!findingHero) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }

                try {
                    let AbilitiesConstantsCN;
                    let queryRes = await utils.query(queries.CURRENT_GAMEVERSION());
                    if (queryRes.status == 200) {
                        let queryConstants = queryRes.data.data.constants;
                        AbilitiesConstantsCN = (await ctx.database.get("dt_constants_abilities_cn", [1]))[0];
                        if (!AbilitiesConstantsCN || AbilitiesConstantsCN.gameVersionsId < queryConstants.gameVersions[0].id) {
                            session.send("初次使用或版本更新，正在更新英雄技能数据中……");
                            let queryRes2 = await utils.query(queries.ALL_ABILITIES_CHINESE_NAME());

                            if (queryRes2.status == 200) {
                                AbilitiesConstantsCN.data = queryRes2.data.data.constants;
                                await ctx.database.upsert("dt_constants_abilities_cn", (row) => [
                                    { id: 1, data: AbilitiesConstantsCN, gameVersionId: queryConstants.gameVersions[0].id, gameVersionName: queryConstants.gameVersions[0].name },
                                ]);
                            } else throw 0;
                        }
                    } else throw 0;
                    // hero
                    let queryRes3 = await utils.query(queries.HERO_INFO(findingHero.id));
                    if (queryRes3.status == 200) {
                        let hero = queryRes3.data.data.constants.hero;
                        hero.talents.forEach((talent) => (talent.name_cn = AbilitiesConstantsCN.data.abilities.find((item) => item.id == talent.abilityId).language.displayName));
                        await session.send(await ctx.puppeteer.render(genImageHTML(hero, config.template_hero, TemplateType.Hero)));
                    } else throw 0;
                } catch (error) {
                    console.error(error);
                    session.send("获取数据失败");
                    return;
                }
            } else {
                session.send("请输入参数。");
            }
        });

    ctx.command("查询英雄对战 <input_data:string>", "查询英雄近一周的最佳搭档与最佳克星英雄")
        .usage("根据输入英雄查询最近一周比赛数据（传奇~万古分段）中与该英雄组合胜率最高英雄和与该英雄对抗胜率最低英雄。\n参数可输入英雄ID、英雄名、英雄常用别名")
        .option("limit", "-l <value:number> 返回英雄个数（默认值 5）", { fallback: 5 })
        .option("filter", "-f <value:number> 过滤场数过低的组合（单位：%，默认值0.75）", { fallback: 0.5 })
        .example("-查询英雄对战 敌法师\t（无额外参数默认返回5个英雄，过滤舍弃场次占比0.75%以下）")
        .example("-查询英雄对战 敌法师 -l=10 -f=1\t（返回10个英雄，过滤舍弃场次占比1%以下）")
        .example("-查询英雄对战 敌法师 -l 10 -f 1\t（等同于上例，参数接空格也可使用）")
        .action(async ({ session, options }, input_data) => {
            if (input_data) {
                let dc_heroes = Object.values(dotaconstants.heroes).map((hero) => ({ id: hero["id"], name: hero["name"], shortName: hero["name"].match(/^npc_dota_hero_(.+)$/)[1] }));
                let cn_heroes = Object.keys(d2a.HEROES_CHINESE).map((key) => ({
                    id: parseInt(key),
                    names_cn: d2a.HEROES_CHINESE[key],
                }));
                const mergedMap = new Map();
                [dc_heroes, cn_heroes].forEach((array) => {
                    array.forEach((item) => {
                        const existingItem = mergedMap.get(item.id);
                        if (existingItem) mergedMap.set(item.id, { ...existingItem, ...item });
                        else mergedMap.set(item.id, item);
                    });
                });
                let heroes = Array.from(mergedMap.values());
                let findingHero = heroes.find((hero) => hero.names_cn.includes(input_data) || hero.shortName === input_data.toLowerCase() || hero.id == input_data);
                if (!findingHero) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }
                try {
                    let queryRes = await utils.query(queries.HERO_MATCHUP_WINRATE(findingHero.id));
                    if (queryRes.status == 200) {
                        let heroStats = queryRes.data.data.heroStats;
                        let withTopFive = heroStats.matchUp[0].with
                            .filter((item) => item.matchCount / heroStats.matchUp[0].matchCountWith > Math.max(0, Math.min(5, options.filter)) / 100)
                            .map((item) => {
                                const winRate = item.winCount / item.matchCount;
                                return { ...item, winRate: winRate.toFixed(3) };
                            })
                            .sort((a, b) => b.winRate - a.winRate)
                            .slice(0, Math.max(1, Math.min(Object.keys(dotaconstants.heroes).length - 1, options.limit)));
                        let vsBottomFive = heroStats.matchUp[0].vs
                            .filter((item) => item.matchCount / heroStats.matchUp[0].matchCountVs > Math.max(0, Math.min(5, options.filter)) / 100)
                            .map((item) => {
                                const winRate = item.winCount / item.matchCount;
                                return { ...item, winRate: winRate.toFixed(3) };
                            })
                            .sort((a, b) => a.winRate - b.winRate)
                            .slice(0, Math.max(1, Math.min(Object.keys(dotaconstants.heroes).length - 1, options.limit)));
                        session.send(
                            `你查询的英雄是${d2a.HEROES_CHINESE[heroStats.matchUp[0].heroId][0]}（ID：${heroStats.matchUp[0].heroId}），\n以下是7天内传奇-万古分段比赛数据总结而来的搭档与克制关系\n最佳搭档（组合胜率前${
                                options.limit
                            }）：${withTopFive.map((item) => `${d2a.HEROES_CHINESE[item.heroId2][0]}(胜率${(item.winRate * 100).toFixed(1)}%)`).join("、")}\n最佳克星（对抗胜率倒${options.limit}）：${vsBottomFive
                                .map((item) => `${d2a.HEROES_CHINESE[item.heroId2][0]}(胜率${(item.winRate * 100).toFixed(1)}%)`)
                                .join("、")}`
                        );
                    }
                } catch (error) {
                    console.error(error);
                    session.send("获取数据失败");
                    return;
                }
            }
        });

    // ctx.command("来个笑话").action(async ({ session }) => {
    //     session.send(await utils.getJoke());
    // });

    // ctx.command("test <input_data>").action(async ({ session }, input_data) => {
    //     // if (input_data) {
    //     //     let dc_heroes = Object.values(dotaconstants.heroes).map((hero) => ({ id: hero["id"], name: hero["name"], shortName: hero["name"].match(/^npc_dota_hero_(.+)$/)[1] }));
    //     //     let cn_heroes = Object.keys(d2a.HEROES_CHINESE).map((key) => ({
    //     //         id: parseInt(key),
    //     //         names_cn: d2a.HEROES_CHINESE[key],
    //     //     }));
    //     //     const mergedMap = new Map();
    //     //     [dc_heroes, cn_heroes].forEach((array) => {
    //     //         array.forEach((item) => {
    //     //             const existingItem = mergedMap.get(item.id);
    //     //             if (existingItem) mergedMap.set(item.id, { ...existingItem, ...item });
    //     //             else mergedMap.set(item.id, item);
    //     //         });
    //     //     });
    //     //     let heroes = Array.from(mergedMap.values());
    //     //     let hero = heroes.find((hero) => hero.names_cn.includes(input_data) || hero.shortName === input_data.toLowerCase() || hero.id == input_data);
    //     //     session.send(JSON.stringify(hero));
    //     // }
    //     session.send(`${random.pick(["嗯", "啊", "蛤", "啥", "咋", "咦", "哦"])}？`);
    //     // ctx.broadcast(["chronocat:304996520"], "-test");
    //     // ctx.broadcast(["chronocat:304996520"], "-test1");
    //     // session.send();
    // });

    ctx.on("ready", async () => {
        const tables = await ctx.database.tables;
        if (!("dt_subscribed_guilds" in tables)) {
            ctx.model.extend("dt_subscribed_guilds", { id: "unsigned", guildId: "string", platform: "string" }, { autoInc: true });
        }
        if (!("dt_subscribed_players" in tables)) {
            ctx.model.extend("dt_subscribed_players", { id: "unsigned", userId: "string", guildId: "string", platform: "string", steamId: "integer", nickName: "string" }, { autoInc: true });
        }
        if (!("dt_sended_match_id" in tables)) {
            ctx.model.extend("dt_sended_match_id", { matchId: "unsigned", sendTime: "timestamp" }, { primary: "matchId" });
        }
        if (!("dt_previous_query_results" in tables)) {
            ctx.model.extend("dt_previous_query_results", { matchId: "unsigned", data: "json", queryTime: "timestamp" }, { primary: "matchId" });
        }
        if (!("dt_constants_abilities_cn" in tables)) {
            ctx.model.extend("dt_constants_abilities_cn", { id: "unsigned", data: "json", gameVersionId: "unsigned", gameVersionName: "string" }, { primary: "id" });
        }
        // 每隔6小时尝试清除一个月前的发送记录和查询缓存
        ctx.cron("0 */6 * * *", () => {
            const oneMonthAgo = moment().subtract(1, "months").toDate();
            ctx.database.remove("dt_sended_match_id", { sendTime: { $lt: oneMonthAgo } });
            ctx.database.remove("dt_previous_query_results", { queryTime: { $lt: oneMonthAgo } });
        });
        // 每分钟执行一次查询玩家最近比赛记录，若未发布过则进入待发布列表；检查待发布列表，若满足发布条件（比赛已被解析）则生成图片并发布。
        ctx.cron("* * * * *", async function () {
            // 获取注册玩家ID，每分钟获取玩家最新比赛，判定是否播报过

            const scanningMatches = [...pendingMatches];
            const subscribedGuilds = await ctx.database.get("dt_subscribed_guilds", undefined);
            const subscribedPlayersInGuild = (await ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedGuilds.some((guild) => guild.guildId == player.guildId));
            if (subscribedPlayersInGuild.length > 0) {
                let queryRes = await utils.query(
                    queries.PLAYERS_LASTMATCH(
                        subscribedPlayersInGuild
                            .map((player) => player.steamId)
                            .filter(function (value, index, self) {
                                return self.indexOf(value) === index;
                            })
                    )
                );

                for (let player of queryRes.data.data.players) {
                    let lastMatch = player.matches[0];
                    if ((await ctx.database.get("dt_sended_match_id", { matchId: lastMatch.id })).length) continue;
                    // if (pendingMatches.find((item) => item.matchId === lastMatch.id) != undefined) continue;
                    if (moment.unix(lastMatch.startDateTime).isBefore(moment().subtract(1, "days"))) continue;
                    for (let subscribed_player of subscribedPlayersInGuild) {
                        if (player.steamAccount.id == subscribed_player.steamId) {
                            scanningMatches.push({ matchId: lastMatch.id, platform: subscribed_player.platform, guildId: subscribed_player.guildId });
                            ctx.logger.info(`追踪到来自群组${subscribed_player.platform}:${subscribed_player.guildId}-用户${subscribed_player.nickName ?? ""}(${subscribed_player.steamId})的尚未播报过的最新比赛 ${lastMatch.id}。`);
                        }
                    }
                }
            }

            // 获取待解析比赛列表并发布 (若待解析列表数量不止一场，每分钟只取第一位进行尝试防止同时高并发调用API)
            if (scanningMatches.length > 0) {
                const pendingMatch = scanningMatches[0];
                try {
                    let match;
                    let queryLocal = await ctx.database.get("dt_previous_query_results", pendingMatch.matchId, ["data"]);
                    if (queryLocal.length > 0) {
                        match = queryLocal[0].data;
                        ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
                    } else {
                        let queryRes = await utils.query(queries.MATCH_INFO(pendingMatch.matchId));
                        if (queryRes.status == 200) {
                            match = queryRes.data.data.match.parsedDateTime ? utils.getFormattedMatchData(queryRes.data.data.match) : queryRes.data.data.match;
                        }
                    }
                    if (match.parsedDateTime || moment.unix(match.startDateTime).isBefore(moment().subtract(1, "years"))) {
                        const commingMatches = scanningMatches.filter((item) => item.matchId == match.id);
                        // pendingMatches = pendingMatches.filter((item) => item.matchId != match.id);
                        const realCommingMatches = commingMatches.filter((commingMatch, index, self) => index === self.findIndex((t) => t.guildId === commingMatch.guildId && t.platform === commingMatch.platform));

                        // let realCommingMatches = [];
                        // for (let commingMatch of commingMatches) {
                        //     let flag = true;
                        //     for (let realCommingMatch of realCommingMatches) {
                        //         if (realCommingMatch.guildId == commingMatch.guildId && realCommingMatch.platform == commingMatch.platform) {
                        //             flag = false;
                        //             break;
                        //         }
                        //     }
                        //     if (flag) realCommingMatches.push(commingMatch);
                        // }

                        // pendingMatches.shift();
                        // await session.send(await ctx.puppeteer.render(genMatchImageHTML(match)));

                        let broadMatchMessage = "";
                        const img = await ctx.puppeteer.render(genImageHTML(match, config.template_match, TemplateType.Match));
                        for (let comming of realCommingMatches) {
                            let commingSubscribedPlayers = subscribedPlayersInGuild.filter((item) => item.platform == comming.platform && item.guildId == comming.guildId);
                            let idsToFind = commingSubscribedPlayers.map((item) => item.steamId);
                            let broadPlayers = match.players.filter((item) => idsToFind.includes(item.steamAccountId));
                            for (let player of broadPlayers) {
                                let broadPlayerMessage = `${player.steamAccount.name}的${random.pick(d2a.HEROES_CHINESE[player.hero.id])}`;
                                if (player.isRadiant == match.didRadiantWin) {
                                    if (player.deathContribution < 0.2 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.5 || player.towerDamage > 10000 || player.imp > 0)
                                        broadPlayerMessage += random.pick(d2a.WIN_POSITIVE);
                                    else broadPlayerMessage += random.pick(d2a.WIN_NEGATIVE);
                                } else {
                                    if (player.deathContribution < 0.25 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.25 || player.towerDamage > 5000 || player.imp > 0)
                                        broadPlayerMessage += random.pick(d2a.LOSE_POSITIVE);
                                    else broadPlayerMessage += random.pick(d2a.LOSE_NEGATIVE);
                                }
                                // (ノ°口°)ノ（使用虚无之灵, KDA: 1.43[3/7/7], GPM/XPM: 388/574, 补刀数: 134, 总伤害: 18059(24.92%), 参战率: 45.45%, 参葬率: 13.73%
                                broadPlayerMessage += `。\nKDA：${((player.kills + player.assists) / (player.deaths || 1)).toFixed(2)} [${player.kills}/${player.deaths}/${player.assists}]，GPM/XPM：${player.goldPerMinute}/${
                                    player.experiencePerMinute
                                }，补刀数：${player.numLastHits}/${player.numDenies}，伤害/塔伤：${player.heroDamage}/${player.towerDamage}，参战/参葬率：${(player.killContribution * 100).toFixed(2)}%/${(
                                    player.deathContribution * 100
                                ).toFixed(2)}%`;
                                broadMatchMessage += broadPlayerMessage + "\n";
                            }
                            await ctx.broadcast([`${comming.platform}:${comming.guildId}`], broadMatchMessage + img);
                        }
                        ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
                        ctx.database.create("dt_sended_match_id", { matchId: match.id, sendTime: new Date() });
                    } else ctx.logger.info("比赛 %d 尚未解析完成，继续等待。", match.id);
                } catch (error) {
                    console.error(error);
                    // session.send("获取比赛信息失败。");
                    ctx.database.remove("dt_previous_query_results", { matchId: pendingMatch.matchId });
                }
            }
        });
    });
    ctx.on("dispose", async () => {
        // await save_database(ctx);
        // timer();
    });
    // ctx.broadcast(['chronocat:304996520'],"tttt");
    // save_database(ctx)
}

enum TemplateType {
    Match = "match",
    Player = "player",
    Hero = "hero",
    GuildMember = "guild_member",
}

function genImageHTML(data, template, type: TemplateType) {
    // 模板文件的路径
    const templatePath = path.join(`./node_modules/@sjtdev/koishi-plugin-${name}/template/${type}`, template + ".ejs");
    const templateData = {
        data: data,
        utils: utils,
        ImageType: ImageType,
        d2a: d2a,
        dotaconstants: dotaconstants,
        moment: moment,
    };

    let result = "";
    // 渲染EJS模板
    ejs.renderFile(templatePath, templateData, (err, html) => {
        if (err) throw err;
        else result = html;
    });
    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", result);
    return result;
}
