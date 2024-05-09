import { Context, Schema, h } from "koishi";
import * as utils from "./utils.ts";
import { ImageType } from "./utils.ts";
import * as puppeteer from "koishi-plugin-puppeteer";
import fs from "fs";
import * as cheerio from "cheerio";
import moment from "moment";
import * as dotaconstants from "dotaconstants";
import * as d2a from "./dotaconstants_add.json";
import { Random } from "koishi";
import * as cron from "koishi-plugin-cron";

export const name = "dota2tracker";
export const usage = "DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。";
export const inject = ["database", "puppeteer", "cron"]; // 声明依赖

export interface Config {
    // 配置项
    STRATZ_API_TOKEN: string;
}

export const Config: Schema<Config> = Schema.object({
    STRATZ_API_TOKEN: Schema.string().required().description("※必须。stratz.com的API TOKEN，可在 https://stratz.com/api 获取"),
});

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
                let verifyRes = await playerIsInvalid(steam_id);
                if (!verifyRes.isInvalid) {
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

    ctx.command("查询比赛 <match_id>", "查询比赛ID")
        .usage("查询指定比赛ID的比赛数据，生成图片发布。")
        .example("-查询比赛 1234567890")
        .action(async ({ session }, match_id) => {
            if (!match_id) {
                session.send("请输入比赛ID。");
                return;
            }
            if (!/^\d{10}$/.test(match_id)) {
                session.send("比赛ID无效。");
                return;
            }

            session.send("正在搜索对局详情，请稍后...");

            try {
                let match;
                let queryLocal = await ctx.database.get("dt_previous_query_results", match_id, ["data"]);
                if (queryLocal.length > 0) {
                    match = queryLocal[0].data;
                    ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
                } else {
                    let queryRes = await utils.query(utils.MATCH_QUERY_GRAPHQL(match_id));
                    if (queryRes.status == 200) {
                        // console.log(query_res.data.data);
                        match = utils.getFormattedMatchData(queryRes.data.data.match);
                    }
                }
                if (match.parsedDateTime) {
                    session.send(await ctx.puppeteer.render(genMatchImageHTML(match)));
                    ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
                } else {
                    pendingMatches.push({ matchId: match_id, platform: session.event.platform, guildId: session.event.guild.id });
                    session.send("比赛尚未解析，将在解析完成后发布。");
                }
            } catch (error) {
                console.error(error);
                session.send("获取比赛信息失败。");
            }

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
                    let queryRes = await utils.query(utils.PLAYERS_LASTMATCH_GRAPHQL([parseInt(flagBindedPlayer ? flagBindedPlayer.steamId : input_data)]));
                    lastMatchId = queryRes.data.data.players[0].matches[0].id;
                } catch {
                    session.send("获取玩家最近比赛失败。");
                    return;
                }
                try {
                    let match;
                    let queryLocal = await ctx.database.get("dt_previous_query_results", lastMatchId, ["data"]);
                    if (queryLocal.length > 0) {
                        match = queryLocal[0].data;
                    } else {
                        let queryRes = await utils.query(utils.MATCH_QUERY_GRAPHQL(lastMatchId));
                        if (queryRes.status == 200) {
                            // console.log(query_res.data.data);
                            match = utils.getFormattedMatchData(queryRes.data.data.match);
                        }
                    }
                    if (match.parsedDateTime) {
                        session.send(await ctx.puppeteer.render(genMatchImageHTML(match)));
                        ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
                    } else {
                        pendingMatches.push({ matchId: lastMatchId, platform: session.event.platform, guildId: session.event.guild.id });
                        session.send("比赛尚未解析，将在解析完成后发布。");
                    }
                } catch (error) {
                    console.error(error);
                    session.send("获取比赛信息失败。");
                }
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
                    let queryRes = await utils.query(utils.PLAYER_INFO_WITH_25_MATCHES(steamId));
                    if (queryRes.status == 200) {
                        player = queryRes.data.data.player;
                    } else throw 0;
                    let queryRes2 = await utils.query(utils.PLAYER_EXTRA_INFO(steamId, player.matchCount, Object.keys(dotaconstants.heroes).length));
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
                    session.send(await ctx.puppeteer.render(genPlayerHTML(player)));
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
                    let queryRes = await utils.query(utils.CURRENT_GAMEVERSION());
                    if (queryRes.status == 200) {
                        let queryConstants = queryRes.data.data.constants;
                        AbilitiesConstantsCN = (await ctx.database.get("dt_constants_abilities_cn", [1]))[0];
                        if (!AbilitiesConstantsCN || AbilitiesConstantsCN.gameVersionsId < queryConstants.gameVersions[0].id) {
                            session.send("初次使用或版本更新，正在更新英雄技能数据中……");
                            let queryRes2 = await utils.query(utils.ALL_ABILITIES_CHINESE_NAME());

                            if (queryRes2.status == 200) {
                                AbilitiesConstantsCN.data = queryRes2.data.data.constants;
                                await ctx.database.upsert("dt_constants_abilities_cn", (row) => [
                                    { id: 1, data: AbilitiesConstantsCN, gameVersionId: queryConstants.gameVersions[0].id, gameVersionName: queryConstants.gameVersions[0].name },
                                ]);
                            } else throw 0;
                        }
                    } else throw 0;
                    // hero
                    let queryRes3 = await utils.query(utils.HEROINFO(findingHero.id));
                    if (queryRes3.status == 200) {
                        let hero = queryRes3.data.data.constants.hero;
                        hero.talents.forEach((talent) => (talent.name_cn = AbilitiesConstantsCN.data.abilities.find((item) => item.id == talent.abilityId).language.displayName));
                        await session.send(await ctx.puppeteer.render(genHeroHTML(hero)));
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
                    let queryRes = await utils.query(utils.HERO_MATCHUP_WINRATE(findingHero.id));
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
                    utils.PLAYERS_LASTMATCH_GRAPHQL(
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
                        let queryRes = await utils.query(utils.MATCH_QUERY_GRAPHQL(pendingMatch.matchId));
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
                        const img = await ctx.puppeteer.render(genMatchImageHTML(match));
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
                                broadPlayerMessage += `。\nKDA：${((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2)} [${player.kills}/${player.deaths}/${player.assists}]，GPM/XPM：${player.goldPerMinute}/${
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

function genMatchImageHTML(match) {
    let $ = cheerio.load(fs.readFileSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/match.html`, "utf-8"));
    let kcndcStyle = {
        kc: function (num: number) {
            let red = (255 - (num * 255) / 100).toFixed(2);
            return `rgb(255,${red},${red})`;
        },
        dc: function (num: number) {
            let gray = ((50 - Math.min(num, 50)) * (255 / 50)).toFixed(2);
            return `rgb(${gray},${gray},${gray})`;
        },
    };
    // 对线结果的图标（来自免费SVG素材网）
    const laneSVG = {
        stomp: `<svg viewBox="0 0 24 24" class="hitagi__sc-1apuy4g-0 hmhZOG"><path d="M8.05731 22.3674L9.60454 22.8002L11.5974 21.6551L12.043 20.0773L13.5902 20.51L15.583 19.3649L16.0287 17.7871L17.5759 18.2199L19.5687 17.0748L20.0143 15.4969L21.5615 15.9297L23.5544 14.7846L24 13.2068L23.4492 12.2014L7.50651 21.3621L8.05731 22.3674ZM12.1328 3.50265L11.0312 1.49196C10.8798 1.21549 10.5316 1.11811 10.2576 1.27556L0.29345 7.00098C0.0194354 7.15843 -0.0808273 7.51346 0.0706444 7.78993L1.44766 10.3033L11.91 4.29159C12.184 4.13414 12.2843 3.77912 12.1328 3.50265ZM18.3935 8.4063L14.1658 9.60458L12.4221 10.6065C12.2851 10.6853 12.111 10.6366 12.0353 10.4983L11.7599 9.99565C11.6842 9.85742 11.7343 9.6799 11.8713 9.60118L13.615 8.59924L13.0642 7.59389L11.3205 8.59584C11.1835 8.67456 11.0094 8.62587 10.9337 8.48765L10.6583 7.98497C10.5826 7.84673 10.6327 7.66922 10.7697 7.5905L12.5134 6.58855L11.9626 5.58321L1.99846 11.3086L6.9557 20.3567L22.8984 11.196L22.2615 10.0336C21.5024 8.64813 19.9073 7.97847 18.3935 8.4063Z"></path></svg>`,
        victory: `<svg viewBox="0 0 512 512"><path d="M198.844 64.75c-.985 0-1.974.03-2.97.094-15.915 1.015-32.046 11.534-37.78 26.937-34.072 91.532-51.085 128.865-61.5 222.876 14.633 13.49 31.63 26.45 50.25 38.125l66.406-196.467 17.688 5.968L163.28 362.5c19.51 10.877 40.43 20.234 62 27.28l75.407-201.53 17.5 6.53-74.937 200.282c19.454 5.096 39.205 8.2 58.78 8.875L381.345 225.5l17.094 7.594-75.875 170.656c21.82-1.237 43.205-5.768 63.437-14.28 43.317-53.844 72.633-109.784 84.5-172.69 5.092-26.992-14.762-53.124-54.22-54.81l-6.155-.282-2.188-5.75c-8.45-22.388-19.75-30.093-31.5-32.47-11.75-2.376-25.267 1.535-35.468 7.376l-13.064 7.47-.906-15c-.99-16.396-10.343-29.597-24.313-35.626-13.97-6.03-33.064-5.232-54.812 9.906l-10.438 7.25-3.812-12.125c-6.517-20.766-20.007-27.985-34.78-27.97zM103.28 188.344C71.143 233.448 47.728 299.56 51.407 359.656c27.54 21.84 54.61 33.693 80.063 35.438 14.155.97 27.94-1.085 41.405-6.438-35.445-17.235-67.36-39.533-92.594-63.53l-3.343-3.157.5-4.595c5.794-54.638 13.946-91.5 25.844-129.03z"/></svg>`,
        fail: `<svg viewBox="0 0 36 36"><path fill="#ff6961" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"></path><circle fill="#FFF" cx="27" cy="7" r="3"></circle><path fill="#FFF" d="M13.06 13.06l2.367-2.366l3.859 1.158l-2.635 2.847a10.018 10.018 0 0 1 4.392 3.379l5.017-5.017a1.5 1.5 0 0 0-.63-2.497l-9.999-3a1.495 1.495 0 0 0-1.492.376l-3 3a1.5 1.5 0 1 0 2.121 2.12zm16.065 4.949a1.496 1.496 0 0 0-1.262-.503l-6.786.617a9.966 9.966 0 0 1 1.464 2.879l3.548-.322l-1.554 6.995a1.499 1.499 0 1 0 2.928.65l2-9a1.5 1.5 0 0 0-.338-1.316zM13 16a8 8 0 1 0 0 16a8 8 0 0 0 0-16zm0 14a6 6 0 1 1 .002-12.002A6 6 0 0 1 13 30z"></path></svg>`,
        stomped: `<svg viewBox="-1 0 19 19"><path d="M16.417 9.579A7.917 7.917 0 1 1 8.5 1.662a7.917 7.917 0 0 1 7.917 7.917zm-2.458 2.96a.396.396 0 0 0-.396-.397h-.667a1.527 1.527 0 0 0-1.249-1.114.777.777 0 0 0 .014-.145V9.378a.794.794 0 0 0-.792-.792H8.201a2.984 2.984 0 0 0-1.682-.516l-.11.002V7.42h2.997a.396.396 0 1 0 0-.792H6.41v-1.3a.396.396 0 0 0-.396-.397H4.891a.396.396 0 0 0 0 .792h.727V8.21a2.997 2.997 0 1 0 3.836 3.466h.71a1.526 1.526 0 1 0 2.732 1.26h.667a.396.396 0 0 0 .396-.397zM8.078 9.507a2.205 2.205 0 1 1-1.559-.646 2.19 2.19 0 0 1 1.559.646zm4.078 3.03a.734.734 0 1 1-.733-.734.735.735 0 0 1 .733.733z"/></svg>`,
        tie: `<svg fill="#fff" viewBox="0 0 512.001 512.001"><g><g><path d="M120.988,239.868c-4.496,10.625-5.122,20.183-5.157,20.811c-0.267,4.607,3.243,8.547,7.849,8.829 c4.618,0.29,8.574-3.228,8.873-7.833c0.265-4.771,2.339-13.092,5.884-19.44C137.421,242.113,141.397,242.649,120.988,239.868z"/></g></g><g><g><path d="M391.178,255.418c-0.211,8.054-2.458,17.62-6.74,28.398c-1.708,4.299,0.393,9.168,4.692,10.875 c4.293,1.708,9.167-0.39,10.875-4.692c5.103-12.842,7.74-24.392,7.943-34.581H391.178z"/></g></g><g><g><path d="M164.769,210.51c1.046,3.339,1.397,6.953,0.893,10.65c-0.293,2.146-0.857,4.188-1.648,6.1c0,0,51.266,3.416,198.065,3.949 c-0.086-6.331,2.19-12.199,6.244-16.732C217.627,214.046,164.769,210.51,164.769,210.51z"/></g></g><g><g><circle cx="37.179" cy="128.669" r="29.491"/></g></g><g><g><path d="M510.146,391.511l-37.916-66.985c14.35-49.173,20.678-68.137,20.678-68.137l8.949-67.014 c1.502-10.977-6.248-21.075-17.235-22.468l-18.183-2.305c-10.984-1.393-20.996,6.445-22.293,17.431l-1.884,15.955l28.718-21.317 l-37.91,42.278h-46.432c-6.571,0-11.898,5.328-11.898,11.898c0,6.57,5.328,11.898,11.898,11.898h51.744 c3.381,0,6.601-1.438,8.859-3.956l41.456-46.234l-32.023,54.694c-5.28,9.018-14.374,8.169-18.293,8.167c-1.959,0-3.31,0-5.295,0 c-0.399,0.898,3.152-7.399-24.44,57.181c-0.548,1.284-0.907,2.642-1.06,4.031l-8.934,80.338 c-0.939,8.447,5.667,15.857,14.208,15.857c7.179,0,13.361-5.401,14.172-12.701l8.702-78.244l21.512-50.353l-14.121,50.463 c-1.158,3.756-0.718,7.823,1.218,11.243l40.949,72.345c3.885,6.864,12.596,9.276,19.459,5.392 C511.615,407.085,514.03,398.373,510.146,391.511z"/></g></g><g><g><circle cx="464.865" cy="128.702" r="29.491"/></g></g><g><g><path d="M142.923,206.051l-59.556-8.118l-39.135-18.451l13.626,2.292c-1.422-10.945-11.411-18.577-22.254-17.202l-18.182,2.305 C6.43,168.271-1.315,178.374,0.186,189.345l9.12,68.689l21.865,70.857l5.829,70.795c0.646,7.848,7.527,13.705,15.401,13.057 c7.859-0.647,13.705-7.542,13.058-15.401l-5.956-72.345c-0.084-1.031-0.281-2.05-0.585-3.039l-14.123-50.463l21.514,50.353 l8.702,78.244c0.873,7.86,7.96,13.486,15.768,12.612c7.838-0.871,13.483-7.931,12.612-15.768l-8.934-80.338 c-0.154-1.388-0.511-2.747-1.06-4.032l-27.336-61.43l-2.945-24.951l-29.029-25.179l40.79,19.231 c1.097,0.517,2.266,0.862,3.468,1.027l61.369,8.365c6.521,0.887,12.509-3.68,13.396-10.183 C153.994,212.936,149.435,206.939,142.923,206.051z"/></g></g></svg>`,
    };
    // 填充头部比赛信息模板
    let matchInfo_html = `
    <img src="${utils.getImageUrl("flag_radiant")}" alt="" class="flag radiant${match.didRadiantWin ? " won" : ""}" style="order: 1" />
    <img src="${utils.getImageUrl("flag_dire")}" alt="" class="flag dire${match.didRadiantWin ? "" : " won"}" style="order: 3" />
    <p class="won${match.didRadiantWin ? " radiant" : ""}">获胜</p>
    <div class="details" style="order: 2">
        <p>比赛编号：<span class="match_id">${match.id}</span></p>
        <p>模式：<span class="mode">${d2a.lobbyTypes[match.lobbyType] || match.lobbyType}/${d2a.gameMode[match.gameMode] || match.gameMode}</span></p>
        <p>服务器：<span class="server">${d2a.region[match.regionId]}</span></p>
        <p>起始时间：<span class="start_time">${moment(new Date(match.startDateTime * 1000))
            .format("YYYY-MM-DD HH:mm:ss")
            .slice(2)}</span></p>
        <img src="${utils.getImageUrl("star_" + match.rank?.toString().split("")[1])}" alt="" class="star">
        <img src="${utils.getImageUrl("medal_" + match.rank?.toString().split("")[0])}" alt="" class="rank">
        <p>结束时间：<span class="end_time">${moment(new Date(match.endDateTime * 1000))
            .format("YYYY-MM-DD HH:mm:ss")
            .slice(2)}</span></p>
        <div class="score">
            <p class="score radiant">${match.radiantKillsCount}</p>
            <p class="time">${sec2time(match.durationSeconds)}</p>
            <p class="score dire">${match.direKillsCount}</p>
        </div>
    </div>
    `;
    $(".match_info").html(matchInfo_html);

    let players_html = { radiant: "", dire: "" };
    match.players.forEach((player) => {
        players_html[player.isRadiant ? "radiant" : "dire"] += sanitizeHTML`
    <div class="player${player.hero.id == 80 ? " bear" : ""}${player.leaverStatus != "NONE" && player.leaverStatus != "DISCONNECTED" ? " giveup" : ""}" style="order:${player.position?.slice(-1)}">
        <div class="hero">
            <div class="player_avatar">
                <img alt="" src="${utils.getImageUrl(player.hero.shortName, ImageType.Heroes)}" />
                <p class="party_line${player.partyId != null ? " party_" + match.party[player.partyId] : ""}"></p>
                <p class="party_mark${player.partyId != null ? " party_" + match.party[player.partyId] : ""}"></p>
                <p class="position p${Math.floor(player.order / 4) + 1}">${player.isRandom ? "随机" : `第<span>${player.order ? player.order + 1 : "-"}</span>手`}<br/>${d2a.position[player.position?.slice(-1)]}</p>
                <p class="level">${player.level}</p>
            </div>
            <div class="player_info">
                <summary class="player_name">${player.steamAccount.name}</summary>
                <summary class="player_performance">
                    <span class="kda">${player.kills}/${player.deaths}/${player.assists}</span>&nbsp;&nbsp;
                    <span class="kc" style="color:${kcndcStyle.kc(player.killContribution * 100)}">${Math.floor(player.killContribution * 100)}%</span>&nbsp;&nbsp;
                    <span class="dc" style="color:${kcndcStyle.dc(player.deathContribution * 100)}">${Math.floor(player.deathContribution * 100)}%</span></summary>
                <summary class="player_net"><span class="networth">${player.networth}</span>&emsp;<span class="score">${(player.heroDamage / player.networth)?.toFixed(2)}</span></summary>
            </div>
            <div class="player_lane ${player.laneResult}">
                ${laneSVG[player.laneResult]}
            </div>
            <div class="player_rank">
            ${
                player.steamAccount.seasonRank
                    ? `
                <div class="rank">
                    <img class="medal" src="${utils.getImageUrl(
                        "medal_" +
                            (player.steamAccount.seasonLeaderboardRank
                                ? player.steamAccount.seasonLeaderboardRank <= 100
                                    ? player.steamAccount.seasonLeaderboardRank <= 10
                                        ? "8c"
                                        : "8b"
                                    : player.steamAccount.seasonRank.toString().split("")[0]
                                : player.steamAccount.seasonRank.toString().split("")[0])
                    )}" alt="" />
                    ${
                        !player.steamAccount.seasonLeaderboardRank
                            ? `
                    <img class="star" src="${utils.getImageUrl("star_" + player.steamAccount.seasonRank.toString().split("")[1])}" alt="" />`
                            : `
                    <p>${player.steamAccount.seasonLeaderboardRank}</p>`
                    }
                </div>`
                    : `
                <div class="norank">
                    <img class="medal" src="${utils.getImageUrl("medal_0")}" alt="" />
                </div>`
            }
                <div class="dotaPlusLevel"${!player.dotaPlus ? ` style="display:none"` : ""}>
                    <img src="${utils.getImageUrl("hero_badge_" + (player.dotaPlus ? Math.ceil((player.dotaPlus?.level + 1) / 6) : 1))}" alt="" class="badge">
                    <p class="level">${player.dotaPlus?.level}</p>
                </div>
            </div>
        </div>
        <div class="titles">
            ${player.titles.map((item) => `<span style="color: ${item.color};">${item.name}</span>`).join("&nbsp;")}
        </div>
        ${
            player.hero.id != 80
                ? `
        <div class="items">
            <div class="items_normal">
            ${player.items
                .map((item) =>
                    item
                        ? `
                <div class="item${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                        : `
                <div class="item" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />
                    <p class="time">--:--</p>
                </div>`
                )
                .join("")}
            </div>
            <div class="items_backpack">
            ${player.backpacks
                .map((item) =>
                    item
                        ? `
                <div class="item back${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                        : `
                <div class="item back" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />
                    <p class="time">--:--</p>
                </div>`
                )
                .join("")}
            </div>
            <div class="item neutral" style="background-image: url(${utils.getImageUrl(dotaconstants.item_ids[player.neutral0Id], ImageType.Items)})"></div>
        </div>
        <div class="buffs">
            <section>
                ${player.stats?.matchPlayerBuffEvent
                    ?.map(
                        (buff) => `
                <div class="buff">
                    <img src="${utils.getImageUrl(dotaconstants[buff.abilityId ? "ability_ids" : "item_ids"][buff.abilityId ?? buff.itemId], buff.abilityId ? ImageType.Abilities : ImageType.Items)}" alt="" />
                    <p>${buff.stackCount ?? ""}</p>
                </div>`
                    )
                    .join("")}
            </section>
            <section>
                <div class="support_item"${player.supportItemsCount[30] > 0 ? "" : ' style="display:none"'}>
                    <img src="${utils.getImageUrl("gem", ImageType.Items)}" alt="" />
                    <p>${player.supportItemsCount[30]}</p>
                </div>
                <div class="support_item"${player.supportItemsCount[40] > 0 ? "" : ' style="display:none"'}>
                    <img src="${utils.getImageUrl("dust", ImageType.Items)}" alt="" />
                    <p>${player.supportItemsCount[40]}</p>
                </div>
                <div class="support_item"${player.supportItemsCount[42] > 0 ? "" : ' style="display:none"'}>
                    <img src="${utils.getImageUrl("ward_observer", ImageType.Items)}" alt="" />
                    <p>${player.supportItemsCount[42]}</p>
                </div>
                <div class="support_item"${player.supportItemsCount[43] > 0 ? "" : ' style="display:none"'}>
                    <img src="${utils.getImageUrl("ward_sentry", ImageType.Items)}" alt="" />
                    <p>${player.supportItemsCount[43]}</p>
                </div>
                <div class="support_item"${player.supportItemsCount[188] > 0 ? "" : ' style="display:none"'}>
                    <img src="${utils.getImageUrl("smoke_of_deceit", ImageType.Items)}" alt="" />
                    <p>${player.supportItemsCount[188]}</p>
                </div>
            </section>
        </div>`
                : `
        <div class="items_buffs master">
            <div class="items master">
                ${player.items
                    .map((item) =>
                        item
                            ? `
                <div class="item${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                            : `
                <div class="item" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />>
                    <p class="time">--:--</p>
                </div>`
                    )
                    .join("")}
                ${player.backpacks
                    .map((item) =>
                        item
                            ? `
                <div class="item back${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                            : `
                <div class="item back" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />
                    <p class="time">--:--</p>
                </div>`
                    )
                    .join("")}
                <div class="item neutral">
                    <img src="${utils.getImageUrl(dotaconstants.item_ids[player.neutral0Id], ImageType.Items)}" alt="" />
                </div>
            </div>
            <div class="buffs master">
                ${player.stats?.matchPlayerBuffEvent
                    ?.map(
                        (buff) => `
                <div class="buff">
                    <img src="${utils.getImageUrl(dotaconstants[buff.abilityId ? "ability_ids" : "item_ids"][buff.abilityId ?? buff.itemId], buff.abilityId ? ImageType.Abilities : ImageType.Items)}" alt="" />
                    <p>${buff.stackCount ?? ""}</p>
                </div>`
                    )
                    .join("")}
            </div>
        </div>
        <div class="items_buffs slave">
            <div class="items slave">
                ${player.unitItems
                    .map((item) =>
                        item
                            ? `
                <div class="item${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                            : `
                <div class="item" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />>
                    <p class="time">--:--</p>
                </div>`
                    )
                    .join("")}
                ${player.unitBackpacks
                    .map((item) =>
                        item
                            ? `
                <div class="item back${item.isRecipe ? " recipe" : ""}">
                    <img src="${utils.getImageUrl(item.name, ImageType.Items)}" alt="" />
                    <p class="time">${sec2time(item.time)}</p>
                </div>`
                            : `
                <div class="item back" style="visibility:hidden"}">
                    <img src="${utils.getImageUrl("blink", ImageType.Items)}" alt="" />
                    <p class="time">--:--</p>
                </div>`
                    )
                    .join("")}
                <div class="item neutral">
                    <img src="${utils.getImageUrl(dotaconstants.item_ids[player.additionalUnit.neutral0Id], ImageType.Items)}" alt="" />
                </div>
            </div>
            <div class="buffs_supportItems slave">
                <div class="buffs">
                    <!-- 无有效API获取熊灵buff -->
                </div>
                <div class="support_items">
                    <div class="support_item"${player.supportItemsCount[30] > 0 ? "" : ' style="display:none"'}>
                        <img src="${utils.getImageUrl("gem", ImageType.Items)}" alt="" />
                        <p>${player.supportItemsCount[30]}</p>
                    </div>
                    <div class="support_item"${player.supportItemsCount[40] > 0 ? "" : ' style="display:none"'}>
                        <img src="${utils.getImageUrl("dust", ImageType.Items)}" alt="" />
                        <p>${player.supportItemsCount[40]}</p>
                    </div>
                    <div class="support_item"${player.supportItemsCount[42] > 0 ? "" : ' style="display:none"'}>
                        <img src="${utils.getImageUrl("ward_observer", ImageType.Items)}" alt="" />
                        <p>${player.supportItemsCount[42]}</p>
                    </div>
                    <div class="support_item"${player.supportItemsCount[43] > 0 ? "" : ' style="display:none"'}>
                        <img src="${utils.getImageUrl("ward_sentry", ImageType.Items)}" alt="" />
                        <p>${player.supportItemsCount[43]}</p>
                    </div>
                    <div class="support_item"${player.supportItemsCount[188] > 0 ? "" : ' style="display:none"'}>
                        <img src="${utils.getImageUrl("smoke_of_deceit", ImageType.Items)}" alt="" />
                        <p>${player.supportItemsCount[188]}</p>
                    </div>
                </div>
            </div>
        </div>`
        }
        <div class="details">
            <section>英雄伤害：<span class="hero_damage">${player.heroDamage}</span></section>
            <section>建筑伤害：<span class="building_damage">${player.towerDamage}</span></section>
            <section>受到伤害(减免后)：<span class="tak">${
                player.stats?.heroDamageReport?.receivedTotal.physicalDamage + player.stats?.heroDamageReport?.receivedTotal.magicalDamage + player.stats?.heroDamageReport?.receivedTotal.pureDamage
            }</span></section>
            <section>补刀：<span class="lh">${player.numLastHits}</span>/<span class="dn">${player.numDenies}</span></section>
            <section>GPM/XPM：<span class="gpm">${player.goldPerMinute}</span>/<span class="xpm">${player.experiencePerMinute}</span></section>
            <section>治疗量：<span class="heal">${player.heroHealing}</span></section>
            <section>控制时间：<span class="building_damage">${((player.stats?.heroDamageReport?.dealtTotal.stunDuration + player.stats?.heroDamageReport?.dealtTotal.disableDuration) / 100).toFixed(2)}(${(
            player.stats?.heroDamageReport?.dealtTotal.slowDuration / 100
        ).toFixed(2)})</span>s</section>
        </div>
    </div>`;
    });
    $(".radiant_players").html(players_html.radiant);
    $(".dire_players").html(players_html.dire);

    $(".ban_list").html(
        match.pickBans
            .filter((hero) => !hero.isPick)
            .map((hero) => `<div class="ban_hero"><img src="${utils.getImageUrl(/^npc_dota_hero_(?<name>.+)$/.exec(dotaconstants.heroes[hero.bannedHeroId].name)[1], ImageType.Heroes)}" alt="" /></div>`)
            .join("")
    );
    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", $.html());
    return $.html();
}

function genHeroHTML(hero) {
    let $ = cheerio.load(fs.readFileSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/hero.html`, "utf-8"));

    let html = `
    <div class="hero" id="${hero.id}">
        <img src="${utils.getImageUrl(hero.shortName, ImageType.Heroes)}" alt="" />
        <img class="pri_attr" src="${utils.getImageUrl(d2a.primary_attrs[dotaconstants.heroes[hero.id].primary_attr], ImageType.Icons)}" alt="" />
        <div class="info">
            <p class="name">${hero.language.displayName}</p>
            <p class="roles">
                ${hero.roles.map((item) => `<span class="role level${item.level}">${d2a.roles[item.roleId]}</span>`).join("")}
            </p>
            <p class="attrs">
                <span class="str">${dotaconstants.heroes[hero.id].base_str} <span class="gain">+${dotaconstants.heroes[hero.id].str_gain.toFixed(1)}</span></span>
                <span class="agi">${dotaconstants.heroes[hero.id].base_agi} <span class="gain">+${dotaconstants.heroes[hero.id].agi_gain.toFixed(1)}</span></span>
                <span class="int">${dotaconstants.heroes[hero.id].base_int} <span class="gain">+${dotaconstants.heroes[hero.id].int_gain.toFixed(1)}</span></span>
            </p>
        </div>
    </div>
    <div class="details">
        <div class="hype_talents">
            <div class="hype">
                ${hero.language.hype}
            </div>
            <div class="talents">
                <div class="talent">
                    <div class="left">${hero.talents[7].name_cn}</div>
                    <div class="level">25</div>
                    <div class="right">${hero.talents[6].name_cn}</div>
                </div>
                <div class="talent">
                    <div class="left">${hero.talents[5].name_cn}</div>
                    <div class="level">20</div>
                    <div class="right">${hero.talents[4].name_cn}</div>
                </div>
                <div class="talent">
                    <div class="left">${hero.talents[3].name_cn}</div>
                    <div class="level">15</div>
                    <div class="right">${hero.talents[2].name_cn}</div>
                </div>
                <div class="talent">
                    <div class="left">${hero.talents[1].name_cn}</div>
                    <div class="level">10</div>
                    <div class="right">${hero.talents[0].name_cn}</div>
                </div>
            </div>
        </div>
        <table class="list">
            <tbody>
                <tr>
                    <td>初始生命值</td>
                    <td>${dotaconstants.heroes[hero.id].base_health + dotaconstants.heroes[hero.id].base_str * 22}</td>
                </tr>
                <tr>
                    <td>初始生命回复</td>
                    <td>${dotaconstants.heroes[hero.id].base_health_regen}</td>
                </tr>
                <tr>
                    <td>初始魔法值</td>
                    <td>${dotaconstants.heroes[hero.id].base_mana + dotaconstants.heroes[hero.id].base_int * 12}</td>
                </tr>
                <tr>
                    <td>初始魔法回复</td>
                    <td>${dotaconstants.heroes[hero.id].base_mana_regen}</td>
                </tr>
                <tr>
                    <td>初始攻击力</td>
                    <td>${
                        dotaconstants.heroes[hero.id].base_mr +
                        Math.round(
                            dotaconstants.heroes[hero.id].primary_attr == "all"
                                ? (dotaconstants.heroes[hero.id].base_str + dotaconstants.heroes[hero.id].base_agi + dotaconstants.heroes[hero.id].base_int) * 0.7
                                : dotaconstants.heroes[hero.id]["base_" + dotaconstants.heroes[hero.id].primary_attr]
                        )
                    }（${
        dotaconstants.heroes[hero.id].base_attack_min +
        Math.round(
            dotaconstants.heroes[hero.id].primary_attr == "all"
                ? (dotaconstants.heroes[hero.id].base_str + dotaconstants.heroes[hero.id].base_agi + dotaconstants.heroes[hero.id].base_int) * 0.7
                : dotaconstants.heroes[hero.id]["base_" + dotaconstants.heroes[hero.id].primary_attr]
        )
    }~${
        dotaconstants.heroes[hero.id].base_attack_max +
        Math.round(
            dotaconstants.heroes[hero.id].primary_attr == "all"
                ? (dotaconstants.heroes[hero.id].base_str + dotaconstants.heroes[hero.id].base_agi + dotaconstants.heroes[hero.id].base_int) * 0.7
                : dotaconstants.heroes[hero.id]["base_" + dotaconstants.heroes[hero.id].primary_attr]
        )
    }）</td>
                </tr>
                <tr>
                    <td>基础攻击间隔</td>
                    <td>${dotaconstants.heroes[hero.id].attack_rate.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>基础攻击前摇</td>
                    <td>${dotaconstants.heroes[hero.id].attack_point.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>攻击范围</td>
                    <td>${dotaconstants.heroes[hero.id].attack_range}</td>
                </tr>
                <tr>
                    <td>护甲</td>
                    <td>${(Math.round((dotaconstants.heroes[hero.id].base_armor + dotaconstants.heroes[hero.id].base_agi * 0.167) * 10) / 10).toFixed(1)}</td>
                </tr>
                <tr>
                    <td>移动速度</td>
                    <td>${dotaconstants.heroes[hero.id].move_speed}</td>
                </tr>
                <tr>
                    <td>视野范围</td>
                    <td>${dotaconstants.heroes[hero.id].day_vision}（${dotaconstants.heroes[hero.id].night_vision}）</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="skills">
        ${hero.abilities
            .filter((item) => dotaconstants.abilities[item.ability.name].behavior != "Hidden")
            .map(
                (item) => `
                <div class="skill">
                    <p class="title">${item.ability.language.displayName}</p>
                    ${
                        item.ability.stat.isGrantedByScepter
                            ? `<svg class="scepter" viewBox="0 0 19 20" fill="hsla(0,0%,100%,0.16)" width="24"><path d="M4.795 14.99a2.06 2.06 0 00-.96-.388c-1.668-.204-2.506.518-3.107 1.008.464.128.879.364.867.97 2.347-1.605 4.159.84 2.415 2.666-.14.147.65.929.767.718.203-.365.79-1.064 1.445-1.064.964 0 1.529.68 1.823.838.267.144.793-.372.642-.675-.03-.06-.229-.204-.569-.438-1.407-.197-1.935-1.093-2.37-2.026-.276-.593-.503-1.206-.953-1.61zm9.41 0a2.06 2.06 0 01.96-.388c1.668-.204 2.507.518 3.107 1.008-.464.128-.879.364-.867.97-2.347-1.605-4.158.84-2.415 2.666.14.147-.65.929-.768.718-.202-.365-.79-1.064-1.444-1.064-.965 0-1.529.68-1.823.838-.267.144-.793-.372-.642-.675.03-.06.229-.204.569-.438 1.407-.197 1.935-1.093 2.37-2.026.276-.593.503-1.206.953-1.61zm-3.919-2.211c0-.233-.175-.423-.392-.423h-.788c-.217 0-.392.19-.392.423v5.665c0 .232.175.421.392.421h.788c.216 0 .392-.189.392-.421v-5.665zm-1.989 2.543c-.553-.139-2.074-.563-2.702-1.17-.814-.784-1.107-3.135-2.655-3.52-1.29-.32-2.448.27-2.924 1.05-.06.101.055.241.252.178 2.786-.884 2.957 1.674 2.672 2.215a.275.275 0 00-.024.057c.87-.106 1.462.043 1.893.328.447.294.732.738.975 1.231.515 1.042.822 2.335 2.513 2.512v-2.88zm2.406 0c.553-.139 2.074-.563 2.703-1.17.812-.784 1.106-3.135 2.654-3.52 1.29-.32 2.448.27 2.924 1.05.06.101-.055.241-.252.178-2.786-.884-2.957 1.674-2.672 2.215a.27.27 0 01.024.057c-.87-.106-1.462.043-1.893.328-.447.294-.732.738-.975 1.231-.515 1.042-.822 2.335-2.513 2.512v-2.88z" fill="hsla(0,0%,100%,0.6)"></path><path d="M9.753.093a.39.39 0 00-.506 0C8.461.747 6.08 2.946 5.515 3.417a.434.434 0 00-.15.262c-.162.895-.949 4.817-1.12 5.764a.46.46 0 00.067.333c.37.564 1.665 2.752 2.071 3.37a.404.404 0 00.336.187h.768c.19 0 .356-.14.4-.337l.35-1.577a.416.416 0 01.399-.336h1.728c.19 0 .356.139.399.336l.35 1.577a.416.416 0 00.4.337h.768c.133 0 .259-.07.336-.187.406-.618 1.7-2.806 2.07-3.37a.457.457 0 00.067-.333c-.17-.947-.957-4.87-1.118-5.764a.435.435 0 00-.15-.262C12.92 2.946 10.537.747 9.752.093z" fill="url(#activeAghanimScepterGradient)"></path><defs><radialGradient id="activeAghanimScepterGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.03623 10.4684) rotate(-90) scale(9.38905 7.0456)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient></defs></svg>`
                            : ""
                    }
                    ${
                        item.ability.stat.isGrantedByShard
                            ? `<svg class="shard" viewBox="0 0 19 10" fill="hsla(0,0%,100%,0.16)" width="24"><path d="M0.259504 4.54746C0.272981 4.60325 0.326002 4.64198 0.386194 4.64198C0.831857 4.62418 2.60461 4.45628 3.91732 2.90727C4.49956 2.22054 4.37916 1.21884 3.64777 0.671532C2.91819 0.125197 1.85256 0.238284 1.27032 0.924899C-0.0423919 2.47305 0.17864 4.13525 0.259504 4.54746Z" fill="url(#activeAghanimLeftShardGradient)"></path><path d="M9.46713 9.98081C9.42698 10.0064 9.37572 10.0064 9.33559 9.98081C8.88968 9.67166 6.33212 7.75166 6.33212 4.38581C6.33212 2.96661 7.70742 1.81406 9.40136 1.81406C11.0953 1.81406 12.4706 2.96661 12.4706 4.38581C12.4706 7.75166 9.91303 9.67166 9.46713 9.98081Z" fill="url(#activeAghanimMidShardGradient)"></path><path d="M18.6888 4.54746C18.6753 4.60325 18.6232 4.64198 18.5631 4.64198C18.1173 4.62418 16.3445 4.45628 15.0317 2.90727C14.4494 2.22054 14.5697 1.21884 15.3003 0.671532C16.0308 0.125197 17.0966 0.238284 17.6788 0.924899C18.9917 2.47305 18.7707 4.13525 18.6888 4.54746Z" fill="url(#activeAghanimRightShardGradient)"></path><defs><radialGradient id="activeAghanimMidShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.01787 2.49983) rotate(90) scale(7.50029 5.21143)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient><radialGradient id="activeAghanimLeftShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.98746 0.625367) rotate(128.66) scale(6.00315 4.79432)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient><radialGradient id="activeAghanimRightShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.2996 0.625367) rotate(51.3402) scale(6.00316 4.7942)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient></defs></svg>`
                            : ""
                    }
                    <div class="img_stats">
                        <img src="${utils.getImageUrl(item.ability.name, ImageType.Abilities)}" alt="" />
                        <div class="stats">
                            <p class="behavior">技能：${(Array.isArray(dotaconstants.abilities[item.ability.name].behavior) ? dotaconstants.abilities[item.ability.name].behavior : [dotaconstants.abilities[item.ability.name].behavior])
                                .filter((beh) => beh !== "Hidden" || !(item.ability.stat.isGrantedByShard || item.ability.stat.isGrantedByScepter))
                                .map((beh) => d2a.behavior[beh])
                                .join("/")}</p>
                            ${
                                dotaconstants.abilities[item.ability.name].target_team
                                    ? `<p class="target_team">影响：${(Array.isArray(dotaconstants.abilities[item.ability.name].target_team)
                                          ? dotaconstants.abilities[item.ability.name].target_team
                                          : [dotaconstants.abilities[item.ability.name].target_team]
                                      )
                                          .map((tt) => d2a.target_team[tt])
                                          .join("/")}</p>`
                                    : ""
                            }
                            ${
                                !Array.isArray(dotaconstants.abilities[item.ability.name].dmg_type) && dotaconstants.abilities[item.ability.name].dmg_type
                                    ? `<p class="dmg_type ${dotaconstants.abilities[item.ability.name].dmg_type}">伤害类型：</p>`
                                    : ""
                            }
                            ${
                                dotaconstants.abilities[item.ability.name].dispellable
                                    ? `<p class="dispellable ${dotaconstants.abilities[item.ability.name].dispellable == "Strong Dispels Only" ? "Strong" : dotaconstants.abilities[item.ability.name].dispellable}">能否驱散：</p>`
                                    : ""
                            }
                            ${
                                !Array.isArray(dotaconstants.abilities[item.ability.name].bkbpierce) && dotaconstants.abilities[item.ability.name].bkbpierce
                                    ? `<p class="bkbpierce">无视减益免疫： ${dotaconstants.abilities[item.ability.name].bkbpierce == "Yes" ? "是" : "否"}</p>`
                                    : ""
                            }
                        </div>
                    </div>
                    ${item.ability.language.description.map((desc) => `<p class="description">${desc}</p>`).join("")}
                    ${
                        item.ability.language.aghanimDescription
                            ? `<p class="aghanim_description"><span class="title"><svg viewBox="0 0 19 20" fill="hsla(0,0%,100%,0.16)" width="24"><path d="M4.795 14.99a2.06 2.06 0 00-.96-.388c-1.668-.204-2.506.518-3.107 1.008.464.128.879.364.867.97 2.347-1.605 4.159.84 2.415 2.666-.14.147.65.929.767.718.203-.365.79-1.064 1.445-1.064.964 0 1.529.68 1.823.838.267.144.793-.372.642-.675-.03-.06-.229-.204-.569-.438-1.407-.197-1.935-1.093-2.37-2.026-.276-.593-.503-1.206-.953-1.61zm9.41 0a2.06 2.06 0 01.96-.388c1.668-.204 2.507.518 3.107 1.008-.464.128-.879.364-.867.97-2.347-1.605-4.158.84-2.415 2.666.14.147-.65.929-.768.718-.202-.365-.79-1.064-1.444-1.064-.965 0-1.529.68-1.823.838-.267.144-.793-.372-.642-.675.03-.06.229-.204.569-.438 1.407-.197 1.935-1.093 2.37-2.026.276-.593.503-1.206.953-1.61zm-3.919-2.211c0-.233-.175-.423-.392-.423h-.788c-.217 0-.392.19-.392.423v5.665c0 .232.175.421.392.421h.788c.216 0 .392-.189.392-.421v-5.665zm-1.989 2.543c-.553-.139-2.074-.563-2.702-1.17-.814-.784-1.107-3.135-2.655-3.52-1.29-.32-2.448.27-2.924 1.05-.06.101.055.241.252.178 2.786-.884 2.957 1.674 2.672 2.215a.275.275 0 00-.024.057c.87-.106 1.462.043 1.893.328.447.294.732.738.975 1.231.515 1.042.822 2.335 2.513 2.512v-2.88zm2.406 0c.553-.139 2.074-.563 2.703-1.17.812-.784 1.106-3.135 2.654-3.52 1.29-.32 2.448.27 2.924 1.05.06.101-.055.241-.252.178-2.786-.884-2.957 1.674-2.672 2.215a.27.27 0 01.024.057c-.87-.106-1.462.043-1.893.328-.447.294-.732.738-.975 1.231-.515 1.042-.822 2.335-2.513 2.512v-2.88z" fill="hsla(0,0%,100%,0.6)"></path><path d="M9.753.093a.39.39 0 00-.506 0C8.461.747 6.08 2.946 5.515 3.417a.434.434 0 00-.15.262c-.162.895-.949 4.817-1.12 5.764a.46.46 0 00.067.333c.37.564 1.665 2.752 2.071 3.37a.404.404 0 00.336.187h.768c.19 0 .356-.14.4-.337l.35-1.577a.416.416 0 01.399-.336h1.728c.19 0 .356.139.399.336l.35 1.577a.416.416 0 00.4.337h.768c.133 0 .259-.07.336-.187.406-.618 1.7-2.806 2.07-3.37a.457.457 0 00.067-.333c-.17-.947-.957-4.87-1.118-5.764a.435.435 0 00-.15-.262C12.92 2.946 10.537.747 9.752.093z" fill="url(#activeAghanimScepterGradient)"></path><defs><radialGradient id="activeAghanimScepterGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.03623 10.4684) rotate(-90) scale(9.38905 7.0456)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient></defs></svg>
                            &nbsp;阿哈利姆神杖</span><span class="desc">${item.ability.language.aghanimDescription}</span></p>`
                            : ""
                    }
                    ${
                        item.ability.language.shardDescription
                            ? `<p class="aghanim_description"><span class="title"><svg viewBox="0 0 19 10" fill="hsla(0,0%,100%,0.16)" width="24"><path d="M0.259504 4.54746C0.272981 4.60325 0.326002 4.64198 0.386194 4.64198C0.831857 4.62418 2.60461 4.45628 3.91732 2.90727C4.49956 2.22054 4.37916 1.21884 3.64777 0.671532C2.91819 0.125197 1.85256 0.238284 1.27032 0.924899C-0.0423919 2.47305 0.17864 4.13525 0.259504 4.54746Z" fill="url(#activeAghanimLeftShardGradient)"></path><path d="M9.46713 9.98081C9.42698 10.0064 9.37572 10.0064 9.33559 9.98081C8.88968 9.67166 6.33212 7.75166 6.33212 4.38581C6.33212 2.96661 7.70742 1.81406 9.40136 1.81406C11.0953 1.81406 12.4706 2.96661 12.4706 4.38581C12.4706 7.75166 9.91303 9.67166 9.46713 9.98081Z" fill="url(#activeAghanimMidShardGradient)"></path><path d="M18.6888 4.54746C18.6753 4.60325 18.6232 4.64198 18.5631 4.64198C18.1173 4.62418 16.3445 4.45628 15.0317 2.90727C14.4494 2.22054 14.5697 1.21884 15.3003 0.671532C16.0308 0.125197 17.0966 0.238284 17.6788 0.924899C18.9917 2.47305 18.7707 4.13525 18.6888 4.54746Z" fill="url(#activeAghanimRightShardGradient)"></path><defs><radialGradient id="activeAghanimMidShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.01787 2.49983) rotate(90) scale(7.50029 5.21143)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient><radialGradient id="activeAghanimLeftShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.98746 0.625367) rotate(128.66) scale(6.00315 4.79432)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient><radialGradient id="activeAghanimRightShardGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.2996 0.625367) rotate(51.3402) scale(6.00316 4.7942)"><stop stop-color="#00CEFF"></stop><stop offset="1" stop-color="#3443C4"></stop></radialGradient></defs></svg>
                            &nbsp;阿哈利姆魔晶</span><span class="desc">${item.ability.language.shardDescription}</span></p>`
                            : ""
                    }
                    <div class="notes"${!item.ability.language.notes.length ? ` style="display:none;"` : ""}>
                        ${item.ability.language.notes.map((note) => `<p>${note}</p>`).join("")}
                    </div>
                    <div class="attributes">
                    ${item.ability.language.attributes
                        .map((attr) => {
                            const parts = attr.split("：");
                            return `<p><span class="item">${parts[0]}</span><span class="values">${parts[1]}</span></p>`;
                        })
                        .join("")}
                    </div>
                    <p>
                        ${
                            dotaconstants.abilities[item.ability.name].cd
                                ? `<span class="cooldown"> ${(Array.isArray(dotaconstants.abilities[item.ability.name].cd) ? dotaconstants.abilities[item.ability.name].cd : [dotaconstants.abilities[item.ability.name].cd]).join(
                                      " / "
                                  )} </span>`
                                : ""
                        }
                        ${
                            dotaconstants.abilities[item.ability.name].mc
                                ? `<span class="mana_cost"> ${(Array.isArray(dotaconstants.abilities[item.ability.name].mc) ? dotaconstants.abilities[item.ability.name].mc : [dotaconstants.abilities[item.ability.name].mc]).join(
                                      " / "
                                  )} </span>`
                                : ""
                        }
                    </p>
                    <p class="lore"${!item.ability.language.lore ? ` style="display:none;"` : ""}>${item.ability.language.lore}</p>
                </div>
                `
            )
            .join("")}
    </div>
    <div class="lore">
        ${hero.language.lore}
    </div>
    `;
    $(".wrapper").html(html);
    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", $.html());
    return $.html();
}

function genPlayerHTML(player) {
    let $ = cheerio.load(fs.readFileSync(`./node_modules/@sjtdev/koishi-plugin-${name}/template/player.html`, "utf-8"));
    const guildLevel = (percent) => {
        if (percent <= 25) {
            return "Copper";
        } else if (percent <= 50) {
            return "Silver";
        } else if (percent <= 75) {
            return "Gold";
        } else {
            return "Diamond";
        }
    };
    const laneSVG = {
        stomp: `<svg viewBox="0 0 24 24" class="hitagi__sc-1apuy4g-0 hmhZOG"><path d="M8.05731 22.3674L9.60454 22.8002L11.5974 21.6551L12.043 20.0773L13.5902 20.51L15.583 19.3649L16.0287 17.7871L17.5759 18.2199L19.5687 17.0748L20.0143 15.4969L21.5615 15.9297L23.5544 14.7846L24 13.2068L23.4492 12.2014L7.50651 21.3621L8.05731 22.3674ZM12.1328 3.50265L11.0312 1.49196C10.8798 1.21549 10.5316 1.11811 10.2576 1.27556L0.29345 7.00098C0.0194354 7.15843 -0.0808273 7.51346 0.0706444 7.78993L1.44766 10.3033L11.91 4.29159C12.184 4.13414 12.2843 3.77912 12.1328 3.50265ZM18.3935 8.4063L14.1658 9.60458L12.4221 10.6065C12.2851 10.6853 12.111 10.6366 12.0353 10.4983L11.7599 9.99565C11.6842 9.85742 11.7343 9.6799 11.8713 9.60118L13.615 8.59924L13.0642 7.59389L11.3205 8.59584C11.1835 8.67456 11.0094 8.62587 10.9337 8.48765L10.6583 7.98497C10.5826 7.84673 10.6327 7.66922 10.7697 7.5905L12.5134 6.58855L11.9626 5.58321L1.99846 11.3086L6.9557 20.3567L22.8984 11.196L22.2615 10.0336C21.5024 8.64813 19.9073 7.97847 18.3935 8.4063Z"></path></svg>`,
        victory: `<svg viewBox="0 0 512 512"><path d="M198.844 64.75c-.985 0-1.974.03-2.97.094-15.915 1.015-32.046 11.534-37.78 26.937-34.072 91.532-51.085 128.865-61.5 222.876 14.633 13.49 31.63 26.45 50.25 38.125l66.406-196.467 17.688 5.968L163.28 362.5c19.51 10.877 40.43 20.234 62 27.28l75.407-201.53 17.5 6.53-74.937 200.282c19.454 5.096 39.205 8.2 58.78 8.875L381.345 225.5l17.094 7.594-75.875 170.656c21.82-1.237 43.205-5.768 63.437-14.28 43.317-53.844 72.633-109.784 84.5-172.69 5.092-26.992-14.762-53.124-54.22-54.81l-6.155-.282-2.188-5.75c-8.45-22.388-19.75-30.093-31.5-32.47-11.75-2.376-25.267 1.535-35.468 7.376l-13.064 7.47-.906-15c-.99-16.396-10.343-29.597-24.313-35.626-13.97-6.03-33.064-5.232-54.812 9.906l-10.438 7.25-3.812-12.125c-6.517-20.766-20.007-27.985-34.78-27.97zM103.28 188.344C71.143 233.448 47.728 299.56 51.407 359.656c27.54 21.84 54.61 33.693 80.063 35.438 14.155.97 27.94-1.085 41.405-6.438-35.445-17.235-67.36-39.533-92.594-63.53l-3.343-3.157.5-4.595c5.794-54.638 13.946-91.5 25.844-129.03z"/></svg>`,
        fail: `<svg viewBox="0 0 36 36"><path fill="#ff6961" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"></path><circle fill="#FFF" cx="27" cy="7" r="3"></circle><path fill="#FFF" d="M13.06 13.06l2.367-2.366l3.859 1.158l-2.635 2.847a10.018 10.018 0 0 1 4.392 3.379l5.017-5.017a1.5 1.5 0 0 0-.63-2.497l-9.999-3a1.495 1.495 0 0 0-1.492.376l-3 3a1.5 1.5 0 1 0 2.121 2.12zm16.065 4.949a1.496 1.496 0 0 0-1.262-.503l-6.786.617a9.966 9.966 0 0 1 1.464 2.879l3.548-.322l-1.554 6.995a1.499 1.499 0 1 0 2.928.65l2-9a1.5 1.5 0 0 0-.338-1.316zM13 16a8 8 0 1 0 0 16a8 8 0 0 0 0-16zm0 14a6 6 0 1 1 .002-12.002A6 6 0 0 1 13 30z"></path></svg>`,
        stomped: `<svg viewBox="-1 0 19 19"><path d="M16.417 9.579A7.917 7.917 0 1 1 8.5 1.662a7.917 7.917 0 0 1 7.917 7.917zm-2.458 2.96a.396.396 0 0 0-.396-.397h-.667a1.527 1.527 0 0 0-1.249-1.114.777.777 0 0 0 .014-.145V9.378a.794.794 0 0 0-.792-.792H8.201a2.984 2.984 0 0 0-1.682-.516l-.11.002V7.42h2.997a.396.396 0 1 0 0-.792H6.41v-1.3a.396.396 0 0 0-.396-.397H4.891a.396.396 0 0 0 0 .792h.727V8.21a2.997 2.997 0 1 0 3.836 3.466h.71a1.526 1.526 0 1 0 2.732 1.26h.667a.396.396 0 0 0 .396-.397zM8.078 9.507a2.205 2.205 0 1 1-1.559-.646 2.19 2.19 0 0 1 1.559.646zm4.078 3.03a.734.734 0 1 1-.733-.734.735.735 0 0 1 .733.733z"/></svg>`,
        tie: `<svg fill="#fff" viewBox="0 0 512.001 512.001"><g><g><path d="M120.988,239.868c-4.496,10.625-5.122,20.183-5.157,20.811c-0.267,4.607,3.243,8.547,7.849,8.829 c4.618,0.29,8.574-3.228,8.873-7.833c0.265-4.771,2.339-13.092,5.884-19.44C137.421,242.113,141.397,242.649,120.988,239.868z"/></g></g><g><g><path d="M391.178,255.418c-0.211,8.054-2.458,17.62-6.74,28.398c-1.708,4.299,0.393,9.168,4.692,10.875 c4.293,1.708,9.167-0.39,10.875-4.692c5.103-12.842,7.74-24.392,7.943-34.581H391.178z"/></g></g><g><g><path d="M164.769,210.51c1.046,3.339,1.397,6.953,0.893,10.65c-0.293,2.146-0.857,4.188-1.648,6.1c0,0,51.266,3.416,198.065,3.949 c-0.086-6.331,2.19-12.199,6.244-16.732C217.627,214.046,164.769,210.51,164.769,210.51z"/></g></g><g><g><circle cx="37.179" cy="128.669" r="29.491"/></g></g><g><g><path d="M510.146,391.511l-37.916-66.985c14.35-49.173,20.678-68.137,20.678-68.137l8.949-67.014 c1.502-10.977-6.248-21.075-17.235-22.468l-18.183-2.305c-10.984-1.393-20.996,6.445-22.293,17.431l-1.884,15.955l28.718-21.317 l-37.91,42.278h-46.432c-6.571,0-11.898,5.328-11.898,11.898c0,6.57,5.328,11.898,11.898,11.898h51.744 c3.381,0,6.601-1.438,8.859-3.956l41.456-46.234l-32.023,54.694c-5.28,9.018-14.374,8.169-18.293,8.167c-1.959,0-3.31,0-5.295,0 c-0.399,0.898,3.152-7.399-24.44,57.181c-0.548,1.284-0.907,2.642-1.06,4.031l-8.934,80.338 c-0.939,8.447,5.667,15.857,14.208,15.857c7.179,0,13.361-5.401,14.172-12.701l8.702-78.244l21.512-50.353l-14.121,50.463 c-1.158,3.756-0.718,7.823,1.218,11.243l40.949,72.345c3.885,6.864,12.596,9.276,19.459,5.392 C511.615,407.085,514.03,398.373,510.146,391.511z"/></g></g><g><g><circle cx="464.865" cy="128.702" r="29.491"/></g></g><g><g><path d="M142.923,206.051l-59.556-8.118l-39.135-18.451l13.626,2.292c-1.422-10.945-11.411-18.577-22.254-17.202l-18.182,2.305 C6.43,168.271-1.315,178.374,0.186,189.345l9.12,68.689l21.865,70.857l5.829,70.795c0.646,7.848,7.527,13.705,15.401,13.057 c7.859-0.647,13.705-7.542,13.058-15.401l-5.956-72.345c-0.084-1.031-0.281-2.05-0.585-3.039l-14.123-50.463l21.514,50.353 l8.702,78.244c0.873,7.86,7.96,13.486,15.768,12.612c7.838-0.871,13.483-7.931,12.612-15.768l-8.934-80.338 c-0.154-1.388-0.511-2.747-1.06-4.032l-27.336-61.43l-2.945-24.951l-29.029-25.179l40.79,19.231 c1.097,0.517,2.266,0.862,3.468,1.027l61.369,8.365c6.521,0.887,12.509-3.68,13.396-10.183 C153.994,212.936,149.435,206.939,142.923,206.051z"/></g></g></svg>`,
    };
    const outcomeCounts = {
        victory: 0,
        stomp: 0,
        fail: 0,
        stomped: 0,
        tie: 0,
    };
    const processLaneOutcome = (outcome) => {
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
    let nearMatchCount = 25,
        nearWinCount = 0,
        streak = 0;
    player.matches.forEach((match) => {
        const innerPlayer = match.players[0];
        nearWinCount += match.didRadiantWin == innerPlayer.isRadiant ? 1 : 0;
        const didWin = match.didRadiantWin === innerPlayer.isRadiant;
        if (!player.streak) {
            if (streak != 0) {
                if (didWin && streak > 0) streak++;
                else if (!didWin && streak < 0) streak--;
                else player.streak = streak;
            } else streak = didWin ? 1 : -1;
        }

        const laneResult = {
            top: processLaneOutcome(match.topLaneOutcome),
            mid: processLaneOutcome(match.midLaneOutcome),
            bottom: processLaneOutcome(match.bottomLaneOutcome),
        };

        let laneKey = "mid"; // 默认中路
        if (innerPlayer.lane === "SAFE_LANE") {
            laneKey = innerPlayer.isRadiant ? "bottom" : "top";
        } else if (innerPlayer.lane === "OFF_LANE") {
            laneKey = innerPlayer.isRadiant ? "top" : "bottom";
        }

        match.laneResult = laneResult[laneKey][innerPlayer.isRadiant ? "radiant" : "dire"];
        if (match.laneResult in outcomeCounts) {
            outcomeCounts[match.laneResult]++;
        }
    });

    const playerHTML = `
    <div class="avatar"><img src="${player.steamAccount.avatar}" alt="" /></div>
    <div class="info">
        <p class="name">${player.steamAccount.name}${player.guildMember ? ` <span class="guild ${guildLevel(player.guildMember.guild.currentPercentile)}">[${player.guildMember.guild.tag}]</span></p>` : ""}
        <p class="matches"><span>场次：${player.matchCount}（<span class="win">${player.winCount}</span>/<span class="lose">${player.matchCount - player.winCount}</span>）</span>胜率：<span style="color:${winRateColor(
        player.winCount / player.matchCount
    )};">${((player.winCount / player.matchCount) * 100).toFixed(2)}%</span></p>
        <p class="matches"><span>最近25场：<span class="win">${nearWinCount}</span>/<span class="lose">${nearMatchCount - nearWinCount}</span></span><span>胜率：<span style="color:${winRateColor(nearWinCount / nearMatchCount)};">${(
        (nearWinCount / nearMatchCount) *
        100
    ).toFixed(2)}%</span></span><span>评分：${player.performance.imp}</span></span></p>
        <p class="matches"><span>对线：<span class="victory">${outcomeCounts.victory + outcomeCounts.stomp}(<span class="stomp">${outcomeCounts.stomp}</span>)</span>-<span class="tie">${outcomeCounts.tie}</span>-<span class="fail">${
        outcomeCounts.fail + outcomeCounts.stomped
    }(<span class="stomped">${outcomeCounts.stomped}</span>)</span></span><span>线优：<span style="color:${winRateColor(
        (outcomeCounts.victory + outcomeCounts.stomp + outcomeCounts.tie / 2) / (outcomeCounts.victory + outcomeCounts.stomp + outcomeCounts.tie + outcomeCounts.fail + outcomeCounts.stomped)
    )};">${(((outcomeCounts.victory + outcomeCounts.stomp) / (outcomeCounts.victory + outcomeCounts.stomp + outcomeCounts.fail + outcomeCounts.stomped)) * 100).toFixed(2)}%</span></span></p>
    </div>
    ${
        player.steamAccount.seasonRank
            ? `
    <div class="rank">
        <img class="medal" src="${utils.getImageUrl(
            "medal_" +
                (player.steamAccount.seasonLeaderboardRank
                    ? player.steamAccount.seasonLeaderboardRank <= 100
                        ? player.steamAccount.seasonLeaderboardRank <= 10
                            ? "8c"
                            : "8b"
                        : player.steamAccount.seasonRank.toString().split("")[0]
                    : player.steamAccount.seasonRank.toString().split("")[0])
        )}" alt="" />
        ${
            !player.steamAccount.seasonLeaderboardRank
                ? `
        <img class="star" src="${utils.getImageUrl("star_" + player.steamAccount.seasonRank.toString().split("")[1])}" alt="" />`
                : `
        <p>${player.steamAccount.seasonLeaderboardRank}</p>`
        }
    </div>`
            : `
    <div class="rank">
        <img class="medal" src="${utils.getImageUrl("medal_0")}" alt="" />
    </div>`
    }`;
    const heroesCountPixels = 800 - ($(".tip:not(.row):not(.win_count):not(.lose_count)").length + 1) * 40;
    const highestCountsTotal = {
        winCount: Math.max(...player.heroesPerformanceTop10.map((hero) => hero.winCount)),
        loseCount: Math.max(...player.heroesPerformanceTop10.map((hero) => hero.matchCount - hero.winCount)),
    };
    const pixelOfPerMatchInTotal = heroesCountPixels / (highestCountsTotal.winCount + highestCountsTotal.loseCount);
    const highestCountsNear = {
        winCount: Math.max(...player.heroesPerformance?.filter((hero) => hero.matchCount > 1)?.map((hero) => hero.winCount)),
        loseCount: Math.max(...player.heroesPerformance?.filter((hero) => hero.matchCount > 1)?.map((hero) => hero.matchCount - hero.winCount)),
    };
    const nearAdjustmentFactor = Math.min(highestCountsTotal.winCount / (highestCountsTotal.winCount + highestCountsTotal.loseCount), highestCountsTotal.loseCount / (highestCountsTotal.winCount + highestCountsTotal.loseCount));

    const pixelOfPerMatchInNear = (heroesCountPixels / (highestCountsNear?.winCount + highestCountsNear?.loseCount ?? 1)) * nearAdjustmentFactor;
    const heroesTotalHTML =
        player.heroesPerformanceTop10
            .map(
                (hero) => `
                <span><img alt="" src="${utils.getImageUrl(hero.hero.shortName, ImageType.HeroIcons)}" /></span>
                <span class="count">${hero.matchCount}</span>
                <span class="win_rate">${((hero.winCount / hero.matchCount) * 100).toFixed(0)}%</span>
                <span class="imp">${(hero.imp > 0 ? "+" : "") + hero.imp}</span>
                <span class="win" style="${hero.winCount == 0 ? "visibility:hidden;" : ""}width: ${hero.winCount * pixelOfPerMatchInTotal}px">${hero.winCount}</span>
                <span class="lose" style="${hero.matchCount - hero.winCount == 0 ? "visibility:hidden;" : ""}width: ${(hero.matchCount - hero.winCount) * pixelOfPerMatchInTotal}px">${hero.matchCount - hero.winCount}</span>`
            )
            .join("") +
        player.heroesPerformance
            .filter((hero) => hero.matchCount > 1)
            .map(
                (hero, index) => `
                <span style="order:${index + 1};"><img alt="" src="${utils.getImageUrl(hero.hero.shortName, ImageType.HeroIcons)}" /></span>
                <span style="order:${index + 1};" class="count">${hero.matchCount}</span>
                <span style="order:${index + 1};" class="win_rate">${((hero.winCount / hero.matchCount) * 100).toFixed(0)}%</span>
                <span style="order:${index + 1};" class="imp">${(hero.imp > 0 ? "+" : "") + hero.imp}</span>
                <span class="win" style="order:${index + 1};${hero.winCount == 0 ? "visibility:hidden;" : ""}width: ${hero.winCount * pixelOfPerMatchInNear}px">${hero.winCount}</span>
                <span class="lose" style="order:${index + 1};${hero.matchCount - hero.winCount == 0 ? "visibility:hidden;" : ""}width: ${(hero.matchCount - hero.winCount) * pixelOfPerMatchInNear}px">${
                    hero.matchCount - hero.winCount
                }</span>`
            )
            .join("");
    const streakHTML = `<div class="streak" style="box-shadow:none;color:${winRateColor((player.streak + 10) / 20)};">${Math.abs(player.streak) + (player.streak > 0 ? "连胜" : "连败")}</div>`;
    const matchesHTML = player.matches
        .map(
            (match) => `
            <tr class="match ${match.didRadiantWin == match.players[0].isRadiant ? "win" : "lose"}">
                <td>${match.id}</td>
                <td>
                    <p>${d2a.lobbyTypes[match.lobbyType] || match.lobbyType}</p>
                    <p>${d2a.gameMode[match.gameMode] || match.gameMode}</p>
                </td>
                <td><img alt="" src="${utils.getImageUrl(match.players[0].hero.shortName, ImageType.HeroIcons)}" /></td>
                <td style="line-height: 20px">
                    <p>${((match.players[0].kills + match.players[0].assists) / Math.max(1, match.players[0].deaths)).toFixed(2)} (${(
                ((match.players[0].kills + match.players[0].assists) /
                    (match.players[0].isRadiant ? match.radiantKills.reduce((acc: number, cva: number) => acc + cva, 0) : match.direKills.reduce((acc: number, cva: number) => acc + cva, 0))) *
                100
            ).toFixed(0)}%)</p>
                    <p>${match.players[0].kills}/${match.players[0].deaths}/${match.players[0].assists}</p>
                </td>
                <td>
                    <div class="player_lane ${match.laneResult}">${laneSVG[match.laneResult]}</div>
                </td>
                <td style="line-height: 20px">${moment(new Date(match.endDateTime * 1000))
                    .format("YYYY-MM-DD HH:mm:ss")
                    .slice(2)}</td>
                <td>${sec2time(match.durationSeconds)}</td>
                <td>${(match.players[0].imp > 0 ? "+" : "") + match.players[0].imp}</td>
                <td><img class="medal" src="${utils.getImageUrl("medal_" + match.rank.toString().split("")[0])}" style="width: 100%" /></td>
            </tr>`
        )
        .join("");
    const dotaPlusHTML = player.dotaPlus
        .map(
            (hero) => `
            <div class="hero">
                <img src="${utils.getImageUrl(hero.shortName, ImageType.Heroes)}" alt="" />
                <div class="level"><img src="${utils.getImageUrl("hero_badge_" + Math.ceil((hero.level + 1) / 6))}" alt="" /><span>${hero.level}</span></div>
                <span>${((hero.winCount / hero.matchCount) * 100).toFixed(2)}%</span>
                <span>${hero.matchCount}</span>
            </div>`
        )
        .join("");
    $(".player").html(playerHTML);
    $(".heroes > span:not(.tip)").remove();
    $(".heroes .tip.near").before(heroesTotalHTML);
    if (player.streak > 1 || player.streak < -1) $(".streak").replaceWith(streakHTML);
    $(".matches tbody").html(matchesHTML);
    $(".plus").html(dotaPlusHTML);
    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", $.html());
    return $.html();
}

async function playerIsInvalid(steamAccountId) {
    try {
        let queryRes = await utils.query(utils.VERIFYING_PLAYER_GRAPHQL(steamAccountId));
        if (queryRes.status == 200) {
            if (queryRes.data.data.player.matchCount != null) return { isInvalid: true };
            else return { isInvalid: false, reason: "SteamID无效或无任何场次。" };
        }
    } catch (error) {
        console.error(error);
        return { isInvalid: false, reason: "网络状况不佳SteamID验证失败，请稍后重试。" };
        // session.send("获取比赛信息失败。");
    }
}

function sec2time(sec: number) {
    return sec ? (sec < 0 ? "-" : "") + Math.floor(Math.abs(sec) / 60) + ":" + ("00" + (Math.abs(sec) % 60)).slice(-2) : "--:--";
}

function winRateColor(value) {
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

function sanitizeHTML(strings, ...values) {
    // 处理并构建最终字符串
    return strings.reduce((result, string, i) => {
        // 获取当前插入值，如果为null或undefined，则替换为"--"
        let value = values[i] ?? "--";
        // 连接当前字符串片段和处理后的值
        return result + string + (i < values.length ? value : "");
    }, "");
}
