import { Channel, Context, Schema, Session, h, I18n } from "koishi";
import * as utils from "./utils.ts";
import { ImageType, HeroDescType } from "./utils.ts";
import {} from "koishi-plugin-puppeteer";
import fs from "fs";
import path from "path";
import moment, { Moment } from "moment";
import * as dotaconstants from "dotaconstants";
import { Random } from "koishi";
import * as cron from "koishi-plugin-cron";
import * as ejs from "ejs";
import * as graphql from "./@types/graphql-generated";
import { query } from "./utils.ts";
import {} from "@koishijs/plugin-locales";
import {} from "@koishijs/cache";

export const name = "dota2tracker";
export const usage = `
DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。  
[本地化/dota2tracker](../../locales/dota2tracker)可以自定义英雄别名和位置代称等文本内容  
**更多信息请进入[插件主页](https://github.com/sjtdev/koishi-plugin-dota2tracker)与[更新日志](https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/changelog.md)查看。**`;
export const inject = ["http", "database", "cron", "puppeteer", "cache"]; // 声明依赖

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
        STRATZ_API_TOKEN: Schema.string().required().role("secret").description("※必须。stratz.com的API TOKEN，可在 https://stratz.com/api 获取。"),
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
    guilds: Record<string, Array<PendingMatchGuild>>;
    queryTime: Date;
}
interface PendingMatchGuild {
    guildId: string;
    platform: string;
    players: Array<utils.dt_subscribed_players>;
}
let pendingMatches: PendingMatch[] = []; // 待发布的比赛，当获取到的比赛未被解析时存入此数组，在计时器中定时查询，直到该比赛已被解析则生成图片发布
// var subscribedGuilds = []; // 已订阅群组
// var subscribedPlayers = []; // 已绑定玩家
// var sendedMatches = []; // 已发布比赛
const random = new Random(() => Math.random());
const days_30: number = 2592000000; // 30天

// At the same time, SupportLanguageTags can also be obtained from the Keys of GraphqlLanguageEnum.
// const SupportLanguageTags = Object.keys(GraphqlLanguageEnum);
enum GraphqlLanguageEnum {
    "en-US" = "ENGLISH",
    "zh-CN" = "S_CHINESE",
}
// 不可修改词典
const constantLocales = {};
export async function apply(ctx: Context, config: Config) {
    // write your plugin here
    utils.init(ctx.http, ctx.setTimeout, config.STRATZ_API_TOKEN);
    for (const supportLanguageTag of Object.keys(GraphqlLanguageEnum)) {
        constantLocales[supportLanguageTag] = require(`./locales/${supportLanguageTag}.constants.json`);
        ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.yml`));
        ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.command.yml`));
        ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.template.yml`));
    }
    const getLanguageTag = async function (session?: Session, channel?: Channel, channelId?: string): Promise<string> {
        // 根据参数获取频道，获取不到则为undefined
        const resolvedChannel: Channel | undefined = channel ?? (await ctx.database.get("channel", { id: session?.event.channel.id ?? channelId }))?.at(0);
        // 根据语言标签列表进行回退，优先级为频道语言>平台语言，随后与已支持语言进行匹配
        return ctx.i18n.fallback((resolvedChannel?.locales ?? []).concat(Object.values(ctx.i18n.locales).map((locale) => Object.keys(locale).at(0)))).find((locale) => Object.keys(GraphqlLanguageEnum).some((language) => locale == language));
    };

    ctx.command("subscribe")
        .alias("订阅本群")
        .action(async ({ session }) => {
            if (session.guild) {
                // let currentGuild = subscribedGuilds.find((item) => item.id == session.event.channel.id && item.platform == session.event.platform);
                let currentGuild = (
                    await ctx.database.get("dt_subscribed_guilds", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                    })
                )[0];
                if (currentGuild) session.send(session.text(".subscribed"));
                else {
                    ctx.database.create("dt_subscribed_guilds", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                    });
                    session.send(session.text(".subscribe_success"));
                }
            }
        });

    ctx.command("unsubscribe")
        .alias("取消订阅")
        .action(async ({ session }) => {
            if (session.guild) {
                let cancelingGuild = (
                    await ctx.database.get("dt_subscribed_guilds", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                    })
                )[0];
                if (cancelingGuild) {
                    ctx.database.remove("dt_subscribed_guilds", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                    });
                    session.send(session.text(".cancel_success"));
                    return;
                }
            } else session.send(session.text(".not_subscribed"));
        });

    ctx.command("bind <steam_id> [nick_name]") //.command("绑定 <steam_id> [nick_name]", "绑定SteamID，并起一个别名（也可以不起）")
        .alias("绑定")
        .action(async ({ session }, steam_id, nick_name) => {
            if (session.guild) {
                // 若无输入数据或steamId不符1~11位数字则返回
                if (!steam_id || !/^\d{1,11}$/.test(steam_id)) {
                    session.send(session.text(".steam_id_invalid"));
                    return;
                }
                // 若在已绑定玩家中找到调用指令用户则返回
                // let sessionPlayer = subscribedPlayers.find((item) => item.guildId == session.event.channel.id && item.platform == session.event.platform && item.userId == session.event.user.id);
                let sessionPlayer = (
                    await ctx.database.get("dt_subscribed_players", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                        userId: session.event.user.id,
                    })
                )[0];
                if (sessionPlayer) {
                    session.send(session.text(".already_binded", sessionPlayer));
                    return;
                }
                // 此处执行玩家验证函数，调用API查询玩家比赛数据，若SteamID无效或无场次都将返回
                let verifyRes = await utils.playerisValid(steam_id);
                if (!verifyRes.isValid) {
                    session.send(session.text(`.bind_failed`, verifyRes));
                    return;
                }
                if (!/^(?:.{1,20})?$/.test(nick_name ?? "")) {
                    session.send(session.text(".nick_name_too_long"));
                    return;
                }
                // 以上判定都通过则绑定成功
                session.send(session.text(".bind_success", { userId: session.event.user.id, nickName: nick_name || "", steamId: steam_id }));
                ctx.database.create("dt_subscribed_players", {
                    userId: session.event.user.id,
                    guildId: session.event.channel.id,
                    platform: session.event.platform,
                    steamId: parseInt(steam_id),
                    nickName: nick_name || "",
                });
            }
        });
    ctx.command("取消绑定", "取消绑定你的个人信息").action(async ({ session }) => {
        if (session.guild) {
            // 在已绑定玩家中查找当前玩家
            let sessionPlayer = (
                await ctx.database.get("dt_subscribed_players", {
                    guildId: session.event.channel.id,
                    platform: session.event.platform,
                    userId: session.event.user.id,
                })
            )[0];
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
                let sessionPlayer = (
                    await ctx.database.get("dt_subscribed_players", {
                        guildId: session.event.channel.id,
                        platform: session.event.platform,
                        userId: session.event.user.id,
                    })
                )[0];
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
            const languageTag = await getLanguageTag(session);
            const subscribedPlayers = await ctx.database.get("dt_subscribed_players", {
                guildId: session.event.channel.id,
                platform: session.platform,
            });
            if (!subscribedPlayers.length) {
                session.send("本群尚无绑定玩家。");
                return;
            }
            if (subscribedPlayers.length <= 20) {
                try {
                    let memberList;
                    try {
                        memberList = await session.bot?.getGuildMemberList(session.event.channel.id);
                    } catch (error) {}
                    async function getUsers(subscribedPlayers: any[], memberList: any) {
                        const playerSteamIds: graphql.PlayersInfoWith10MatchesForGuildQueryVariables = {
                            steamAccountIds: subscribedPlayers.map((player) => player.steamId),
                        };
                        const queryResult = await query<graphql.PlayersInfoWith10MatchesForGuildQueryVariables, graphql.PlayersInfoWith10MatchesForGuildQuery>("PlayersInfoWith10MatchesForGuild", playerSteamIds);
                        const playersInfo = queryResult.players;
                        const users = [];
                        for (const subscribedPlayer of subscribedPlayers) {
                            const queryPlayer = playersInfo.find((player) => player.steamAccount.id == subscribedPlayer.steamId);
                            const queryMember = memberList?.data.find((member) => member.user?.id == subscribedPlayer.userId);
                            users.push({
                                ...subscribedPlayer,
                                ...queryPlayer,
                                ...queryMember,
                            });
                        }

                        return users;
                    }

                    // Usage
                    const users = await getUsers(subscribedPlayers, memberList);
                    session.send(await ctx.puppeteer.render(await genImageHTML(users, TemplateType.GuildMember, TemplateType.GuildMember, ctx, languageTag)));
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("查询群友失败。");
                }
            }
            // session.send("开发中，未来此功能会重写。\n" + queryRes.map((item) => `${item.nickName ?? ""}，ID：${item.userId}，SteamID：${item.steamId}`).join("\n"));
        }
    });

    // 查询比赛与查询最近比赛的共用代码块
    async function queryMatchData(matchId: number): Promise<graphql.MatchInfoQuery | null> {
        try {
            // Step 1: 检查本地缓存
            let queryLocal = await ctx.cache.get("dt_previous_query_results", String(matchId));
            let matchQuery: graphql.MatchInfoQuery;
            if (queryLocal) {
                matchQuery = queryLocal;
                // 更新缓存时间
                ctx.cache.set("dt_previous_query_results", String(matchQuery.match.id), queryLocal, days_30);
            } else {
                // Step 2: 从 GraphQL 查询比赛数据
                matchQuery = await query<graphql.MatchInfoQueryVariables, graphql.MatchInfoQuery>("MatchInfo", { matchId });
                // 如果比赛已解析，写入缓存
                if (matchQuery.match?.parsedDateTime && matchQuery.match.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0)
                    ctx.cache.set("dt_previous_query_results", String(matchQuery.match.id), matchQuery, days_30);
            }
            return matchQuery;
        } catch (error) {
            // 查询失败时删除缓存
            await ctx.cache.delete("dt_previous_query_results", String(matchId));
            throw new Error("比赛数据查询阶段出错：", { cause: error });
        }
    }

    async function formatMatchData(matchQuery: graphql.MatchInfoQuery, languageTag: string): Promise<utils.MatchInfoEx> {
        try {
            // Step 3: 检查Constants缓存
            let constantsQuery: graphql.ConstantsQuery = await ctx.cache.get("dt_facets_constants", languageTag);
            // 如果缓存不存在，或缓存的版本与当前版本不一致，则重新查询并更新缓存
            if (
                !constantsQuery || // 缓存中没有 constants
                !matchQuery.constants.gameVersions?.[0]?.id || // 当前版本信息无效
                !constantsQuery.constants.gameVersions?.[0]?.id || // 缓存版本信息无效
                matchQuery.constants.gameVersions[0].id !== constantsQuery.constants.gameVersions[0].id // 当前版本与缓存版本不匹配
            )
                constantsQuery = await query<graphql.ConstantsQueryVariables, graphql.ConstantsQuery>("Constants", { language: GraphqlLanguageEnum[languageTag] });
            ctx.cache.set("dt_facets_constants", languageTag, constantsQuery, days_30);
            // Step 4: 扩展比赛数据
            const match = utils.getFormattedMatchData(matchQuery, constantsQuery);
            return match;
        } catch (error) {
            // 查询失败时删除缓存
            await ctx.cache.delete("dt_previous_query_results", String(matchQuery.match.id));
            throw new Error("比赛数据扩展阶段出错：", { cause: error });
        }
    }

    async function generateMatchMessage(match: utils.MatchInfoEx, languageTag: string, guild: PendingMatchGuild): Promise<string> {
        let broadMatchMessage: string = "";
        let idsToFind = guild.players.map((player) => player.steamId);
        let broadPlayers = match.players.filter((item) => idsToFind.includes(item.steamAccountId));
        for (let player of broadPlayers) {
            const random = new Random(() => enhancedSimpleHashToSeed(`${match.id}-${player.steamAccountId}-${player.playerSlot}`));
            let comment: string;
            if (player.isRadiant == match.didRadiantWin) {
                if (player.deathContribution < 0.2 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.5 || player.towerDamage > 10000 || player.imp > 0)
                    comment = random.pick(customConvertArrayOfString($t(languageTag, "dota2tracker.broadcast.WIN_POSITIVE")));
                else comment = random.pick(customConvertArrayOfString($t(languageTag, "dota2tracker.broadcast.WIN_NEGATIVE")));
            } else {
                if (player.deathContribution < 0.25 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.0 || player.towerDamage > 5000 || player.imp > 0)
                    comment = random.pick(customConvertArrayOfString($t(languageTag, "dota2tracker.broadcast.LOSE_NEGATIVE")));
                else comment = random.pick(customConvertArrayOfString($t(languageTag, "dota2tracker.broadcast.LOSE_NEGATIVE")));
            }
            let broadPlayerMessage = $t(languageTag, "dota2tracker.broadcast.message", {
                name: player.steamAccount.name,
                hero_name: random.pick(getHeroNicknames(player.hero.id, languageTag) as string[]),
                comment,
                kda: `${((player.kills + player.assists) / (player.deaths || 1)).toFixed(2)} [${player.kills}/${player.deaths}/${player.assists}]`,
                GPM_XPM: `${player.goldPerMinute}/${player.experiencePerMinute}`,
                lh_dn: `${player.numLastHits}/${player.numDenies}`,
                damage: `${player.heroDamage}/${player.towerDamage}`,
                kc_dc: `${(player.killContribution * 100).toFixed(2)}%/${(player.deathContribution * 100).toFixed(2)}%`,
            });
            broadMatchMessage += broadPlayerMessage + "\n";
        }
        return broadMatchMessage;
    }
    async function generateMatchImage(match: utils.MatchInfoEx, languageTag: string): Promise<string> {
        const imageHTML = await genImageHTML(match, ctx.config.template_match, TemplateType.Match, ctx, languageTag);
        return await ctx.puppeteer.render(imageHTML);
    }

    ctx.command("查询比赛 <match_id>", "查询比赛ID")
        .alias("querymatch")
        .usage("查询指定比赛ID的比赛数据，生成图片发布。")
        .example("查询比赛 1234567890")
        .action(async ({ session }, match_id) => {
            if (!match_id) {
                session.send("请输入比赛ID。");
                return;
            }
            if (!/^\d{1,11}$/.test(match_id)) {
                session.send("比赛ID无效。");
                return;
            }

            await session.send("正在搜索对局详情，请稍后...");

            try {
                const languageTag = await getLanguageTag(session);
                const matchQuery = await queryMatchData(Number(match_id));
                const match = await formatMatchData(matchQuery, languageTag);
                const image = await generateMatchImage(match, languageTag);
                session.send((ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + image);
            } catch (error) {
                session.send("获取比赛信息失败。");
                ctx.logger.error(error);
            }
        });

    ctx.command("查询最近比赛 [input_data]", "查询玩家的最近比赛")
        .usage("查询指定玩家的最近一场比赛的比赛数据，生成图片发布。\n参数可输入该玩家的SteamID或已在本群绑定玩家的别名，无参数时尝试查询调用指令玩家的SteamID")
        .example("查询最近比赛 123456789")
        .example("查询最近比赛 张三")
        .action(async ({ session }, input_data) => {
            if (session.guild || (!session.guild && input_data)) {
                let sessionPlayer;
                if (!input_data) {
                    sessionPlayer = (
                        await ctx.database.get("dt_subscribed_players", {
                            guildId: session.event.channel.id,
                            platform: session.event.platform,
                            userId: session.event.user.id,
                        })
                    )[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer =
                    sessionPlayer ||
                    (
                        await ctx.database.get("dt_subscribed_players", {
                            guildId: session.event.channel.id,
                            platform: session.event.platform,
                            nickName: input_data,
                        })
                    )[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }

                let lastMatchId = 0;
                try {
                    session.send("正在搜索对局详情，请稍后...");
                    lastMatchId = (
                        await query<graphql.PlayersLastmatchRankinfoQueryVariables, graphql.PlayersLastmatchRankinfoQuery>("PlayersLastmatchRankinfo", {
                            steamAccountIds: [parseInt(flagBindedPlayer?.steamId ?? input_data)],
                        })
                    ).players[0].matches[0].id;
                } catch (error) {
                    session.send("获取玩家最近比赛失败。");
                    ctx.logger.error(error);
                    return;
                }
                const languageTag = await getLanguageTag(session);
                const matchQuery = await queryMatchData(lastMatchId);
                const match = await formatMatchData(matchQuery, languageTag);
                const image = await generateMatchImage(match, languageTag);
                session.send((ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + image);
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
                const languageTag = await getLanguageTag(session);
                if (!input_data) {
                    sessionPlayer = (
                        await ctx.database.get("dt_subscribed_players", {
                            guildId: session.event.channel.id,
                            platform: session.event.platform,
                            userId: session.event.user.id,
                        })
                    )[0];
                    if (!sessionPlayer) {
                        session.send("无参数时默认从已绑定SteamID玩家中寻找你的信息，但你似乎并没有绑定。\n请在本群绑定SteamID。（可输入【-绑定 -h】获取帮助）\n或在指令后跟上希望查询的SteamID或已绑定玩家的别名。");
                        return;
                    }
                }

                let flagBindedPlayer =
                    sessionPlayer ||
                    (
                        await ctx.database.get("dt_subscribed_players", {
                            guildId: session.event.channel.id,
                            platform: session.event.platform,
                            nickName: input_data,
                        })
                    )[0];

                if (!(flagBindedPlayer || /^\d{1,11}$/.test(input_data))) {
                    session.send("SteamID不合法并且未在本群找到此玩家。");
                    return;
                }
                session.send("正在获取玩家数据，请稍后...");
                // let steamId = flagBindedPlayer ? flagBindedPlayer.steamId : input_data;
                let heroId = findingHero(options.hero);
                let steamId = flagBindedPlayer?.steamId ?? input_data;
                let player;
                try {
                    player = (
                        await query<graphql.PlayerInfoWith25MatchesQueryVariables, graphql.PlayerInfoWith25MatchesQuery>("PlayerInfoWith25Matches", {
                            steamAccountId: steamId,
                            heroIds: heroId,
                        })
                    ).player;
                    let playerExtra = (
                        await utils.query<graphql.PlayerExtraInfoQueryVariables, graphql.PlayerExtraInfoQuery>("PlayerExtraInfo", {
                            steamAccountId: steamId,
                            matchCount: player.matchCount,
                            totalHeroCount: Object.keys(dotaconstants.heroes).length,
                            heroIds: heroId,
                        })
                    ).player;
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

                    if (heroId) {
                        const { matchCount, winCount, imp } = player.heroesPerformanceTop10[0];
                        player.matchCount = matchCount;
                        player.winCount = winCount;
                        player.performance.imp = imp;
                        player.dotaPlus = player.dotaPlus.filter((dpHero) => dpHero.heroId == heroId);
                        player.genHero = {
                            name: constantLocales[languageTag].dota2tracker.template.hero_names[heroId],
                        };
                    }
                    session.send(
                        (ctx.config.urlInMessageType.some((type) => type == "player") ? "https://stratz.com/players/" + player.steamAccount.id : "") +
                            (await ctx.puppeteer.render(await genImageHTML(player, config.template_player, TemplateType.Player, ctx, languageTag)))
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
            const languageTag = await getLanguageTag(session);
            if (options.random) input_data = random.pick(Object.keys(dotaconstants.heroes));
            if (input_data) {
                let heroId = findingHero(input_data);
                if (!heroId) {
                    session.send("未找到输入的英雄，请确认后重新输入。");
                    return;
                }
                await session.send("正在获取英雄数据，请稍后...");
                try {
                    let hero = await utils.queryHeroFromValve(heroId, languageTag);
                    // 处理命石新增的技能
                    hero.facet_abilities.forEach((fa, i) => {
                        if (fa.abilities.length) {
                            fa.abilities.forEach((ab) => {
                                if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
                                if ((hero.facets[i] as any).description_loc !== ab.desc_loc)
                                    (hero.facets[i] as any).abilities.push({
                                        id: ab.id,
                                        name: ab.name,
                                        name_loc: ab.name_loc,
                                        description_ability_loc: utils.formatHeroDesc(ab.desc_loc, ab.special_values, HeroDescType.Facet),
                                    });
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
                                (hero.facets[i] as any).abilities.push({
                                    id: ab.id,
                                    name: ab.name,
                                    name_loc: ab.name_loc,
                                    description_ability_loc: utils.formatHeroDesc(facet, ab.special_values, HeroDescType.Facet),
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
                    await session.send(
                        (ctx.config.urlInMessageType.some((type) => type == "hero") ? `https://wiki.dota2.com.cn/hero/${hero["name"].match(/^npc_dota_hero_(.+)$/)[1]}.html` : "") +
                            (await ctx.puppeteer.render(await genImageHTML(hero, config.template_hero, TemplateType.Hero, ctx, languageTag)))
                    );
                } catch (error) {
                    ctx.logger.error(error);
                    session.send("获取数据失败");
                }
            } else {
                session.send("请输入参数。");
            }
        });

    // ctx.command("查询英雄对战 <input_data:string>", "查询英雄近一周的最佳搭档与最佳克星英雄")
    //     .usage("根据输入英雄查询最近一周比赛数据（传奇~万古分段）中与该英雄组合胜率最高英雄和与该英雄对抗胜率最低英雄。\n参数可输入英雄ID、英雄名、英雄常用别名")
    //     .option("limit", "-l <value:number> 返回英雄个数（默认值 5）", {
    //         fallback: 5,
    //     })
    //     .option("filter", "-f <value:number> 过滤场数过低的组合（单位：%，默认值0.75）", { fallback: 0.5 })
    //     .example("查询英雄对战 敌法师\t（无额外参数默认返回5个英雄，过滤舍弃场次占比0.75%以下）")
    //     .example("查询英雄对战 敌法师 -l=10 -f=1\t（返回10个英雄，过滤舍弃场次占比1%以下）")
    //     .example("查询英雄对战 敌法师 -l 10 -f 1\t（等同于上例，参数接空格也可使用）")
    //     .action(async ({ session, options }, input_data) => {
    //         if (input_data) {
    //             const languageTag = await getLanguageTag(session);
    //             let heroId = findingHero(input_data);
    //             if (!heroId) {
    //                 session.send("未找到输入的英雄，请确认后重新输入。");
    //                 return;
    //             }
    //             try {
    //                 let heroStats = (
    //                     await query<graphql.HeroMatchupWinrateQueryVariables, graphql.HeroMatchupWinrateQuery>("HeroMatchupWinrate", {
    //                         heroId: heroId,
    //                         take: Object.keys(dotaconstants.heroes).length - 1,
    //                     })
    //                 ).heroStats;
    //                 let withTopFive = heroStats.matchUp[0].with
    //                     .filter((item) => item.matchCount / heroStats.matchUp[0].matchCountWith > Math.max(0, Math.min(5, options.filter)) / 100)
    //                     .map((item) => {
    //                         const winRate = item.winCount / item.matchCount;
    //                         return {
    //                             ...item,
    //                             winRate: winRate.toFixed(3),
    //                         } as any;
    //                     })
    //                     .sort((a, b) => b.winRate - a.winRate)
    //                     .slice(0, Math.max(1, Math.min(Object.keys(dotaconstants.heroes).length - 1, options.limit)));
    //                 let vsBottomFive = heroStats.matchUp[0].vs
    //                     .filter((item) => item.matchCount / heroStats.matchUp[0].matchCountVs > Math.max(0, Math.min(5, options.filter)) / 100)
    //                     .map((item) => {
    //                         const winRate = item.winCount / item.matchCount;
    //                         return {
    //                             ...item,
    //                             winRate: winRate.toFixed(3),
    //                         } as any;
    //                     })
    //                     .sort((a, b) => a.winRate - b.winRate)
    //                     .slice(0, Math.max(1, Math.min(Object.keys(dotaconstants.heroes).length - 1, options.limit)));
    //                 session.send(
    //                     `你查询的英雄是${d2a.HEROES_NAMES[heroStats.matchUp[0].heroId][0]}（ID：${heroStats.matchUp[0].heroId}），\n以下是7天内传奇-万古分段比赛数据总结而来的搭档与克制关系\n最佳搭档（组合胜率前${
    //                         options.limit
    //                     }）：${withTopFive.map((item) => `${d2a.HEROES_NAMES[languageTag][item.heroId2][0]}(胜率${(item.winRate * 100).toFixed(1)}%)`).join("、")}\n最佳克星（对抗胜率倒${options.limit}）：${vsBottomFive
    //                         .map((item) => `${d2a.HEROES_NAMES[languageTag][item.heroId2][0]}(胜率${(item.winRate * 100).toFixed(1)}%)`)
    //                         .join("、")}`
    //                 );
    //             } catch (error) {
    //                 ctx.logger.error(error);
    //                 session.send("获取数据失败。");
    //                 return;
    //             }
    //         }
    //     });

    function findingHero(input: string | number): number | undefined {
        // 获取所有英雄的ID
        const heroIds = Object.keys(dotaconstants.heroes).map((id) => parseInt(id));
        // 临时ID，这里用于当别名和正名都找不到时返回
        let tid;
        for (const loc of Object.keys(GraphqlLanguageEnum)) {
            for (const id_nicknames of getHeroNicknames(heroIds, loc) as {
                [key: number]: string[];
            }[]) {
                for (const [id, nicknames] of Object.entries(id_nicknames)) {
                    for (const nickname of nicknames) {
                        if (input == nickname) return Number(id);
                    }
                }
            }
            for (const [id, name] of Object.entries(constantLocales[loc].dota2tracker.template.hero_names)) {
                if (input == name) return Number(id);
                if (input == id) tid = input;
            }
        }
        return tid;
    }

    /**
     * 获取英雄的正名+别名。
     * @param heroIds 英雄ID或英雄ID数组
     * @param languageTag 语言标签，默认使用koishi当前优先级最高的语言（全局配置-i18n.locales）
     * @returns 输入单个ID时直接返回英雄别名列表（string[]）；输入ID数组时返回英雄ID：英雄别名列表（{number:string[]}[]）。
     */
    function getHeroNicknames(heroIds: number | number[], languageTag: string): string[] | { [key: number]: string[] }[] {
        if (heroIds === undefined) return []; // 边界情况：heroIds 为空时返回空数组
        const heroIdArray = Array.isArray(heroIds) ? heroIds : [heroIds];
        const result = [];

        for (const heroId of heroIdArray) {
            let content: string[] = [];

            try {
                // 获取 render 返回的内容，并尝试用 JSON.parse 解析
                const rawContent = ctx.i18n.render([languageTag], [`dota2tracker.heroes_nicknames.${heroId}`], {}).at(0)?.attrs?.content ?? "";

                content = JSON.parse(`[${rawContent}]`);
            } catch (error) {
                // 如果解析失败，记录错误信息，并回退为空数组
                ctx.logger.error(`Failed to parse heroId ${heroId} content: ${error.message}`);
                content = [];
            }

            result.push({
                [heroId]: Array.from(new Set([$t(languageTag, "dota2tracker.template.hero_names." + heroId), ...content])),
            });
        }

        // 如果输入是单个 heroId，返回字符串数组而非对象
        return Array.isArray(heroIds) ? result : result[0][heroIds as number];
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
        ctx.model.extend(
            "dt_subscribed_players",
            {
                id: "unsigned",
                userId: "string",
                guildId: "string",
                platform: "string",
                steamId: "integer",
                nickName: "string",
                rank: "json",
            },
            { autoInc: true }
        );
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
                const players = (
                    await query<graphql.PlayersLastmatchRankinfoQueryVariables, graphql.PlayersLastmatchRankinfoQuery>("PlayersLastmatchRankinfo", {
                        steamAccountIds: subscribedPlayersSteamIds,
                    })
                ).players;
                const lastMatches = players
                    .map((player) => player.matches[0])
                    .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)) // 根据match.id去重
                    .filter((match) => moment.unix(match.startDateTime).isAfter(moment().subtract(1, "days"))) // 排除1天以前的比赛，防止弃坑数年群友绑定时突然翻出上古战报
                    .filter((match) => !pendingMatches.some((pendingMatch) => pendingMatch.matchId == match.id)); // 判断是否已加入待发布列表
                // 在发布过的比赛id中查找以上比赛
                const sendedMatchesIds: number[] = [];
                for await (const sendedMatchesId of ctx.cache.keys("dt_sended_match_id")) {
                    sendedMatchesIds.push(Number(sendedMatchesId));
                }
                // 遍历去重后的match
                await Promise.all(
                    lastMatches
                        // 过滤出未发布过的比赛
                        .filter((match) => !sendedMatchesIds.includes(match.id))
                        .map(async (match) => {
                            const tempGuildsByLanguage: Record<
                                string,
                                Array<{
                                    guildId: string;
                                    platform: string;
                                    players: Array<utils.dt_subscribed_players>;
                                }>
                            > = {};

                            // 用 for...of 代替 forEach 以支持异步处理
                            for (const player of match.players) {
                                const subscribedPlayers = subscribedPlayersInGuild.filter((subscribedPlayer) => subscribedPlayer.steamId === player.steamAccount.id);

                                // 对 subscribedPlayers 使用 Promise.all 来保证所有异步逻辑完成
                                await Promise.all(
                                    subscribedPlayers.map(async (subscribedPlayer) => {
                                        if (subscribedPlayer) {
                                            const languageTag = await getLanguageTag(undefined, undefined, subscribedPlayer.guildId);

                                            if (!tempGuildsByLanguage[languageTag]) {
                                                tempGuildsByLanguage[languageTag] = [];
                                            }

                                            const tempGuild = tempGuildsByLanguage[languageTag].find((guild) => guild.guildId === subscribedPlayer.guildId && guild.platform === subscribedPlayer.platform);

                                            if (tempGuild) {
                                                tempGuild.players.push(subscribedPlayer);
                                            } else {
                                                tempGuildsByLanguage[languageTag].push({
                                                    guildId: subscribedPlayer.guildId,
                                                    platform: subscribedPlayer.platform,
                                                    players: [subscribedPlayer],
                                                });
                                            }
                                        }
                                    })
                                );
                            }

                            pendingMatches.push({
                                matchId: match.id,
                                guilds: tempGuildsByLanguage,
                                queryTime: new Date(),
                            });

                            Object.entries(tempGuildsByLanguage).forEach(([languageTag, guilds]) => {
                                ctx.logger.info(
                                    guilds
                                        .map(
                                            (guild) =>
                                                `追踪到来自语言 ${languageTag} 群组 ${guild.platform}:${guild.guildId} 的用户 ${guild.players
                                                    .map((player) => `[${player.nickName ?? ""}(${player.steamId})]`)
                                                    .join("、")} 的尚未播报过的最新比赛 ${match.id}。`
                                        )
                                        .join("")
                                );
                            });

                            if (!match.parsedDateTime) {
                                query<graphql.RequestMatchDataAnalysisQueryVariables, graphql.RequestMatchDataAnalysisQuery>("RequestMatchDataAnalysis", {
                                    matchId: match.id,
                                }).then((response) => ctx.logger.info(`比赛 ${match.id} 的` + (response.stratz.matchRetry ? "解析请求已成功发送至STRATZ服务器。" : "解析请求发送失败。")));
                            }
                        })
                );

                // 段位变动播报
                // 创建 steamId 到 rank 的哈希表
                const rankMap = players.reduce((map, player) => {
                    map[player.steamAccount.id] = {
                        rank: player.steamAccount.seasonRank,
                        leader: player.steamAccount.seasonLeaderboardRank,
                    };
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
                                    const languageTag = await getLanguageTag(undefined, undefined, subPlayer.guildId);
                                    if (config.rankBroadFun === true) {
                                        // 整活播报
                                        const img = await ctx.puppeteer.render(
                                            await genImageHTML(
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
                                                TemplateType.Rank,
                                                ctx,
                                                languageTag
                                            )
                                        );
                                        await ctx.broadcast([`${subPlayer.platform}:${subPlayer.guildId}`], img);
                                    } else {
                                        // 常规播报
                                        const message = `群友 ${name} 段位变动：${$t(languageTag, "dota2tracker.template.ranks." + prevRank.medal)}${prevRank.star} → ${$t(languageTag, "dota2tracker.template.ranks." + currRank.medal)}${
                                            currRank.star
                                        } `;
                                        const img = await ctx.puppeteer.render(await genImageHTML(currRank, "rank" + (config.rankBroadFun ? "2" : ""), TemplateType.Rank, ctx, languageTag));
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
                const now: Moment = moment();
                const pendingMatch: PendingMatch = pendingMatches[(now.hours() * 60 + now.minutes()) % pendingMatches.length];
                try {
                    let matchQuery: graphql.MatchInfoQuery = await queryMatchData(pendingMatch.matchId);
                    if (
                        (matchQuery.match.parsedDateTime && matchQuery.match.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0) ||
                        moment.unix(matchQuery.match.endDateTime).isBefore(now.subtract(config.dataParsingTimeoutMinutes, "minutes"))
                    ) {
                        for (const languageTag of Object.keys(pendingMatch.guilds)) {
                            let match: utils.MatchInfoEx = await formatMatchData(matchQuery, languageTag);
                            const img: string = await generateMatchImage(match, languageTag);
                            for (let commingGuild of pendingMatch.guilds[languageTag]) {
                                let broadMatchMessage: string = await generateMatchMessage(match, languageTag, commingGuild);
                                await ctx.broadcast(
                                    [`${commingGuild.platform}:${commingGuild.guildId}`],
                                    broadMatchMessage + (ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + img
                                );
                                ctx.logger.info(`比赛 ${match.id} ${match.parsedDateTime ? "已解析，" : "已结束超过1小时仍未被解析，放弃等待解析直接"}生成图片并发布于${commingGuild.platform}:${commingGuild.guildId}。`);
                            }
                        }
                        ctx.cache.set("dt_sended_match_id", String(pendingMatch.matchId), undefined, days_30);
                        pendingMatches = pendingMatches.filter((item) => item.matchId != pendingMatch.matchId);
                    } else ctx.logger.info("比赛 %d 尚未解析完成，继续等待。", matchQuery.match.id);
                } catch (error) {
                    ctx.logger.error(error);
                    await ctx.cache.delete("dt_previous_query_results", String(pendingMatch.matchId));
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
            await query<graphql.PlayersMatchesForDailyQueryVariables, graphql.PlayersMatchesForDailyQuery>("PlayersMatchesForDaily", {
                steamAccountIds: subscribedPlayersInGuild.map((player) => player.steamId).filter((value, index, self) => self.indexOf(value) === index),
                seconds: timeAgo,
            })
        ).players.filter((player) => player.matches.length > 0);
        // 对比赛信息去重处理，确保每场比赛唯一
        const matches = players
            .map((player) => player.matches.map((match) => match))
            .flat()
            .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
        // 遍历每位订阅玩家，计算相关统计信息并更新
        for (let subPlayer of subscribedPlayersInGuild) {
            let player: NonNullable<graphql.PlayersMatchesForDailyQuery["players"]>[number] & {
                winCount?: number;
                loseCount?: number;
                avgKills?: number;
                avgDeaths?: number;
                avgAssists?: number;
                avgKDA?: number;
                avgImp?: number;
            } = players.find((player) => subPlayer.steamId == player.steamAccount.id);
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
                            await genImageHTML(
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
                                TemplateType.Report,
                                ctx,
                                await getLanguageTag(undefined, undefined, guild.guildId)
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
    function $t(languageTag: string, key: string | string[], param?: string[] | Record<string, string> | string | object): string {
        // 如果 key 是点分隔字符串，将其拆分为数组以支持常量词典
        const keys = Array.isArray(key) ? key : key.split(".");
        const params = Array.isArray(param) ? param : [param];

        // 1. 优先在常量词典中查找翻译
        const constantTranslation = keys.reduce((result, k) => {
            return result?.[k] ?? null;
        }, constantLocales[languageTag] || {});

        if (constantTranslation) {
            // 如果找到常量翻译，替换占位符并返回
            if (Array.isArray(params)) {
                // 替换数字占位符 {0}, {1}, ...
                return constantTranslation.replace(/\{(\d+)\}/g, (_, index) => params[+index] || "");
            }
            if (typeof params === "object" && params !== null) {
                // 替换命名占位符 {name}, {value}, ...
                return constantTranslation.replace(/\{(\w+)\}/g, (_, key) => params[key] || "");
            }
            return constantTranslation;
        }
        // 2. 如果常量词典未命中，直接将原始 key 传递给 ctx.i18n（保持原有格式）
        const originalKey = Array.isArray(key) ? key : [key]; // 这里保持 ctx.i18n 的参数语义
        const result =
            ctx.i18n
                .render([languageTag], originalKey, (param as any) ?? {})
                .map((element) => element?.attrs?.content)
                .join("") ?? "";
        if (result == key) return;
        return result;
    }
    async function genImageHTML(data, template, type: TemplateType, ctx: Context, languageTag) {
        const templatePath = path.join(`./node_modules/@sjtdev/koishi-plugin-${name}/template/${type}`, template + ".ejs");
        const templateData = {
            data: data,
            utils: utils,
            ImageType: ImageType,
            ImageFormat: utils.ImageFormat,
            dotaconstants: dotaconstants,
            moment: moment,
            eh: escapeHTML,
            $t: templateI18nHelper,
            languageTag: languageTag,
        };

        function templateI18nHelper(key: string[] | string, param?: string[] | string | object): string {
            return $t(languageTag, key, param);
        }

        try {
            const html = await ejs.renderFile(templatePath, templateData, {
                strict: false,
            });
            if (process.env.NODE_ENV === "development") fs.writeFileSync("./node_modules/@sjtdev/koishi-plugin-dota2tracker/temp.html", html);
            return html;
        } catch (err) {
            ctx.logger.error("Error rendering EJS template:", err);
            throw err; // 如果需要，可以返回一个友好的默认 HTML 内容而不是抛出错误
        }
    }
}

enum TemplateType {
    Match = "match",
    Player = "player",
    Hero = "hero",
    GuildMember = "guild_member",
    Report = "report",
    Rank = "rank",
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

function escapeHTML(str) {
    if (str == null) return "";
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
}

function customConvertArrayOfString(str: string): string[] {
    try {
        return JSON.parse(`[${str}]`);
    } catch (error) {
        throw error;
    }
}
