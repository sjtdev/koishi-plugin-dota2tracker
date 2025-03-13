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
export let usage = "";
// export const inject = ["http", "database", "cron", "puppeteer", "cache"]; // 声明依赖
export const inject = {
  required: ["http", "database", "cron", "puppeteer", "cache"],
};
const pluginDir = path.resolve(__dirname, "..");
const pluginVersion = require(path.join(pluginDir, "package.json")).version;

// At the same time, SupportLanguageTags can also be obtained from the Keys of GraphqlLanguageEnum.
// const SupportLanguageTags = Object.keys(GraphqlLanguageEnum);
export enum GraphqlLanguageEnum {
  "en-US" = "ENGLISH",
  "zh-CN" = "S_CHINESE",
}
// 配置项
export interface Config {
  STRATZ_API_TOKEN: string;
  dataParsingTimeoutMinutes: number;
  urlInMessageType: Array<string>;
  proxyAddress: string;
  rankBroadSwitch: boolean;
  rankBroadStar: boolean;
  rankBroadLeader: boolean;
  rankBroadFun: boolean;
  dailyReportSwitch: boolean;
  dailyReportHours: number;
  dailyReportShowCombi: boolean;
  weeklyReportSwitch: boolean;
  weeklyReportDayHours: Array<number>;
  weeklyReportShowCombi: boolean;
  template_match: string;
  template_player: string;
  template_hero: string;
  playerRankEstimate: boolean;
  maxSendItemCount: number;
  showItemListAtTooMuchItems: boolean;
  customItemAlias: { keyword: string; alias: string }[];
}
export const Config: Schema = Schema.intersect([
  Schema.object({
    STRATZ_API_TOKEN: Schema.string().required().role("secret"),
    dataParsingTimeoutMinutes: Schema.number().default(60).min(0).max(1440),
    proxyAddress: Schema.string(),
  }).i18n(Object.keys(GraphqlLanguageEnum).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.base), acc), {})),
  Schema.intersect([
    Schema.object({
      urlInMessageType: Schema.array(Schema.union([Schema.const("match"), Schema.const("player"), Schema.const("hero")])).role("checkbox"),
      maxSendItemCount: Schema.number().default(5).min(1).max(10),
      showItemListAtTooMuchItems: Schema.boolean().default(true),
      customItemAlias: Schema.array(
        Schema.object({
          keyword: Schema.string().required(),
          alias: Schema.string().required(),
        })
      )
        .default([])
        .role("table"),
      rankBroadSwitch: Schema.boolean().default(false),
    }),
    Schema.union([
      Schema.object({
        rankBroadSwitch: Schema.const(true).required(),
        rankBroadStar: Schema.boolean().default(true),
        rankBroadLeader: Schema.boolean().default(true),
        rankBroadFun: Schema.boolean().default(false),
      }),
      Schema.object({}),
    ]),
  ]).i18n(Object.keys(GraphqlLanguageEnum).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.message), acc), {})),
  Schema.intersect([
    Schema.object({
      dailyReportSwitch: Schema.boolean().default(false),
    }),
    Schema.union([
      Schema.object({
        dailyReportSwitch: Schema.const(true).required(),
        dailyReportHours: Schema.number().min(0).max(23).default(6),
        dailyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]),
    Schema.object({
      weeklyReportSwitch: Schema.boolean().default(false),
    }),
    Schema.union([
      Schema.object({
        weeklyReportSwitch: Schema.const(true).required(),
        weeklyReportDayHours: Schema.tuple([Schema.number().min(1).max(7), Schema.number().min(0).max(23)]).default([1, 10]),
        weeklyReportShowCombi: Schema.boolean().default(true),
      }),
      Schema.object({}),
    ]),
  ]).i18n(Object.keys(GraphqlLanguageEnum).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.report), acc), {})),
  Schema.object({
    template_match: Schema.union([...utils.readDirectoryFilesSync(path.join(pluginDir, "template", "match"))]).default("match_1"),
    template_player: Schema.union([...utils.readDirectoryFilesSync(path.join(pluginDir, "template", "player"))]).default("player_1"),
    template_hero: Schema.union([...utils.readDirectoryFilesSync(path.join(pluginDir, "template", "hero"))]).default("hero_1"),
    playerRankEstimate: Schema.boolean().default(true),
  }).i18n(Object.keys(GraphqlLanguageEnum).reduce((acc, cur) => ((acc[cur] = require(`./locales/${cur}.schema.yml`)._config.template), acc), {})),
]);

interface PendingMatch {
  matchId: number;
  guilds: Record<string, Array<PendingMatchGuild>>;
  queryTime: Date;
  hasMessage: boolean;
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

// 不可修改词典
const constantLocales = {};
export async function apply(ctx: Context, config: Config) {
  // write your plugin here
  utils.init({ http: ctx.http, setTimeout: ctx.setTimeout, APIKEY: config.STRATZ_API_TOKEN, proxyAddress: config.proxyAddress });
  for (const supportLanguageTag of Object.keys(GraphqlLanguageEnum)) {
    constantLocales[supportLanguageTag] = require(`./locales/${supportLanguageTag}.constants.json`);
    ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.yml`));
    ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.command.yml`));
    ctx.i18n.define(supportLanguageTag, require(`./locales/${supportLanguageTag}.template.yml`));
  }
  const getLanguageTag = async function (options?: { session?: Session; channel?: Channel; channelId?: string }): Promise<string> {
    const { session, channel, channelId } = options || {};
    // 根据参数获取频道，获取不到则为undefined
    const resolvedChannel: Channel | undefined = channel ?? (await ctx.database.get("channel", { id: session?.event.channel.id ?? channelId }))?.at(0);
    // 根据语言标签列表进行回退，优先级为频道语言>平台语言，随后与已支持语言进行匹配
    return ctx.i18n.fallback((resolvedChannel?.locales ?? []).concat(Object.values(ctx.i18n.locales).map((locale) => Object.keys(locale).at(0)))).find((locale) => Object.keys(GraphqlLanguageEnum).some((language) => locale == language));
  };
  const GlobalLanguageTag = await getLanguageTag();
  usage = $t(GlobalLanguageTag, "dota2tracker.usage");

  ctx
    .command("dota2tracker.subscribe")
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

  ctx
    .command("dota2tracker.unsubscribe")
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
          session.send(session.text(".unsubscribe_success"));
          return;
        }
      } else session.send(session.text(".not_subscribed"));
    });

  ctx
    .command("dota2tracker.bind <steam_id> [nick_name]")
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
          session.send(session.text(`.bind_failed`, [session.text(verifyRes.reason)]));
          return;
        }
        if (!/^(?:.{1,20})?$/.test(nick_name ?? "")) {
          session.send(session.text(".nick_name_too_long"));
          return;
        }
        // 以上判定都通过则绑定成功
        session.send(session.text(".bind_success", { userId: session.event.user.id, nickName: nick_name || "", steamId: steam_id }) + (verifyRes.isAnonymous ? "\n" + session.text(".is_anonymous") : ""));
        ctx.database.create("dt_subscribed_players", {
          userId: session.event.user.id,
          guildId: session.event.channel.id,
          platform: session.event.platform,
          steamId: parseInt(steam_id),
          nickName: nick_name || "",
        });
      }
    });
  ctx
    .command("dota2tracker.unbind")
    .alias("取消绑定")
    .action(async ({ session }) => {
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
          session.send(session.text(".unbind_success"));
        } else session.send(session.text(".not_binded"));
      }
    });

  ctx
    .command("dota2tracker.rename <nick_name>")
    .alias("改名")
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
            session.send(session.text(".emtpy_input"));
            return;
          }
          if (!/^.{1,20}$/.test(nick_name ?? "")) {
            session.send(session.text(".nick_name_too_long"));
            return;
          }
          sessionPlayer.nickName = nick_name;
          await ctx.database.set("dt_subscribed_players", sessionPlayer.id, { nickName: sessionPlayer.nickName });
          session.send(session.text(".rename_success", { nick_name }));
        } else {
          session.send(session.text(".not_binded"));
        }
      }
    });

  ctx
    .command("dota2tracker.query-members")
    .alias("查询群友")
    .action(async ({ session }) => {
      if (session.guild) {
        const languageTag = await getLanguageTag({ session });
        const subscribedPlayers = await ctx.database.get("dt_subscribed_players", {
          guildId: session.event.channel.id,
          platform: session.platform,
        });
        if (!subscribedPlayers.length) {
          session.send(session.text(".no_members"));
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
            session.send(session.text(".query_failed"));
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
      if (queryLocal?.data && queryLocal.pluginVersion == pluginVersion) {
        matchQuery = queryLocal.data;
        // 更新缓存时间
        ctx.cache.set("dt_previous_query_results", String(matchQuery.match.id), queryLocal, days_30);
      } else {
        // Step 2: 从 GraphQL 查询比赛数据
        matchQuery = await query<graphql.MatchInfoQueryVariables, graphql.MatchInfoQuery>("MatchInfo", { matchId });
        // 如果比赛已解析，写入缓存
        if (matchQuery.match?.parsedDateTime && matchQuery.match.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0)
          ctx.cache.set("dt_previous_query_results", String(matchQuery.match.id), { data: matchQuery, pluginVersion }, days_30);
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
      const random = new Random(() => utils.enhancedSimpleHashToSeed(`${match.id}-${player.steamAccountId}-${player.playerSlot}`));
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
        gpm_xpm: `${player.goldPerMinute}/${player.experiencePerMinute}`,
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

  ctx
    .command("dota2tracker.query-match <match_id>")
    .alias("查询比赛")
    .option("parse", "-p")
    .action(async ({ session, options }, match_id) => {
      if (!match_id) {
        session.send(session.text(".empty_input"));
        return;
      }
      if (!/^\d{1,11}$/.test(match_id)) {
        session.send(session.text(".match_id_invalid"));
        return;
      }

      if (!session.argv?.source.startsWith("dota2tracker.query-recent-match")) await session.send(session.text("commands.dota2tracker.query-match.messages.querying_match"));

      try {
        const languageTag = await getLanguageTag({ session });
        const matchQuery = await queryMatchData(Number(match_id));
        if ((matchQuery.match.parsedDateTime && matchQuery.match.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0) || !options.parse) {
          const match = await formatMatchData(matchQuery, languageTag);
          const image = await generateMatchImage(match, languageTag);
          session.send((ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + image);
        } else {
          session.send(session.text("commands.dota2tracker.query-match.messages.waiting_for_parse"));
          pendingMatches.push({
            matchId: matchQuery.match.id,
            guilds: { [languageTag]: [{ guildId: session.event.channel.id, platform: session.event.platform, players: [] }] },
            queryTime: new Date(),
            hasMessage: true,
          });
          query<graphql.RequestMatchDataAnalysisQueryVariables, graphql.RequestMatchDataAnalysisQuery>("RequestMatchDataAnalysis", {
            matchId: matchQuery.match.id,
          }).then((response) => ctx.logger.info($t(GlobalLanguageTag, `dota2tracker.logger.parse_request_${response.stratz.matchRetry ? "sent" : "failed"}`, { matchId: matchQuery.match.id })));
        }
      } catch (error) {
        session.send(session.text("commands.dota2tracker.query-match.messages.query_failed"));
        ctx.logger.error(error);
      }
    });

  ctx
    .command("dota2tracker.query-recent-match [input_data]")
    .alias("查询最近比赛")
    .option("parse", "-p")
    .action(async ({ session, options }, input_data) => {
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
            session.send(session.text(".not_binded"));
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
          session.send(session.text(".steam_id_invalid"));
          return;
        }

        let lastMatchId = 0;
        try {
          await session.send(session.text(".querying_match"));
          const lastMatchQuery = await query<graphql.PlayersLastmatchRankinfoQueryVariables, graphql.PlayersLastmatchRankinfoQuery>("PlayersLastmatchRankinfo", {
            steamAccountIds: [parseInt(flagBindedPlayer?.steamId ?? input_data)],
          });
          if (lastMatchQuery.players[0].steamAccount.isAnonymous) {
            await session.send(session.text(".is_anonymous"));
            return;
          }
          lastMatchId = lastMatchQuery.players[0].matches[0]?.id;
        } catch (error) {
          session.send(session.text(".query_failed"));
          ctx.logger.error(error);
          return;
        }
        // 直接执行查询比赛指令传入lastMatchId，取代原有的重复查询比赛数据的代码
        session.execute(`dota2tracker.query-match ${lastMatchId}${options.parse ? " -p" : ""}`);
      } else {
        session.send(session.text(".not_in_group"));
      }
    });

  ctx
    .command("dota2tracker.query-player <input_data>")
    .option("hero", "-o <value:string>")
    .alias("查询玩家")
    .action(async ({ session, options }, input_data) => {
      if (session.guild || (!session.guild && input_data)) {
        let sessionPlayer;
        const languageTag = await getLanguageTag({ session });
        if (!input_data) {
          sessionPlayer = (
            await ctx.database.get("dt_subscribed_players", {
              guildId: session.event.channel.id,
              platform: session.event.platform,
              userId: session.event.user.id,
            })
          )[0];
          if (!sessionPlayer) {
            session.send(session.text(".not_binded"));
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
          session.send(session.text(".steam_id_invalid"));
          return;
        }
        session.send(session.text(".querying_player"));
        // let steamId = flagBindedPlayer ? flagBindedPlayer.steamId : input_data;
        let heroId = findingHero(options.hero);
        // let player;
        try {
          let steamId = Number(flagBindedPlayer?.steamId ?? input_data);
          const playerQuery = await query<graphql.PlayerInfoWith25MatchesQueryVariables, graphql.PlayerInfoWith25MatchesQuery>("PlayerInfoWith25Matches", {
            steamAccountId: steamId,
            heroIds: heroId,
          });

          const playerExtraQuery = !playerQuery.player.steamAccount.isAnonymous
            ? await utils.query<graphql.PlayerExtraInfoQueryVariables, graphql.PlayerExtraInfoQuery>("PlayerExtraInfo", {
                steamAccountId: steamId,
                matchCount: playerQuery.player.matchCount,
                totalHeroCount: Object.keys(dotaconstants.heroes).length,
                heroIds: heroId,
              })
            : {
                player: {
                  heroesPerformance: [],
                  dotaPlus: null,
                },
              };
          const player = utils.getFormattedPlayerData({
            playerQuery,
            playerExtraQuery,
            genHero: heroId ? { heroId, name: constantLocales[languageTag].dota2tracker.template.hero_names[heroId] } : null,
            estimateRank: config.playerRankEstimate,
          });
          session.send(
            (ctx.config.urlInMessageType.some((type) => type == "player") ? "https://stratz.com/players/" + player.steamAccount.id : "") +
              (await ctx.puppeteer.render(await genImageHTML(player, config.template_player, TemplateType.Player, ctx, languageTag)))
          );
        } catch (error) {
          ctx.logger.error(error);
          session.send(session.text(".query_failed"));
        }
      } else {
        session.send(session.text(".not_in_group"));
      }
    });

  ctx
    .command("dota2tracker.query-hero <input_data>")
    .option("random", "-r")
    .alias("查询英雄")
    .action(async ({ session, options }, input_data) => {
      const languageTag = await getLanguageTag({ session });
      if (options.random) input_data = random.pick(Object.keys(dotaconstants.heroes));
      if (input_data) {
        let heroId = findingHero(input_data);
        if (!heroId) {
          session.send(session.text(".not_found"));
          return;
        }
        await session.send(session.text(".querying_hero"));
        try {
          let hero = await utils.queryHeroDetailsFromValve(heroId, languageTag);
          // 处理命石新增的技能
          hero = utils.getFormattedHeroData(hero);
          await session.send(
            (ctx.config.urlInMessageType.some((type) => type == "hero") ? `https://wiki.dota2.com.cn/hero/${hero["name"].match(/^npc_dota_hero_(.+)$/)[1]}.html` : "") +
              (await ctx.puppeteer.render(await genImageHTML(hero, config.template_hero, TemplateType.Hero, ctx, languageTag)))
          );
        } catch (error) {
          ctx.logger.error(error);
          session.send(session.text(".query_failed"));
        }
      } else {
        session.send(session.text(".empty_input"));
      }
    });

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

  ctx
    .command("dota2tracker.query-item")
    .alias("查询物品")
    .action(async ({ session }, input_data) => {
      if (!input_data && !config.showItemListAtTooMuchItems) {
        await session.send(session.text(".empty_input"));
        return;
      }
      await session.send(session.text(".querying_item"));
      const languageTag = await getLanguageTag({ session });
      const currentGameVersion = await utils.queryLastPatchNumber();
      // Step 1: 读取物品列表缓存
      let itemList: utils.ItemList;
      const cache = await ctx.cache.get("dt_itemlist_constants", languageTag);
      try {
        // Step 1.1: 检测缓存状态，判断是否需要重新获取
        if (!cache || cache.gameVersion != currentGameVersion) {
          await session.send(session.text(".cache_building"));
          itemList = await utils.getFormattedItemListData(await utils.queryItemListFromValve(languageTag));
          await ctx.cache.set("dt_itemlist_constants", languageTag, {
            gameVersion: currentGameVersion,
            itemList,
          });
        } else {
          itemList = cache.itemList;
        }
      } catch (error) {
        ctx.logger.error(error);
        await session.send(session.text(".query_list_failed"));
        return;
      }
      // Step 2: 根据输入参数作为关键词搜索物品
      const matchedItemList: utils.ItemList = searchItems(itemList, input_data, languageTag);
      if (!input_data || matchedItemList.length > config.maxSendItemCount || !matchedItemList.length) {
        if (!input_data) await session.send(session.text(".empty_input", { show: config.showItemListAtTooMuchItems }));
        if (matchedItemList.length > config.maxSendItemCount) await session.send(session.text(".too_many_items", { count: matchedItemList.length, max: config.maxSendItemCount, show: config.showItemListAtTooMuchItems }));
        if (input_data && matchedItemList.length === 0) await session.send(session.text(".not_found"));
        if (config.showItemListAtTooMuchItems && (matchedItemList.length || !input_data))
          await session.send(await ctx.puppeteer.render(await genImageHTML(matchedItemList.length ? matchedItemList : itemList, "itemlist", TemplateType.Item, ctx, languageTag)));
      } else {
        await session.send(session.text(".finded_items", { items: matchedItemList }));
        for (const litem of matchedItemList) {
          try {
            const item = Object.assign(await utils.queryItemDetailsFromValve(litem.id, languageTag), litem);
            await session.send(await ctx.puppeteer.render(await genImageHTML(item, "item", TemplateType.Item, ctx, languageTag)));
          } catch (error) {
            ctx.logger.error(error);
            await session.send(session.text(".query_item_failed", [litem.name_loc]));
          }
        }
      }
    });

  function searchItems(items: utils.ItemList, keyword: string, languageTag: string): utils.ItemList {
    if (!keyword) return [];
    const alias = constantLocales[languageTag].dota2tracker.items_alias?.[keyword] ?? config.customItemAlias.filter((cia) => cia.alias == keyword).map((cia) => cia.keyword);
    // 优先检查完全匹配项（不区分大小写和前后空格）
    const exactMatch = items.filter(
      (item) => alias?.some((a) => item.name_loc.trim().toLowerCase() == a.toLowerCase()) || item.name_loc.trim().toLowerCase() === keyword.trim().toLowerCase() || (Number.isInteger(Number(keyword)) && item.id === Number(keyword))
    );
    if (exactMatch.length) return exactMatch;

    return fuzzySearchItems(alias.length ? alias : [keyword], items);
  }

  function fuzzySearchItems(keywords: string[], items: utils.ItemList) {
    const resultMap = new Map<number, utils.ItemList[number]>();

    if (!keywords.length) return [];

    // 遍历物品列表
    for (const item of items) {
      // 预处理物品名称
      const cleanName = item.name_loc
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "")
        .trim();

      let matchAllKeywords = true;

      // 检查是否匹配所有关键词
      for (const keyword of keywords) {
        // 预处理关键词
        const cleanKeyword = keyword
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]/gu, "")
          .trim();

        // 空关键词跳过
        if (cleanKeyword.length === 0) continue;

        // 核心匹配逻辑
        const keywordChars = Array.from(cleanKeyword);
        const isMatched =
          // 完全连续匹配（如"水剑"）
          cleanName.includes(cleanKeyword) ||
          // 包含所有字符（如同时有"水"和"剑"）
          keywordChars.every((c) => cleanName.includes(c));

        // 发现任一关键词不匹配则终止检查
        if (!isMatched) {
          matchAllKeywords = false;
          break;
        }
      }

      // 满足所有关键词时加入结果
      if (matchAllKeywords) {
        resultMap.set(item.id, item);
      }
    }

    return Array.from(resultMap.values());
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
        await report(oneDayAgo, "dota2tracker.template.yesterdays_summary", config.dailyReportShowCombi);
      });
    }
    if (config.weeklyReportSwitch) {
      ctx.cron(`0 ${config.weeklyReportDayHours[1]} * * ${config.weeklyReportDayHours[0]}`, async function () {
        const oneWeekAgo = moment().subtract(1, "weeks").unix();
        await report(oneWeekAgo, "dota2tracker.template.last_weeks_summary", config.weeklyReportShowCombi);
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
          .filter((match) => match && match.id)
          .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)) // 根据match.id去重
          .filter((match) => moment.unix(match.startDateTime).isAfter(moment().subtract(1, "days"))) // 排除1天以前的比赛，防止弃坑数年群友绑定时突然翻出上古战报
          .filter((match) => !pendingMatches.some((pendingMatch) => pendingMatch.matchId == match.id)); // 判断是否已加入待发布列表
        // 在发布过的比赛id中查找以上比赛
        const sendedMatchesIds: number[] = [];
        for await (const sendedMatchesId of ctx.cache.keys("dt_sended_match_id")) {
          sendedMatchesIds.push(Number(sendedMatchesId));
        }
        // 遍历去重后的match
        // 遍历未发送的比赛，逐一处理
        for (const match of lastMatches.filter((match) => !sendedMatchesIds.includes(match.id))) {
          // 临时存储每种语言的公会数据
          const tempGuildsByLanguage: Record<
            string,
            Array<{
              guildId: string;
              platform: string;
              players: Array<utils.dt_subscribed_players>;
            }>
          > = {};

          // 遍历比赛中的玩家，逐步处理订阅信息
          for (const player of match.players) {
            // 筛选出当前比赛中已订阅的玩家
            const subscribedPlayers = subscribedPlayersInGuild.filter((subscribedPlayer) => subscribedPlayer.steamId === player.steamAccount.id);

            // 遍历订阅的玩家并归类到对应语言的群组中
            for (const subscribedPlayer of subscribedPlayers) {
              if (subscribedPlayer) {
                // 获取群组的语言标签
                const languageTag = await getLanguageTag({ channelId: subscribedPlayer.guildId });

                // 如果该语言的群组数据还未初始化，则初始化
                if (!tempGuildsByLanguage[languageTag]) {
                  tempGuildsByLanguage[languageTag] = [];
                }

                // 查找当前群组是否已存在于该语言分类中
                const tempGuild = tempGuildsByLanguage[languageTag].find((guild) => guild.guildId === subscribedPlayer.guildId && guild.platform === subscribedPlayer.platform);

                if (tempGuild) {
                  // 如果已存在，将玩家追加到群组的玩家列表中
                  tempGuild.players.push(subscribedPlayer);
                } else {
                  // 如果不存在，创建新的群组数据并添加到分类中
                  tempGuildsByLanguage[languageTag].push({
                    guildId: subscribedPlayer.guildId,
                    platform: subscribedPlayer.platform,
                    players: [subscribedPlayer],
                  });
                }
              }
            }
          }

          // 将比赛数据添加到待处理的比赛列表中
          pendingMatches.push({
            matchId: match.id,
            guilds: tempGuildsByLanguage,
            queryTime: new Date(),
            hasMessage: true,
          });

          // 生成日志数据，用于记录已跟踪的比赛
          const messageToLogger: { languageTag: string; platform: string; guildId: string; players: Array<{ nickName: string; steamId: number }> }[] = [];
          Object.entries(tempGuildsByLanguage).forEach(([languageTag, guilds]) => {
            guilds.forEach((guild) => {
              messageToLogger.push({
                languageTag,
                platform: guild.platform,
                guildId: guild.guildId,
                players: guild.players.map((player) => ({ nickName: player.nickName, steamId: player.steamId })),
              });
            });
          });
          // 发送日志，标记比赛已被跟踪
          ctx.logger.info($t(GlobalLanguageTag, "dota2tracker.logger.match_tracked", { messageToLogger, match }));

          // 如果比赛未被解析，发送解析请求
          if (!match.parsedDateTime) {
            const response = await query<graphql.RequestMatchDataAnalysisQueryVariables, graphql.RequestMatchDataAnalysisQuery>("RequestMatchDataAnalysis", {
              matchId: match.id,
            });
            // 根据发送请求结果发送日志
            ctx.logger.info($t(GlobalLanguageTag, `dota2tracker.logger.parse_request_${response.stratz.matchRetry ? "sent" : "failed"}`, { matchId: match.id }));
          }
        }

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
                  const languageTag = await getLanguageTag({ channelId: subPlayer.guildId });
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
                          date: moment(),
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
                    // const message = `群友 ${name} 段位变动：${$t(languageTag, "dota2tracker.template.ranks." + prevRank.medal)}${prevRank.star} → ${$t(languageTag, "dota2tracker.template.ranks." + currRank.medal)}${currRank.star} `;
                    const message = $t(languageTag, "dota2tracker.broadcast.rank_changed", {
                      name,
                      prev: { medal: $t(languageTag, "dota2tracker.template.ranks." + prevRank.medal), star: prevRank.star },
                      curr: { medal: $t(languageTag, "dota2tracker.template.ranks." + currRank.medal), star: currRank.star },
                    });
                    const img = await ctx.puppeteer.render(await genImageHTML(currRank, "rank" + (config.rankBroadFun ? "2" : ""), TemplateType.Rank, ctx, languageTag));
                    await ctx.broadcast([`${subPlayer.platform}:${subPlayer.guildId}`], message + img);
                  }
                  ctx.logger.info($t(GlobalLanguageTag, "dota2tracker.logger.rank_sent", { platform: subPlayer.platform, guildId: subPlayer.guildId, player: { nickName: subPlayer.nickName, steamId: subPlayer.steamId } }));
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
          const matchQuery: graphql.MatchInfoQuery = await queryMatchData(pendingMatch.matchId);
          const hasParsedData = matchQuery.match.parsedDateTime && matchQuery.match.players.filter((player) => player?.stats?.heroDamageReport?.dealtTotal).length > 0;
          const isMatchTimeout = moment.unix(matchQuery.match.endDateTime).isBefore(now.subtract(config.dataParsingTimeoutMinutes, "minutes"));
          const isQueryTimeout = moment(pendingMatch.queryTime).isBefore(now.subtract(config.dataParsingTimeoutMinutes, "minutes"));
          if (hasParsedData || (isMatchTimeout && isQueryTimeout)) {
            const guildsToLogger = [];
            for (const languageTag of Object.keys(pendingMatch.guilds)) {
              let match: utils.MatchInfoEx = await formatMatchData(matchQuery, languageTag);
              const img: string = await generateMatchImage(match, languageTag);
              for (let commingGuild of pendingMatch.guilds[languageTag]) {
                let broadMatchMessage: string = pendingMatch.hasMessage ? await generateMatchMessage(match, languageTag, commingGuild) : "";
                await ctx.broadcast([`${commingGuild.platform}:${commingGuild.guildId}`], broadMatchMessage + (ctx.config.urlInMessageType.some((type) => type == "match") ? "https://stratz.com/matches/" + match.id : "") + img);
                guildsToLogger.push({
                  matchId: match.id,
                  timeout: config.dataParsingTimeoutMinutes,
                  platform: commingGuild.platform,
                  guildId: commingGuild.guildId,
                  languageTag,
                });
              }
            }
            ctx.logger.info($t(GlobalLanguageTag, `dota2tracker.logger.match_${matchQuery.match.parsedDateTime ? "parsed" : "unparsed"}`, { matchId: matchQuery.match.id, guilds: guildsToLogger }));
            ctx.cache.set("dt_sended_match_id", String(pendingMatch.matchId), undefined, days_30);
            pendingMatches = pendingMatches.filter((item) => item.matchId != pendingMatch.matchId);
          } else ctx.logger.info($t(GlobalLanguageTag, "dota2tracker.logger.waiting_for_parse", { matchId: matchQuery.match.id }));
        } catch (error) {
          ctx.logger.error(error);
          await ctx.cache.delete("dt_previous_query_results", String(pendingMatch.matchId));
        }
      }
    });
  });

  // 定义一个异步函数 report，用于生成和发送报告
  async function report(timeAgo, titleKey, showCombi) {
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
        ctx.logger.error($t(GlobalLanguageTag, "dota2tracker.logger.fetch_guilds_failed") + error);
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
          const languageTag = await getLanguageTag({ channelId: guild.guildId });
          await ctx.broadcast(
            [`${guild.platform}:${guild.guildId}`],
            await ctx.puppeteer.render(
              await genImageHTML(
                {
                  title: $t(languageTag, titleKey),
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
                await getLanguageTag({ channelId: guild.guildId })
              )
            )
          );
          // 记录日志
          ctx.logger.info($t(GlobalLanguageTag, "dota2tracker.logger.report_sent", { title: $t(languageTag, titleKey), guildId: guild.guildId, platform: guild.platform }));
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
        .map((element) => (element.type == "br" ? "<br/>" : element?.attrs?.content))
        .join("") ?? "";
    if (result == key) return;
    return result;
  }
  async function genImageHTML(data, template, type: TemplateType, ctx: Context, languageTag) {
    const templatePath = path.join(pluginDir, "template", type, `${template}.ejs`);
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
      Random,
    };

    function templateI18nHelper(key: string[] | string, param?: string[] | string | object): string {
      return $t(languageTag, key, param);
    }

    try {
      const html = await ejs.renderFile(templatePath, templateData, {
        strict: false,
      });
      if (process.env.NODE_ENV === "development") fs.writeFileSync(path.join(pluginDir, "temp.html"), html);
      return html;
    } catch (error) {
      ctx.logger.error(error);
      throw error;
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
  Item = "item",
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
