import { Context, Schema, h } from "koishi";
import * as utils from "./utils.ts";
import * as queries from "./queries.ts";
import { ImageType, HeroDescType } from "./utils.ts";
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
    dailyReportShowCombi: boolean;
    weeklyReportSwitch: boolean;
    weeklyReportDayHours: Array<number>;
    weeklyReportShowCombi: boolean;
    urlInMessageType: Array<string>;
    rankBroadSwitch: boolean;
    rankBroadStar: boolean;
    rankBroadLeader: boolean;
    rankBroadFun: boolean;
    template_match: string;
    template_player: string;
    template_hero: string;
}
export const Config: Schema = Schema.intersect([
    Schema.object({
        STRATZ_API_TOKEN: Schema.string().required().description("※必须。stratz.com的API TOKEN，可在 https://stratz.com/api 获取。"),
        dataParsingTimeoutMinutes: Schema.number().default(60).min(0).max(1440).description("等待比赛数据解析的时间（单位：分钟）。如果数据解析时间超过等待时间，将直接生成战报而不再等待解析完成。"),

        urlInMessageType: Schema.array(
            Schema.union([
                Schema.const("match").description("在查询比赛与战报消息中附带stratz比赛页面链接"),
                Schema.const("player").description("在查询玩家信息消息中附带stratz玩家页面链接"),
                Schema.const("hero").description("在查询英雄数据消息中附带刀塔百科对应英雄页面链接"),
            ])
        )
            .role("checkbox")
            .description("在消息中附带链接，<br/>请选择消息类型："),
    }).description("基础设置"),
    Schema.intersect([
        Schema.object({
            rankBroadSwitch: Schema.boolean().default(false).description("段位变动播报"),
        }),
        Schema.union([
            Schema.object({
                rankBroadSwitch: Schema.const(true).required(),
                rankBroadStar: Schema.boolean().default(true).description("星级变动播报"),
                rankBroadLeader: Schema.boolean().default(true).description("冠绝名次变动播报"),
                rankBroadFun: Schema.boolean().default(false).description("整活播报模板"),
            }),
            Schema.object({}),
        ]),
    ]),
    Schema.intersect([
        Schema.object({
            dailyReportSwitch: Schema.boolean().default(false).description("日报功能"),
        }).description("总结设置"),
        Schema.union([
            Schema.object({
                dailyReportSwitch: Schema.const(true).required(),
                dailyReportHours: Schema.number().min(0).max(23).default(6).description("日报时间小时"),
                dailyReportShowCombi: Schema.boolean().default(true).description("日报是否显示组合"),
            }),
            Schema.object({}),
        ]),
        Schema.object({
            weeklyReportSwitch: Schema.boolean().default(false).description("周报功能"),
        }),
        Schema.union([
            Schema.object({
                weeklyReportSwitch: Schema.const(true).required(),
                weeklyReportDayHours: Schema.tuple([Schema.number().min(1).max(7), Schema.number().min(0).max(23)])
                    .default([1, 10])
                    .description("周报发布于周（几）的（几）点"),
                weeklyReportShowCombi: Schema.boolean().default(true).description("周报是否显示组合"),
            }),
            Schema.object({}),
        ]),
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
                ctx.database.remove("dt_subscribed_guilds", { guildId: session.event.channel.id, platform: session.event.platform });
                session.send("取消订阅成功。");
                return;
            }
        } else session.send("本群尚未订阅，无需取消订阅。");
    });

    ctx.command("绑定 <steam_id> [nick_name]", "绑定SteamID，并起一个别名（也可以不起）")
        .usage("将你的SteamID与你的账号绑定，若本群已订阅将会实时获取你的新比赛数据发布至群中。")
        .example("绑定 123456789")
        .example("绑定 123456789 张三")
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
        .example("改名 李四")
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
    async function queryMatchAndSend(session, matchId) {
        try {
            let match;
            let queryLocal = await ctx.database.get("dt_previous_query_results", matchId, ["data"]);
            if (queryLocal.length > 0) {
                match = queryLocal[0].data;
                ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
            } else {
                match = utils.getFormattedMatchData((await utils.query(queries.MATCH_INFO(matchId))).data);
            }
            if (match && (match.parsedDateTime || moment.unix(match.endDateTime).isBefore(moment().subtract(config.dataParsingTimeoutMinutes, "minutes")))) {
                session.send((ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + matchId : "") + (await ctx.puppeteer.render(genImageHTML(match, config.template_match, TemplateType.Match))));
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
        .example("查询比赛 1234567890")
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

            queryMatchAndSend(session, match_id);

            // await ctx.puppeteer.render(await utils.getMatchImage_HTML(match_id));
        });

    ctx.command("查询最近比赛 [input_data]", "查询玩家的最近比赛")
        .usage("查询指定玩家的最近一场比赛的比赛数据，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .example("查询最近比赛 123456789")
        .example("查询最近比赛 张三")
        .action(async ({ session }, input_data) => {
            if (session.guild || (!session.guild && input_data)) {
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
                    lastMatchId = (await utils.query(queries.PLAYERS_LASTMATCH_RANKINFO(parseInt(flagBindedPlayer?.steamId ?? input_data)))).data.player.matches[0].id;
                } catch {
                    session.send("获取玩家最近比赛失败。");
                    return;
                }
                queryMatchAndSend(session, lastMatchId);
            } else {
                session.send("<p>指令调用失败。</p><p>当前不属于群聊状态，必须提供指定玩家的SteamID。</p>");
            }
        });

    ctx.command("查询玩家 <input_data>", "查询玩家信息，可指定英雄")
        .usage("查询指定玩家的个人信息与最近战绩，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .option("hero", "-o <value:string> 查询玩家指定英雄使用情况（同其他英雄查询，可用简称与ID）")
        .example("查询玩家 123456789")
        .example("查询玩家 张三")
        .example("查询玩家 张三 hero 敌法师")
        .action(async ({ session, options }, input_data) => {
            if (session.guild || (!session.guild && input_data)) {
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
                    session.send(
                        (ctx.config.urlInMessageType.some((type) => type == "player") ? "https://stratz.com/players/" + player.steamAccount.id : "") +
                            (await ctx.puppeteer.render(genImageHTML(player, config.template_player, TemplateType.Player)))
                    );
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("获取玩家信息失败。");
                }
            } else {
                session.send("<p>指令调用失败。</p><p>当前不属于群聊状态，必须提供指定玩家的SteamID。</p>");
            }
        });

    ctx.command("查询英雄 <input_data>", "查询英雄技能/面板信息")
        .usage("查询英雄的技能说明与各项数据，生成图片发布。\n参数可输入英雄ID、英雄名、英雄常用别名")
        .option("random", "-r 随机选择英雄")
        .example("查询英雄 15")
        .example("查询英雄 雷泽")
        .example("查询英雄 电魂")
        .action(async ({ session, options }, input_data) => {
            if (options.random) input_data = random.pick(Object.keys(d2a.HEROES_CHINESE));
            if (input_data) {
                let hero: any = findingHero(input_data);
                if (!hero) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }
                await session.send("正在获取英雄数据，请稍后...");
                try {
                    const queryHero = await utils.queryHeroFromValve(hero.id);
                    Object.assign(hero, queryHero);
                    // 处理命石新增的技能
                    hero.facet_abilities.forEach((fa, i) => {
                        if (fa.abilities.length) {
                            fa.abilities.forEach((ab) => {
                                if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
                                if ((hero.facets[i] as any).description_loc !== ab.desc_loc)
                                    (hero.facets[i] as any).abilities.push({ id: ab.id, name: ab.name, name_loc: ab.name_loc, description_ability_loc: utils.formatHeroDesc(ab.desc_loc, ab.special_values, HeroDescType.Facet) });
                                else (hero.facets[i] as any).description_loc = utils.formatHeroDesc((hero.facets[i] as any).description_loc, ab.special_values, HeroDescType.Facet);
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
                                (hero.facets[i] as any).abilities.push({ id: ab.id, name: ab.name, name_loc: ab.name_loc, description_ability_loc: utils.formatHeroDesc(facet, ab.special_values, HeroDescType.Facet), attributes: [] });
                            }
                        });
                        hero.facets.forEach((facet) => {
                            const svs = ab.special_values.filter((sv) => sv.facet_bonus.name === facet.name);
                            svs.forEach((sv) => {
                                if (sv.heading_loc) {
                                    if (!facet.abilities) facet.abilities = [];
                                    (facet as any).abilities.find((ability: any) => ab.id == ability.id)?.attributes.push({ heading_loc: sv.heading_loc, values: [...sv.facet_bonus.values], is_percentage: sv.is_percentage });
                                }
                            });
                            facet.description_loc = utils.formatHeroDesc(facet.description_loc, svs, HeroDescType.Facet);
                        });
                        // 处理技能本身说明
                        ab.desc_loc = utils.formatHeroDesc(ab.desc_loc, ab.special_values, (ab as any).ability_is_facet ? HeroDescType.Facet : undefined);
                        ab.notes_loc = ab.notes_loc.map((note) => utils.formatHeroDesc(note, ab.special_values));
                        // 处理神杖与魔晶说明
                        if (ab.ability_has_scepter) ab.scepter_loc = utils.formatHeroDesc(ab.scepter_loc, ab.special_values, HeroDescType.Scepter);
                        if (ab.ability_has_shard) ab.shard_loc = utils.formatHeroDesc(ab.shard_loc, ab.special_values, HeroDescType.Shard);
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
                                    const replacements: { original: string; replacement: any }[] = [];

                                    while ((match = regex.exec(talent.name_loc)) !== null) {
                                        const specialValue = specialValues.find((sv) => sv.name === String((match as any)[1]));
                                        const replacement = specialValue?.bonuses.find((bonus) => bonus.name === talent.name)?.value;
                                        if (replacement !== undefined) {
                                            replacements.push({ original: match[0], replacement });
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
                    await session.send(
                        (ctx.config.urlInMessageType.some((type) => type == "hero") ? `https://wiki.dota2.com.cn/hero/${hero.shortName}.html` : "") + (await ctx.puppeteer.render(genImageHTML(hero, config.template_hero, TemplateType.Hero)))
                    );
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("获取数据失败");
                }
            } else {
                session.send("请输入参数。");
            }
        });

    ctx.command("查询英雄对战 <input_data:string>", "查询英雄近一周的最佳搭档与最佳克星英雄")
        .usage("根据输入英雄查询最近一周比赛数据（传奇~万古分段）中与该英雄组合胜率最高英雄和与该英雄对抗胜率最低英雄。\n参数可输入英雄ID、英雄名、英雄常用别名")
        .option("limit", "-l <value:number> 返回英雄个数（默认值 5）", { fallback: 5 })
        .option("filter", "-f <value:number> 过滤场数过低的组合（单位：%，默认值0.75）", { fallback: 0.5 })
        .example("查询英雄对战 敌法师\t（无额外参数默认返回5个英雄，过滤舍弃场次占比0.75%以下）")
        .example("查询英雄对战 敌法师 -l=10 -f=1\t（返回10个英雄，过滤舍弃场次占比1%以下）")
        .example("查询英雄对战 敌法师 -l 10 -f 1\t（等同于上例，参数接空格也可使用）")
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

    // ctx.command("test <input_data>")
    //     .option("a", "a")
    //     .action(async ({ session, options }, input_data) => {

    //     });

    ctx.on("ready", async () => {
        // 注册数据库-表
        ctx.model.extend("dt_subscribed_guilds", { id: "unsigned", guildId: "string", platform: "string" }, { autoInc: true });
        ctx.model.extend("dt_subscribed_players", { id: "unsigned", userId: "string", guildId: "string", platform: "string", steamId: "integer", nickName: "string", rank: "json" }, { autoInc: true });
        ctx.model.extend("dt_sended_match_id", { matchId: "unsigned", sendTime: "timestamp" }, { primary: "matchId" });
        ctx.model.extend("dt_previous_query_results", { matchId: "unsigned", data: "json", queryTime: "timestamp" }, { primary: "matchId" });

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
                await report(oneDayAgo, "昨日总结", config.dailyReportShowCombi);
            });
        }
        if (config.weeklyReportSwitch) {
            ctx.cron(`0 ${config.weeklyReportDayHours[1]} * * ${config.weeklyReportDayHours[0]}`, async function () {
                const oneWeekAgo = moment().subtract(1, "weeks").unix();
                await report(oneWeekAgo, "上周总结", config.weeklyReportShowCombi);
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
                const players = (await utils.query(queries.PLAYERS_LASTMATCH_RANKINFO(subscribedPlayersSteamIds))).data.players;
                const lastMatches = players
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
                            subscribedPlayersInGuild
                                .filter((subscribedPlayer) => subscribedPlayer.steamId === player.steamAccount.id)
                                .forEach((subscribedPlayer) => {
                                    if (subscribedPlayer) {
                                        const tempGuild = tempGuilds.find((guild) => guild.guildId == subscribedPlayer.guildId && guild.platform == subscribedPlayer.platform);
                                        if (tempGuild) tempGuild.players.push(subscribedPlayer);
                                        else tempGuilds.push({ guildId: subscribedPlayer.guildId, platform: subscribedPlayer.platform, players: [subscribedPlayer] });
                                    }
                                });
                        });
                        pendingMatches.push({ matchId: match.id, guilds: tempGuilds });
                        utils.query(queries.REQUEST_MATCH_DATA_ANALYSIS(match.id));
                        ctx.logger.info(
                            tempGuilds
                                .map((guild) => `追踪到来自群组${guild.platform}:${guild.guildId}的用户${guild.players.map((player) => `[${player.nickName ?? ""}(${player.steamId})]`).join("、")}的尚未播报过的最新比赛 ${match.id}。`)
                                .join("")
                        );
                    });

                // 段位变动播报
                // 创建 steamId 到 rank 的哈希表
                const rankMap = players.reduce((map, player) => {
                    map[player.steamAccount.id] = { rank: player.steamAccount.seasonRank, leader: player.steamAccount.seasonLeaderboardRank };
                    return map;
                }, {});

                // 遍历已绑定玩家列表，判断段位是否变动
                for (let subPlayer of subscribedPlayersInGuild) {
                    if (subPlayer.rank.rank !== rankMap[subPlayer.steamId].rank || subPlayer.rank.leader !== rankMap[subPlayer.steamId].board) {
                        // 此条判断语句为旧版本dotatracker准备，旧版升到新版后subPlayer.rank为空对象，此时为第一次绑定段位信息，所以不进行播报
                        if (Object.keys(subPlayer.rank).length != 0) {
                            if (config.rankBroadSwitch) {
                                const ranks = ["prevRank", "currRank"].reduce((acc, key) => {
                                    const source = key === "prevRank" ? subPlayer.rank : rankMap[subPlayer.steamId];
                                    acc[key] = {
                                        medal: parseInt(source.rank?.toString().split("")[0] ?? "0"),
                                        star: parseInt(source.rank?.toString().split("")[1] ?? "0"),
                                        leader: source.leader,
                                        inTop100: source.leader ? (source.leader <= 10 ? "8c" : source.leader <= 100 ? "8b" : undefined) : undefined,
                                    };
                                    return acc;
                                }, {});
                                const prevRank = ranks["prevRank"];
                                const currRank = ranks["currRank"];
                                if (prevRank.medal !== currRank.medal || (prevRank.star !== currRank.star && config.rankBroadStar) || (prevRank.leader !== currRank.leader && config.rankBroadLeader)) {
                                    const guildMember = await ctx.bots.find((bot) => bot.platform == subPlayer.platform)?.getGuildMember?.(subPlayer.guildId, subPlayer.userId);
                                    const name = subPlayer.nickName ?? guildMember?.nick ?? players.find((player) => player.steamAccount.id == subPlayer.steamId)?.steamAccount.name ?? subPlayer.steamId;
                                    const message = `群友 ${name} 段位变动：${d2a.rank[prevRank.medal]}${prevRank.star} → ${d2a.rank[currRank.medal]}${currRank.star} `;
                                    if (config.rankBroadFun === true) {
                                        // 整活播报
                                        const img = await ctx.puppeteer.render(
                                            genImageHTML(
                                                {
                                                    name,
                                                    avatar: guildMember?.avatar ?? players.find((player) => subPlayer.steamId == player.steamAccount.id).steamAccount.avatar,
                                                    isRising:
                                                        rankMap[subPlayer.steamId].rank > subPlayer.rank.rank ||
                                                        (rankMap[subPlayer.steamId].rank == subPlayer.rank.rank && rankMap[subPlayer.steamId].leader < subPlayer.rank.leader) ||
                                                        (rankMap[subPlayer.steamId].leader > 0 && subPlayer.rank.leader == null),
                                                    prevRank,
                                                    currRank,
                                                },
                                                "rank" + (config.rankBroadFun ? "_fun" : ""),
                                                TemplateType.Rank
                                            )
                                        );
                                        await ctx.broadcast([`${subPlayer.platform}:${subPlayer.guildId}`], img);
                                    } else {
                                        // 常规播报
                                        const img = await ctx.puppeteer.render(genImageHTML(currRank, "rank" + (config.rankBroadFun ? "2" : ""), TemplateType.Rank));
                                        await ctx.broadcast([`${subPlayer.platform}:${subPlayer.guildId}`], message + img);
                                    }
                                    ctx.logger.info(`向 ${subPlayer.platform}:${subPlayer.guildId} 发布段位变动播报信息。`);
                                }
                            }
                        }
                        // 更新玩家的数据记录
                        ctx.database.set("dt_subscribed_players", subPlayer.id, { rank: rankMap[subPlayer.steamId] });
                    }
                }
            }

            // 获取待解析比赛列表并发布 (若待解析列表数量不止一场，每分钟只取第一位进行尝试防止同时高并发调用API)
            if (pendingMatches.length > 0) {
                const now = moment();
                const pendingMatch = pendingMatches[(now.hours() * 60 + now.minutes()) % pendingMatches.length];
                try {
                    let match;
                    let queryLocal = await ctx.database.get("dt_previous_query_results", pendingMatch.matchId, ["data"]);
                    if (queryLocal.length > 0) {
                        match = queryLocal[0].data;
                        ctx.database.set("dt_previous_query_results", match.id, { queryTime: new Date() });
                    } else match = utils.getFormattedMatchData((await utils.query(queries.MATCH_INFO(pendingMatch.matchId))).data);
                    if (match.parsedDateTime || moment.unix(match.endDateTime).isBefore(now.subtract(config.dataParsingTimeoutMinutes, "minutes"))) {
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
                                const random = new Random(() => enhancedSimpleHashToSeed(`${match.id}-${player.steamAccountId}-${player.playerSlot}`));
                                let broadPlayerMessage = `${player.steamAccount.name}的${random.pick(d2a.HEROES_CHINESE[player.hero.id])}`;
                                if (player.isRadiant == match.didRadiantWin) {
                                    if (player.deathContribution < 0.2 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.5 || player.towerDamage > 10000 || player.imp > 0)
                                        broadPlayerMessage += random.pick(d2a.WIN_POSITIVE);
                                    else broadPlayerMessage += random.pick(d2a.WIN_NEGATIVE);
                                } else {
                                    if (player.deathContribution < 0.25 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.0 || player.towerDamage > 5000 || player.imp > 0)
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
                            await ctx.broadcast([`${commingGuild.platform}:${commingGuild.guildId}`], broadMatchMessage + (ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + img);
                            ctx.logger.info(`${match.id}${match.parsedDateTime ? "已解析，" : "已结束超过1小时仍未被解析，放弃等待解析直接"}生成图片并发布于${commingGuild.platform}:${commingGuild.guildId}。`);
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

    // 定义一个异步函数 report，用于生成和发送报告
    async function report(timeAgo, title, showCombi) {
        // 获取所有订阅的公会信息
        const subscribedGuilds = await ctx.database.get("dt_subscribed_guilds", undefined);
        // 获取订阅的玩家，并筛选出那些属于已订阅公会的玩家
        const subscribedPlayersInGuild: any[] = (await ctx.database.get("dt_subscribed_players", undefined)).filter((player) => subscribedGuilds.some((guild) => guild.guildId == player.guildId));

        // 使用工具函数查询比赛数据，将结果中的玩家信息过滤出参与过至少一场比赛的玩家
        const players = (
            await utils.query(
                queries.MATCHES_FOR_DAILY(
                    subscribedPlayersInGuild.map((player) => player.steamId).filter((value, index, self) => self.indexOf(value) === index),
                    timeAgo
                )
            )
        ).data.players.filter((player) => player.matches.length > 0);
        // 对比赛信息去重处理，确保每场比赛唯一
        const matches = players
            .map((player) => player.matches.map((match) => match))
            .flat()
            .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
        // 遍历每位订阅玩家，计算相关统计信息并更新
        for (let subPlayer of subscribedPlayersInGuild) {
            let player = players.find((player) => subPlayer.steamId == player.steamAccount.id);
            if (!player) continue;
            let guildMember;
            try {
                // 尝试获取群组成员信息
                guildMember = await ctx.bots.find((bot) => bot.platform == subPlayer.platform)?.getGuildMember(subPlayer.guildId, subPlayer.userId);
            } catch (error) {
                // 记录错误日志
                ctx.logger.error("获取群组信息失败。" + error);
            }
            // 设置玩家名称，优先使用昵称，其次是公会昵称或Steam账号名称
            subPlayer.name = subPlayer.nickName || (guildMember?.nick ?? players.find((player) => player.steamAccount.id == subPlayer.steamId)?.steamAccount.name);

            // 计算玩家的胜场、败场、平均击杀、死亡、助攻等统计信息
            player.winCount = player.matches.filter((match) => match.didRadiantWin == match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).isRadiant).length;
            player.loseCount = player.matches.length - player.winCount;
            player.avgKills = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).kills, 0) / player.matches.length, 2);
            player.avgDeaths = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).deaths, 0) / player.matches.length, 2);
            player.avgAssists = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).assists, 0) / player.matches.length, 2);
            player.avgKDA = utils.roundToDecimalPlaces((player.avgKills + player.avgAssists) / (player.avgDeaths || 1), 2);
            player.avgImp = utils.roundToDecimalPlaces(player.matches.reduce((acc, match) => acc + match.players.find((innerPlayer) => innerPlayer.steamAccount.id == player.steamAccount.id).imp, 0) / player.matches.length, 0);

            // 更新订阅玩家对象
            subPlayer = Object.assign(subPlayer, player);
        }

        // 处理每个公会的订阅玩家组合和比赛结果
        for (let guild of subscribedGuilds) {
            const currentsubscribedPlayers = subscribedPlayersInGuild.filter((player) => player.platform == guild.platform && player.guildId == guild.guildId && player.matches?.length);
            if (currentsubscribedPlayers.length) {
                const currentsubscribedPlayersIds = currentsubscribedPlayers.map((player) => player.steamId);
                const combinationsMap = new Map();

                // 遍历每场比赛，计算参与的玩家组合及其胜负统计
                matches.forEach((match) => {
                    const sortedPlayerIds = match.players
                        .map((player) => player.steamAccount.id)
                        .filter((id) => currentsubscribedPlayersIds.includes(id))
                        .sort((a, b) => a - b);
                    const key = sortedPlayerIds.join(",");

                    if (!combinationsMap.has(key)) {
                        const players = currentsubscribedPlayers.filter((subPlayer) => sortedPlayerIds.includes(subPlayer.steamId));
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
                try {
                    await ctx.broadcast(
                        [`${guild.platform}:${guild.guildId}`],
                        await ctx.puppeteer.render(
                            genImageHTML(
                                {
                                    title,
                                    players: currentsubscribedPlayers.sort((a, b) => {
                                        if (a.matches.length > b.matches.length) return -1;
                                        else if (a.matches.length < b.matches.length) return 1;
                                        else return a.steamAccount.id - b.steamAccount.id;
                                    }),
                                    combinations,
                                    showCombi,
                                },
                                "daily",
                                TemplateType.Report
                            )
                        )
                    );
                    // 记录日志
                    ctx.logger.info(`发布${title}于${guild.platform}:${guild.guildId}`);
                } catch (error) {
                    // 错误处理
                    ctx.logger.error(error);
                }
            }
        }
    }

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
    Report = "report",
    Rank = "rank",
}

function genImageHTML(data, template, type: TemplateType) {
    // 模板文件的路径
    const templatePath = path.join(`./node_modules/@sjtdev/koishi-plugin-${name}/template/${type}`, template + ".ejs");
    const templateData = {
        data: data,
        utils: utils,
        ImageType: ImageType,
        ImageFormat: utils.ImageFormat,
        d2a: d2a,
        dotaconstants: dotaconstants,
        moment: moment,
        escapeHTML: function escapeHTML(str) {
            return str.replace(/[&<>"']/g, function (match) {
                const escape = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                };
                return escape[match];
            });
        },
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

function enhancedSimpleHashToSeed(inputString) {
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
