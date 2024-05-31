import { Context, Schema, h } from "koishi";
import * as utils from "./utils.ts";
import * as queries from "./queries.ts";
import { ImageType } from "./utils.ts";
import * as puppeteer from "koishi-plugin-puppeteer";
import fs from "fs";
import path from "path";
import moment from "moment";
import * as dotaconstants from "dotaconstants";
import * as d2a from "./dotaconstants_add.json";
import { Random } from "koishi";
import * as cron from "koishi-plugin-cron";
import * as ejs from "ejs";

export const name = "dota2tracker";
export const usage = `
DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。  
**更多信息请进入[插件主页](https://github.com/sjtdev/koishi-plugin-dota2tracker)与[更新日志](https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md)查看。**`;
export const inject = ["http", "database", "cron", "puppeteer"]; // 声明依赖

// 配置项
export interface Config {
    STRATZ_API_TOKEN: string;
    dataParsingTimeoutMinutes: number;
    dailyReportSwitch: boolean;
    dailyReportHours: number;
    template_match: string;
    template_player: string;
    template_hero: string;
}
export const Config: Schema = Schema.intersect([
    Schema.object({
        STRATZ_API_TOKEN: Schema.string().required().description("※必须。stratz.com的API TOKEN，可在 https://stratz.com/api 获取。"),
        dataParsingTimeoutMinutes: Schema.number().default(60).min(0).max(1440).description("等待比赛数据解析的时间（单位：分钟）。如果数据解析时间超过等待时间，将直接生成战报而不再等待解析完成。"),
    }).description("基础设置"),
    Schema.object({
        dailyReportSwitch: Schema.boolean().default(false).description("日报功能").experimental(),
    }),
    Schema.union([
        Schema.object({
            dailyReportSwitch: Schema.const(true).required(),
            dailyReportHours: Schema.number().min(0).max(23).default(6).description("日报时间小时"),
        }),
        Schema.object({}),
    ]),
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

function init() {}

interface PendingMatch {
    matchId: number;
    guilds: Array<{
        guildId: string;
        platform: string;
        players: Array<utils.dt_subscribed_players>;
    }>;
}
let pendingMatches: PendingMatch[] = []; // 待发布的比赛，当获取到的比赛未被解析时存入此数组，在计时器中定时查询，直到该比赛已被解析则生成图片发布
// var subscribedGuilds = []; // 已订阅群组
// var subscribedPlayers = []; // 已绑定玩家
// var sendedMatches = []; // 已发布比赛
const random = new Random(() => Math.random());

export async function apply(ctx: Context, config: Config) {
    // write your plugin here
    utils.CONFIGS.STRATZ_API.TOKEN = config.STRATZ_API_TOKEN; // 读取配置API_TOKEN
    utils.setHttp(ctx.http);

    // ctx.on()

    ctx.command("订阅本群", "订阅后还需玩家在本群绑定SteamID")
        .usage("订阅后还需玩家在本群绑定SteamID，BOT将订阅本群中已绑定玩家的新比赛数据，在STRATZ比赛解析完成后将比赛数据生成为图片战报发布至本群中。")
        .action(async ({ session }) => {
            if (session.guild) {
                // let currentGuild = subscribedGuilds.find((item) => item.id == session.event.channel.id && item.platform == session.event.platform);
                let currentGuild = (await ctx.database.get("dt_subscribed_guilds", { guildId: session.event.channel.id, platform: session.event.platform }))[0];
                if (currentGuild) session.send("本群已订阅，无需重复订阅。");
                else {
                    ctx.database.create("dt_subscribed_guilds", { guildId: session.event.channel.id, platform: session.event.platform });
                    session.send("订阅成功。");
                }
            }
        });

    ctx.command("取消订阅", "取消订阅本群").action(async ({ session }) => {
        if (session.guild) {
            let cancelingGuild = (await ctx.database.get("dt_subscribed_guilds", { guildId: session.event.channel.id, platform: session.event.platform }))[0];
            if (cancelingGuild) {
                ctx.database.remove("dt_subscribed_guilds", session.event.channel.id);
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
                // let sessionPlayer = subscribedPlayers.find((item) => item.guildId == session.event.channel.id && item.platform == session.event.platform && item.userId == session.event.user.id);
                let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, userId: session.event.user.id }))[0];
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
                if (!/^(?:.{1,20})?$/.test(nick_name ?? "")) {
                    session.send("别名过长，请限制在20个字符以内。（也可以留空）");
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
                ctx.database.create("dt_subscribed_players", { userId: session.event.user.id, guildId: session.event.channel.id, platform: session.event.platform, steamId: parseInt(steam_id), nickName: nick_name || null });
            }
        });
    ctx.command("取消绑定", "取消绑定你的个人信息").action(async ({ session }) => {
        if (session.guild) {
            // 在已绑定玩家中查找当前玩家
            let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, userId: session.event.user.id }))[0];
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
                let sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                if (sessionPlayer) {
                    if (!nick_name) {
                        session.send("请输入你的别名。");
                        return;
                    }
                    if (!/^.{1,20}$/.test(nick_name ?? "")) {
                        session.send("别名过长，请限制在20个字符以内。");
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
            const subscribedPlayers = await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.platform });
            if (!subscribedPlayers.length) {
                session.send("本群尚无绑定玩家。");
                return;
            }
            if (subscribedPlayers.length <= 20) {
                try {
                    const memberList = await session.bot.getGuildMemberList(session.event.channel.id);
                    async function getUsers(subscribedPlayers: any[], utils: any, queries: any, memberList: any) {
                        const playerSteamIds = subscribedPlayers.map((player) => player.steamId);
                        const queryResult = await utils.query(queries.PLAYERS_INFO_WITH_10_MATCHES_FOR_GUILD(playerSteamIds));
                        const playersInfo = queryResult.data.players;

                        const users = [];

                        for (const subscribedPlayer of subscribedPlayers) {
                            const queryPlayer = playersInfo.find((player) => player.steamAccount.id == subscribedPlayer.steamId);
                            const queryMember = memberList.data.find((member) => member.user?.id == subscribedPlayer.userId);
                            users.push({ ...subscribedPlayer, ...queryPlayer, ...queryMember });
                        }

                        return users;
                    }

                    // Usage
                    const users = await getUsers(subscribedPlayers, utils, queries, memberList);

                    session.send(await ctx.puppeteer.render(genImageHTML(users, TemplateType.GuildMember, TemplateType.GuildMember)));
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("查询群友失败。");
                }
            }
            // session.send("开发中，未来此功能会重写。\n" + queryRes.map((item) => `${item.nickName ?? ""}，ID：${item.userId}，SteamID：${item.steamId}`).join("\n"));
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
                match = utils.getFormattedMatchData((await utils.query(queries.MATCH_INFO(matchId))).data.match);
            }
            if (match && (match.parsedDateTime || moment.unix(match.endDateTime).isBefore(moment().subtract(config.dataParsingTimeoutMinutes, "minutes")))) {
                session.send(await ctx.puppeteer.render(genImageHTML(match, config.template_match, TemplateType.Match)));
                if (match.parsedDateTime)
                    // 当比赛数据已解析时才进行缓存
                    ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
            } else {
                pendingMatches.push({ matchId: matchId, guilds: [{ platform: session.event.platform, guildId: session.event.channel.id, players: [] }] });
                session.send("比赛尚未解析，将在解析完成后发布。");
            }
        } catch (error) {
            ctx.logger.error(error);
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
                    sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer = sessionPlayer || (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, nickName: input_data }))[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }

                let lastMatchId = 0;
                try {
                    session.send("正在搜索对局详情，请稍后...");
                    lastMatchId = (await utils.query(queries.PLAYERS_LASTMATCH([parseInt(flagBindedPlayer ? flagBindedPlayer.steamId : input_data)]))).data.players[0].matches[0].id;
                } catch {
                    session.send("获取玩家最近比赛失败。");
                    return;
                }
                queryAndDisplayMatch(session, lastMatchId);
            }
        });

    ctx.command("查询玩家 <input_data>", "查询玩家信息，可指定英雄")
        .usage("查询指定玩家的个人信息与最近战绩，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .option("hero", "-o <value:string> 查询玩家指定英雄使用情况（同其他英雄查询，可用简称与ID）")
        .example("-查询玩家 123456789")
        .example("-查询玩家 张三")
        .example("-查询玩家 张三 hero 敌法师")
        .action(async ({ session, options }, input_data) => {
            if (session.guild) {
                let sessionPlayer;
                if (!input_data) {
                    sessionPlayer = (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, userId: session.event.user.id }))[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer = sessionPlayer || (await ctx.database.get("dt_subscribed_players", { guildId: session.event.channel.id, platform: session.event.platform, nickName: input_data }))[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }
                session.send("正在获取玩家数据，请稍后...");
                // let steamId = flagBindedPlayer ? flagBindedPlayer.steamId : input_data;
                let hero = findingHero(options.hero);
                let steamId = flagBindedPlayer?.steamId ?? input_data;
                let player;
                try {
                    player = (await utils.query(queries.PLAYER_INFO_WITH_25_MATCHES(steamId, hero?.id))).data.player;
                    let playerExtra = (await utils.query(queries.PLAYER_EXTRA_INFO(steamId, player.matchCount, Object.keys(dotaconstants.heroes).length, hero?.id))).data.player;
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
                    // 储存玩家分段
                    player.rank = {
                        medal: parseInt(player.steamAccount.seasonRank?.toString().split("")[0] ?? 0),
                        star: parseInt(player.steamAccount.seasonRank?.toString().split("")[1] ?? 0),
                        leaderboard: player.steamAccount.seasonLeaderboardRank,
                        inTop100: player.steamAccount.seasonLeaderboardRank ? (player.steamAccount.seasonLeaderboardRank <= 10 ? "8c" : player.steamAccount.seasonLeaderboardRank <= 100 ? "8b" : undefined) : undefined,
                    };

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

                    if (hero) {
                        const { matchCount, winCount, imp } = player.heroesPerformanceTop10[0];
                        player.matchCount = matchCount;
                        player.winCount = winCount;
                        player.performance.imp = imp;
                        player.dotaPlus = player.dotaPlus.filter((dpHero) => dpHero.heroId == hero.id);
                    }
                    player.genHero = hero;
                    session.send(await ctx.puppeteer.render(genImageHTML(player, config.template_player, TemplateType.Player)));
                } catch (error) {
                    ctx.logger.error(error);
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
                let fhero = findingHero(input_data);
                if (!fhero) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }

                try {
                    let AbilitiesConstantsCN;
                    let queryConstants = (await utils.query(queries.CURRENT_GAMEVERSION())).data.constants;
                    AbilitiesConstantsCN = (await ctx.database.get("dt_constants_abilities_cn", [1]))[0];
                    if (!AbilitiesConstantsCN || AbilitiesConstantsCN.gameVersionId < queryConstants.gameVersions[0].id) {
                        session.send("初次使用或版本更新，正在更新英雄技能数据中……");

                        AbilitiesConstantsCN = { data: (await utils.query(queries.ALL_ABILITIES_CHINESE_NAME())).data.constants };
                        await ctx.database.upsert("dt_constants_abilities_cn", (row) => [{ id: 1, data: AbilitiesConstantsCN, gameVersionId: queryConstants.gameVersions[0].id, gameVersionName: queryConstants.gameVersions[0].name }]);
                    }
                    // hero
                    let hero = (await utils.query(queries.HERO_INFO(fhero.id))).data.constants.hero;
                    hero.talents.forEach((talent) => (talent.name_cn = AbilitiesConstantsCN.data.abilities?.find((item) => item.id == talent.abilityId)?.language?.displayName));
                    await session.send(await ctx.puppeteer.render(genImageHTML(hero, config.template_hero, TemplateType.Hero)));
                } catch (error) {
                    ctx.logger.error(error);
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
                let hero = findingHero(input_data);
                if (!hero) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }
                try {
                    let heroStats = (await utils.query(queries.HERO_MATCHUP_WINRATE(hero.id))).data.heroStats;
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
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("获取数据失败");
                    return;
                }
            }
        });

    function findingHero(input): { id: number; name: string; shortName: string; names_cn: Array<string>; localized_name: string } {
        if (!input) return;
        let dc_heroes = Object.values(dotaconstants.heroes).map((hero) => ({
            id: hero["id"],
            name: hero["name"],
            shortName: hero["name"].match(/^npc_dota_hero_(.+)$/)[1],
            localized_name: hero["localized_name"].toLowerCase().replace(/\s+/g, ""),
        }));
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
        return heroes.find((hero) => hero.names_cn.some((cn) => cn.toLowerCase() == input.toLowerCase()) || hero.shortName === input.toLowerCase() || hero.id == input);
    }
    // ctx.command("来个笑话").action(async ({ session }) => {
    //     session.send(await utils.getJoke());
    // });
    ctx.command("7.36 <input_data>", "查询7.36改动")
        .option("refresh", "-r 重新获取数据")
        .usage("可查询英雄改动并生成图片返回")
        .example("7.36 小松许")
        .action(async ({ session, options }, input_data) => {
            if (!("dt_7_36" in ctx.database.tables)) await ctx.model.extend("dt_7_36", { id: "integer", data: "string" });
            const tem = await ctx.database.get("dt_7_36",undefined,["id"])
            if (!(tem.length) || options.refresh) {
                try {
                    session.send((!(tem.length) ? "初次使用，" : "") + "正在获取数据……");

                    await ctx.model.extend("dt_7_36", { id: "integer", data: "string" });
                    // await ctx.puppeteer.browser.process()
                    const page = await ctx.puppeteer.page();
                    await page.setExtraHTTPHeaders({
                        "Accept-Language": "zh-CN,zh;q=0.9",
                    });

                    await page.goto("https://www.dota2.com/patches/7.36");
                    await page.waitForSelector("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2) > div:nth-of-type(1)");
                    await page.evaluate(() => {
                        const scripts = document.querySelectorAll("script");
                        scripts.forEach((script) => script.remove());
                    });
                    // 提取并处理特定的div元素
                    const result = await page.evaluate(() => {
                        try {
                            const divs = document.querySelectorAll("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2) > div");
                            const divArray = [];

                            divs.forEach((div) => {
                                const subDiv: any = div.querySelector("a > div");
                                console.log(subDiv);
                                const match = subDiv?.style.backgroundImage.match(/\/apps\/dota2\/images\/dota_react\/heroes\/([^"]+)\.png"\)/);
                                console.log(match);

                                divArray.push({ heroName: match[1], div: div.outerHTML });
                            });
                            document
                                .querySelectorAll("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2) > div:not(:first-of-type)")
                                .forEach((node) => node.remove());
                            document.querySelector("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2) > div").classList.add("placeholder");

                            const prepareToRemovesNodes = [
                                document.querySelector("body > div:first-of-type"),
                                document.querySelector("body > div:nth-of-type(2) > div:first-of-type > div:first-of-type"),
                                document.querySelector("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(1)"),
                                document.querySelector("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(2)"),
                                document.querySelector("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(1)"),
                                ...document.querySelectorAll("body > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(3) > div:not(:last-of-type)"),
                            ];

                            prepareToRemovesNodes.forEach((node) => node?.remove());

                            // 将处理后的div数组和剩余的HTML内容返回
                            const remainingContent = document.documentElement.outerHTML;

                            return {
                                divArray,
                                remainingContent,
                            };
                        } catch (error) {
                            console.error(error);
                        }
                    });
                    page.close();
                    const heroes = [];
                    result.divArray.forEach((hero) => {
                        const res: any = Object.values(dotaconstants.heroes).find((Chero: any) => Chero.name.match(/^npc_dota_hero_(.+)$/)[1] == hero.heroName);
                        heroes.push({ id: res.id, data: hero.div });
                    });
                    heroes.push({ id: 0, data: result.remainingContent });
                    await ctx.database.upsert("dt_7_36", (row) => heroes);
                    await session.send("数据获取完成。");
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("数据获取失败。");
                    return;
                }
            }
            if (input_data) {
                try {
                    const hero = findingHero(input_data);
                    if (!hero) {
                        session.send("英雄参数输入有误，请检查后重试。");
                        return;
                    }
                    session.send("正在查询，请耐心等待……");
                    const page = await ctx.puppeteer.page();
                    // 禁用网络拦截器
                    await page.setRequestInterception(false);

                    // await page.goto("https://www.dota2.com/patches/7.36");
                    const [wrapperHTML, newHeroHTML] = (await ctx.database.get("dt_7_36", [0, hero.id])).map((data) => data.data);
                    await page.setContent(wrapperHTML);
                    await page.waitForSelector("div.placeholder");

                    const placeholder = await page.$("div.placeholder");
                    await page.waitForSelector("div.placeholder");
                    await page.evaluate(
                        (element, html) => {
                            element.outerHTML = html;
                        },
                        placeholder,
                        newHeroHTML
                    );
                    // Wait for all images to load
                    await page.evaluate(async () => {
                        const images = Array.from(document.querySelectorAll("img"));
                        const backgroundImages = Array.from(document.querySelectorAll("*")).filter((element) => {
                            const bg = window.getComputedStyle(element).backgroundImage;
                            return bg && bg !== "none";
                        });
                        const loadImage = (src) => {
                            return new Promise((resolve) => {
                                const img = new Image();
                                img.onload = resolve;
                                img.onerror = () => {
                                    // Replace the failed image with a placeholder
                                    const placeholderSrc = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/innate_icon.png";
                                    img.src = placeholderSrc;
                                    img.onload = resolve;
                                    img.onerror = resolve; // Resolve even if the placeholder fails to load
                                };
                                img.src = src;
                            });
                        };

                        await Promise.all([
                            ...images.map((img) => {
                                if (img.complete) return Promise.resolve();
                                else {
                                    return new Promise((resolve) => {
                                        img.onload = resolve;
                                        img.onerror = () => {
                                            const placeholderSrc = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/innate_icon.png";
                                            img.src = placeholderSrc;
                                            img.onload = resolve;
                                            img.onerror = resolve;
                                        };
                                    });
                                }
                            }),
                            ...backgroundImages.map((element) => {
                                const bg = window.getComputedStyle(element).backgroundImage;
                                const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
                                if (urlMatch && urlMatch[1]) {
                                    const src = urlMatch[1];
                                    return loadImage(src);
                                } else return Promise.resolve();
                            }),
                        ]);
                        await new Promise((resolve) => setTimeout(resolve, 500));
                    });

                    const testE = await page.$("body > div > div > div > div > div > div > div");
                    const res = await testE.screenshot();
                    // // 将Buffer对象转换为base64编码的字符串
                    const base64String = Buffer.from(res).toString("base64");
                    // // 创建一个包含base64编码字符串的img标签
                    const imgTag = `<img src="data:image/png;base64,${base64String}" alt="Image" />`;
                    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.png", res);
                    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", await page.content());
                    session.send(imgTag);
                    page.close();
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("查询改动失败。");
                }
            } else session.send("https://www.dota2.com/patches/7.36");
        });

    ctx.command("test <input_data>")
        .option("a", "a")
        .action(async ({ session, options }, input_data) => {
            // if (input_data) {
            //     let dc_heroes = Object.values(dotaconstants.heroes).map((hero) => ({ id: hero["id"], name: hero["name"], shortName: hero["name"].match(/^npc_dota_hero_(.+)$/)[1] }));
            //     let cn_heroes = Object.keys(d2a.HEROES_CHINESE).map((key) => ({
            //         id: parseInt(key),
            //         names_cn: d2a.HEROES_CHINESE[key],
            //     }));
            //     const mergedMap = new Map();
            //     [dc_heroes, cn_heroes].forEach((array) => {
            //         array.forEach((item) => {
            //             const existingItem = mergedMap.get(item.id);
            //             if (existingItem) mergedMap.set(item.id, { ...existingItem, ...item });
            //             else mergedMap.set(item.id, item);
            //         });
            //     });
            //     let heroes = Array.from(mergedMap.values());
            //     let hero = heroes.find((hero) => hero.names_cn.includes(input_data) || hero.shortName === input_data.toLowerCase() || hero.id == input_data);
            //     session.send(JSON.stringify(hero));
            // }
            // session.send(`${random.pick(["嗯", "啊", "蛤", "啥", "咋", "咦", "哦"])}？`);
            // ctx.broadcast(["chronocat:304996520"], "-test");
            // ctx.broadcast(["chronocat:304996520"], "-test1");
            // session.send();
            // await ctx.puppeteer.()
            // console.log((await ctx.database.get("dt_7_36", [0]))[0].data);
            console.log(session);
            ctx.broadcast(["kook:9510442027074966"], "test");
        });

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
        // 日报功能
        if (config.dailyReportSwitch) {
            ctx.cron(`0 ${config.dailyReportHours} * * *`, async function () {
                const oneDayAgo = moment().subtract(1, "days").unix();
                const subscribedGuilds = await ctx.database.get("dt_subscribed_guilds", undefined);
                const subscribedPlayersInGuild: any[] = (await ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedGuilds.some((guild) => guild.guildId == player.guildId));

                const players = (
                    await utils.query(
                        queries.MATCHES_FOR_DAILY(
                            subscribedPlayersInGuild.map((player) => player.steamId).filter((value, index, self) => self.indexOf(value) === index),
                            oneDayAgo
                        )
                    )
                ).data.players.filter((player) => player.matches.length > 0);
                const matches = players
                    .map((player) => player.matches.map((match) => match))
                    .flat()
                    .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
                for (let subPlayer of subscribedPlayersInGuild) {
                    let player = players.find((player) => subPlayer.steamId == player.steamAccount.id);
                    if (!player) continue;
                    const guildMember = await ctx.bots.find((bot) => bot.platform == subPlayer.platform)?.getGuildMember(subPlayer.guildId, subPlayer.userId);
                    subPlayer.name = subPlayer.nickName || (guildMember?.nick ?? players.find((player) => player.steamAccount.id == subPlayer.steamId)?.steamAccount.name);

                    player.winCount = player.matches.filter((match) => match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).isRadiant).length;
                    player.loseCount = player.matches.length - player.winCount;
                    player.avgKills = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).kills, 0) / player.matches.length, 2);
                    player.avgDeaths = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).deaths, 0) / player.matches.length, 2);
                    player.avgAssists = utils.roundToDecimalPlaces(
                        player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).assists, 0) / player.matches.length,
                        2
                    );
                    player.avgKDA = utils.roundToDecimalPlaces((player.avgKills + player.avgAssists) / (player.avgDeaths || 1), 2);
                    player.avgImp = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).imp, 0) / player.matches.length, 0);

                    subPlayer = Object.assign(subPlayer, player);
                }

                for (let guild of subscribedGuilds) {
                    const currentsubscribedPlayers = subscribedPlayersInGuild.filter((player) => player.platform == guild.platform && player.guildId == guild.guildId && player.matches?.length);
                    if (currentsubscribedPlayers.length) {
                        const currentsubscribedPlayersIds = currentsubscribedPlayers.map((player) => player.steamId);
                        const combinationsMap = new Map();

                        matches.forEach((match) => {
                            const sortedPlayerIds = match.players
                                .map((player) => player.steamAccount.id)
                                .filter((id) => currentsubscribedPlayersIds.includes(id))
                                .sort((a, b) => a.steamId - b.steamId);
                            const key = sortedPlayerIds.join(",");

                            if (!combinationsMap.has(key)) {
                                const players = currentsubscribedPlayers.filter((subPlayer) => sortedPlayerIds.includes(subPlayer.steamId));
                                // console.log(players);
                                if (players.length > 0) {
                                    const name = players.map((subPlayer) => subPlayer.name).join("/");
                                    combinationsMap.set(key, {
                                        players,
                                        name,
                                        winCount: match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == players[0].steamId).isRadiant ? 1 : 0,
                                        matches: [match],
                                    });
                                }
                            } else {
                                const combi = combinationsMap.get(key);
                                combi.matches.push(match);
                                combi.winCount += match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == combi.players[0].steamId).isRadiant ? 1 : 0;
                            }
                        });

                        const combinations = Array.from(combinationsMap.values());
                        await ctx.broadcast(
                            [`${guild.platform}:${guild.guildId}`],
                            `昨日总结：
                            ${currentsubscribedPlayers
                                .map(
                                    (player) =>
                                        `${player.name}: ${player.winCount}胜${player.loseCount}负 胜率${Math.round((player.winCount / player.matches.length) * 100)}%，平均KDA: [${player.avgKills}/${player.avgDeaths}/${
                                            player.avgAssists
                                        }](${player.avgKDA})，平均表现: ${player.avgImp > 0 ? "+" : ""}${player.avgImp}`
                                )
                                .join("\n")}
                            ${combinations.map((combi) => `组合[${combi.name}]: ${combi.winCount}胜${combi.matches.length - combi.winCount}负 胜率${Math.round((combi.winCount / combi.matches.length) * 100)}%`).join("\n")}`.replace(
                                /\s*\n\s*/g,
                                "\n"
                            )
                        );
                    }
                }
            });
        }
        // 每分钟执行一次查询玩家最近比赛记录，若未发布过则进入待发布列表；检查待发布列表，若满足发布条件（比赛已被解析）则生成图片并发布。
        ctx.cron("* * * * *", async function () {
            // 获取注册玩家ID，每分钟获取玩家最新比赛，判定是否播报过
            // 获取所有订阅群组
            const subscribedGuilds = await ctx.database.get("dt_subscribed_guilds", undefined);
            // 获取所有绑定玩家，过滤出在订阅群组中的绑定玩家
            const subscribedPlayersInGuild = (await ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedGuilds.some((guild) => guild.guildId == player.guildId));
            if (subscribedPlayersInGuild.length > 0) {
                // 获取这些玩家的SteamID并去重
                const subscribedPlayersSteamIds = subscribedPlayersInGuild
                    .map((player) => player.steamId)
                    .filter(function (value, index, self) {
                        return self.indexOf(value) === index;
                    });
                // 获取所有查询到的玩家最新比赛并根据match.id去重
                const lastMatches = (await utils.query(queries.PLAYERS_LASTMATCH(subscribedPlayersSteamIds))).data.players
                    .map((player) => player.matches[0])
                    .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)) // 根据match.id去重
                    .filter((match) => moment.unix(match.startDateTime).isAfter(moment().subtract(1, "days"))) // 排除1天以前的比赛，防止弃坑数年群友绑定时突然翻出上古战报
                    .filter((match) => !pendingMatches.some((pendingMatch) => pendingMatch.matchId == match.id)); // 判断是否已加入待发布列表
                // 在发布过的比赛id中查找以上比赛
                const sendedMatchesIds = (await ctx.database.get("dt_sended_match_id", { matchId: lastMatches.map((match) => match.id) }, ["matchId"])).map((match) => match.matchId);
                // 遍历去重后的match，若match未在pendingMatches中，则获取match中与subscribedPlayersInGuild中SteamID相符的玩家push入pendingMatches中
                lastMatches
                    .filter((match) => !sendedMatchesIds.includes(match.id)) // 判断是否发布过
                    .forEach((match) => {
                        const tempGuilds: Array<{ guildId: string; platform: string; players: Array<utils.dt_subscribed_players> }> = [];
                        match.players.forEach((player) => {
                            const subscribedPlayer = subscribedPlayersInGuild.find((subscribedPlayer) => subscribedPlayer.steamId === player.steamAccount.id);
                            if (subscribedPlayer) {
                                const tempGuild = tempGuilds.find((guild) => guild.guildId == subscribedPlayer.guildId && guild.platform == subscribedPlayer.platform);
                                if (tempGuild) tempGuild.players.push(subscribedPlayer);
                                else tempGuilds.push({ guildId: subscribedPlayer.guildId, platform: subscribedPlayer.platform, players: [subscribedPlayer] });
                            }
                        });
                        pendingMatches.push({ matchId: match.id, guilds: tempGuilds });
                        ctx.logger.info(
                            tempGuilds
                                .map((guild) => `追踪到来自群组${guild.platform}:${guild.guildId}的用户${guild.players.map((player) => `[${player.nickName ?? ""}(${player.steamId})]`).join("、")}的尚未播报过的最新比赛 ${match.id}。`)
                                .join("")
                        );
                    });
            }

            // 获取待解析比赛列表并发布 (若待解析列表数量不止一场，每分钟只取第一位进行尝试防止同时高并发调用API)
            if (pendingMatches.length > 0) {
                const pendingMatch = pendingMatches[0];
                try {
                    let match;
                    let queryLocal = await ctx.database.get("dt_previous_query_results", pendingMatch.matchId, ["data"]);
                    if (queryLocal.length > 0) {
                        match = queryLocal[0].data;
                        ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
                    } else match = utils.getFormattedMatchData((await utils.query(queries.MATCH_INFO(pendingMatch.matchId))).data.match);
                    if (match.parsedDateTime || moment.unix(match.endDateTime).isBefore(moment().subtract(config.dataParsingTimeoutMinutes, "minutes"))) {
                        pendingMatches = pendingMatches.filter((item) => item.matchId != match.id);

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

                        const img = await ctx.puppeteer.render(genImageHTML(match, config.template_match, TemplateType.Match));
                        for (let commingGuild of pendingMatch.guilds) {
                            let broadMatchMessage = "";
                            let idsToFind = commingGuild.players.map((player) => player.steamId);
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
                                broadPlayerMessage += `。\nKDA：${((player.kills + player.assists) / (player.deaths || 1)).toFixed(2)} [${player.kills}/${player.deaths}/${player.assists}]，GPM/XPM：${player.goldPerMinute}/${
                                    player.experiencePerMinute
                                }，补刀数：${player.numLastHits}/${player.numDenies}，伤害/塔伤：${player.heroDamage}/${player.towerDamage}，参战/参葬率：${(player.killContribution * 100).toFixed(2)}%/${(
                                    player.deathContribution * 100
                                ).toFixed(2)}%`;
                                broadMatchMessage += broadPlayerMessage + "\n";
                            }
                            await ctx.broadcast([`${commingGuild.platform}:${commingGuild.guildId}`], broadMatchMessage + img);
                            ctx.logger.info(`${match.id}${match.parsedDateTime ? "已解析，" : "已结束超过1小时仍未被解析，放弃解析直接"}生成图片并发布于${commingGuild.platform}:${commingGuild.guildId}。`);
                        }
                        if (match.parsedDateTime)
                            // 当比赛数据已解析时才进行缓存
                            ctx.database.upsert("dt_previous_query_results", (row) => [{ matchId: match.id, data: match, queryTime: new Date() }]);
                        ctx.database.create("dt_sended_match_id", { matchId: match.id, sendTime: new Date() });
                    } else ctx.logger.info("比赛 %d 尚未解析完成，继续等待。", match.id);
                } catch (error) {
                    ctx.logger.error(error);
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
    ejs.renderFile(templatePath, templateData, { strict: false }, (err, html) => {
        if (err) throw err;
        else result = html;
    });
    if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", result);
    return result;
}
