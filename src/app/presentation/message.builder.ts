import { Context, Random, Service } from "koishi";
import { DateTime } from "luxon";
import { Config } from "../../config";
import { enhancedSimpleHashToSeed, formatCustomRelativeTime, roundToDecimalPlaces } from "../common/utils";
import { HeroScoreBreakdown, MatchInfoEx, WeeklyHeroMeta } from "../data/types";

export class MessageBuilder extends Service<Config> {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.message-builder", true);
    this.config = ctx.config;
  }

  async buildHeroOfTheDayMessage(
    languageTag: string,
    heroRcmd: {
      recommendedHeroes: number[];
      recommendationPool: HeroScoreBreakdown[];
      recommendationType: "PERSONALIZED" | "LIFETIME_ONLY" | "LIFETIME_NO_RECORD";
    },
    metaRcmd: { recommendation: WeeklyHeroMeta; targetTiers: number[] },
  ) {
    const $t = (key: string, params?: any) => this.ctx.dota2tracker.i18n.$t(languageTag, `commands.dota2tracker.hero-of-the-day.messages.${key}`, params);

    let ejs = "<html><head><style>body{width:fit-content;height:fit-content;margin:0;padding:12px;}</style></head><body>";

    if (heroRcmd.recommendationType !== "LIFETIME_NO_RECORD") {
      ejs += `<h3>${$t("title_recommendation")}</h3>`;
      ejs += `<p>${$t("recommendation_intro")}</p>`;
      ejs += `<p><b>${$t("recommendation_heroes", { heroes: heroRcmd.recommendedHeroes.map((heroId) => this.ctx.dota2tracker.i18n.getDisplayNameForHero(heroId, languageTag, { forceOfficialName: true })) })}</b></p>`;

      if (heroRcmd.recommendationType === "LIFETIME_ONLY") {
        ejs += `<p style='color:#666'>${$t("recommendation_type_lifetime_only")}</p>`;
      }

      ejs += `<p>${$t("details.pool_description")}</p>`;
      ejs += `<p>${$t("details.table_intro")}</p>`;
      ejs += `<div style="display: grid;grid-template-columns: repeat(6, auto);gap: 10px;text-align: center;align-items: center;">`;
      ejs += `<div style="display: contents">
              <div style="text-align:left">${$t("details.table_headers.hero")}</div>
              <div>${$t("details.table_headers.recent_wins")}</div>
              <div>${$t("details.table_headers.lifetime_wins")}</div>
              <div>${$t("details.table_headers.imp_bonus")}</div>
              <div>${$t("details.table_headers.is_hot_streak")}</div>
              <div>${$t("details.table_headers.total_score")}</div>
            </div>`;
      ejs += heroRcmd.recommendationPool
        .map(
          (hero) =>
            `<div style="display: contents">
            <div style="text-align:left">${this.ctx.dota2tracker.i18n.getDisplayNameForHero(hero.heroId, languageTag, { forceOfficialName: true }) + (heroRcmd.recommendedHeroes.includes(hero.heroId) ? "*" : "")}</div>
            <div>${hero.recentWinScore}</div>
            <div>${roundToDecimalPlaces(hero.lifetimeWinScore)}</div>
            <div>${roundToDecimalPlaces(hero.impBonus)}</div>
            <div>${hero.isHotStreak ? "√" : "/"}</div>
            <div>${hero.totalScore.toFixed(2)}</div>
          </div>`,
        )
        .join("");
      ejs += `</div>`;
      ejs += `<p>${$t("details.scoring_formula")}</p>`;
      ejs += `<p>${$t("details.hot_streak_desc")}</p>`;
    } else {
      ejs += `<p>${$t("recommendation_type_no_record")}</p>`;
    }
    ejs += "<br>";

    ejs += `<h3>${$t("title_meta")}</h3>`;
    const tiersText = metaRcmd.targetTiers.map((tier) => this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.template.ranks." + tier)).join(", ");
    ejs += `<p>${$t("meta_intro", { tiers: tiersText })}</p>`;
    ejs += `<i style="font-size:12px;color:#333">${$t("meta_table_header")}</i>`;

    for (const pos in metaRcmd.recommendation) {
      const heroesText = metaRcmd.recommendation[pos]
        .map((hero) => `${this.ctx.dota2tracker.i18n.getDisplayNameForHero(hero.heroId, languageTag, { forceOfficialName: true })}(${roundToDecimalPlaces(hero.pickRate * 100)}% ${roundToDecimalPlaces(hero.winRate * 100)}%)`)
        .join("、");
      ejs += `<p>${$t("meta_position", { pos: pos.at(-1) })}${heroesText}</p>`;
    }

    ejs += "</body></html>";
    return await this.ctx.dota2tracker.image.renderToImageByEJSCode(undefined, ejs, languageTag);
    // return message;
  }

  buildMatchMessage(languageTag: string, match: MatchInfoEx, players: { steamId: number }[]): string {
    let broadMatchMessage: string = "";
    const playerIds = players.map((player) => player.steamId);
    let broadPlayers = match.players.filter((item) => playerIds.includes(item.steamAccountId));
    for (let player of broadPlayers) {
      const random = new Random(() => enhancedSimpleHashToSeed(`${match.id}-${player.steamAccountId}-${player.playerSlot}`));
      let comment: string;
      if (player.isRadiant == match.didRadiantWin) {
        if (player.deathContribution < 0.2 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.5 || player.towerDamage > 10000 || player.imp > 0)
          comment = random.pick(customConvertArrayOfString(this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.WIN_POSITIVE")));
        else comment = random.pick(customConvertArrayOfString(this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.WIN_NEGATIVE")));
      } else {
        if (player.deathContribution < 0.25 || player.killContribution > 0.75 || player.heroDamage / player.networth > 1.0 || player.towerDamage > 5000 || player.imp > 0)
          comment = random.pick(customConvertArrayOfString(this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.LOSE_NEGATIVE")));
        else comment = random.pick(customConvertArrayOfString(this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.LOSE_NEGATIVE")));
      }
      let broadPlayerMessage = this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.message", {
        name: player.steamAccount.name,
        hero_name: this.ctx.dota2tracker.i18n.getDisplayNameForHero(player.hero.id, languageTag, { random }),
        comment,
        kda: `${((player.kills + player.assists) / (player.deaths || 1)).toFixed(2)} [${player.kills}/${player.deaths}/${player.assists}]`,
        gpm_xpm: `${player.goldPerMinute}/${player.experiencePerMinute}`,
        lh_dn: `${player.numLastHits}/${player.numDenies}`,
        damage: `${player.heroDamage}/${player.towerDamage}`,
        kc_dc: `${(player.killContribution * 100).toFixed(2)}%/${(player.deathContribution * 100).toFixed(2)}%`,
      });
      broadMatchMessage += broadPlayerMessage + "\n";
    }
    if (this.config.urlInMessageType.includes("match")) {
      broadMatchMessage += "https://stratz.com/matches/" + match.id;
    }
    return broadMatchMessage;
  }

  buildPlayerMessage(steamId: number): string {
    if (!this.config.urlInMessageType.includes("player")) return "";
    return `https://stratz.com/players/${steamId}`;
  }

  buildHeroMessage(hero): string {
    if (!this.config.urlInMessageType.includes("hero")) return "";
    const heroNameForUrl = hero?.name?.match(/^npc_dota_hero_(.+)$/)?.[1];
    return `https://wiki.dota2.com.cn/hero/${heroNameForUrl}.html`;
  }
  async buildMembersMessage(members: { name: string; steamId: number; winRate: number; lastMatchTime: number }[], languageTag: string): Promise<string> {
    const $t = (key: string, params?: any) => this.ctx.dota2tracker.i18n.$t(languageTag, `commands.dota2tracker.query-members.messages.${key}`, params);

    // 如果没有成员，直接返回纯文本提示，无需生成图片
    if (members.length === 0) {
      return $t("no_members");
    }

    // 使用 EJS 语法构建 HTML 字符串
    let ejs = `
      <html>
      <head>
        <style>
          body {
            padding: 16px;
            width: fit-content;
            background-color: #f7f7f7;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #eeeeee;
          }
          tr:last-child td {
            border-bottom: none;
          }
          th {
            font-weight: bold;
            background-color: #f2f2f2;
          }
          h3 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <h3>${$t("title", { count: members.length })}</h3>
        <table>
          <thead>
            <tr>
              <th>${$t("table_headers.nickname")}</th>
              <th>${$t("table_headers.winrate")}</th>
              <th>${$t("table_headers.last_match")}</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const member of members) {
      const winRate = typeof member.winRate === "number" && !isNaN(member.winRate) ? `${roundToDecimalPlaces(member.winRate * 100).toFixed(1)}%` : "-----";
      const lastMatch = member.lastMatchTime ? formatCustomRelativeTime(DateTime.fromSeconds(member.lastMatchTime), this.ctx.dota2tracker.i18n, languageTag) : "----------";

      ejs += `
        <tr>
          <td>${member.name}</td>
          <td>${winRate}</td>
          <td>${lastMatch}</td>
        </tr>
      `;
    }

    ejs += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // 调用图片渲染服务将 HTML 转换为图片，并返回图片消息元素
    return await this.ctx.dota2tracker.image.renderToImageByEJSCode({}, ejs, languageTag);
  }

  buildRankChangedMessage(languageTag: string, name: string, prevRank, currRank): string {
    return this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.rank_changed", {
      name,
      prev: { medal: this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.template.ranks." + prevRank.medal), star: prevRank.star },
      curr: { medal: this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.template.ranks." + currRank.medal), star: currRank.star },
    });
  }
}
function customConvertArrayOfString(str: string): string[] {
  try {
    return JSON.parse(`[${str}]`);
  } catch (error) {
    throw error;
  }
}
