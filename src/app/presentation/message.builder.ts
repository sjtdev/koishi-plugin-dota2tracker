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
  async buildHelpMessage(languageTag: string, pluginName: string) {
    let message = "";
    let html = "";
    const $t_header = (key: string) => this.ctx.dota2tracker.i18n.$t(languageTag, `commands.dota2tracker.help.messages.table_headers.${key}`);
    const header: TableCell[] = [
      { content: $t_header("command") },
      { content: $t_header("alias") },
      { content: $t_header("arguments") },
      { content: $t_header("description") },
      { content: $t_header("options") },
      { content: $t_header("examples") },
    ];
    const table: TableCell[][] = [header];
    const rootCommand = this.ctx.$commander.get(pluginName);
    const commandList = rootCommand?.children;
    for (const command of commandList) {
      const names = Object.keys(command._aliases);
      const localeKey = "commands." + names.at(0);
      const optionsFromCommand = command._options;
      const localeData = this.ctx.i18n._data[languageTag];
      const formattedOptions = [];
      if (optionsFromCommand) {
        // 遍历指令对象中定义的选项名 (key 就是 'parse', 'template' 等)
        for (const optionKey in optionsFromCommand) {
          // 1. 动态构造出我们需要的、完整的 i18n 键
          const i18nKey = `commands.${command.name}.options.${optionKey}`;

          // 2. 用这个精确的键，直接去扁平化的数据对象中取值
          let description = localeData[i18nKey];
          const optionInfo = optionsFromCommand[optionKey];

          if (optionInfo && description) {
            const syntax = optionInfo.syntax; // 例: '-p, --parse'

            // 步骤 1: 从 syntax 中提取所有标志
            const flagsRegex = /-{1,2}[a-zA-Z-]+/g;
            const flags = syntax.match(flagsRegex); // 结果: ['-p', '--parse'] 或 null

            // 步骤 2: 使用提取的标志去清理 description
            if (flags) {
              for (const flag of flags) {
                // 检查 description 是否以 "标志 + 空格" 开头
                if (description.startsWith(flag + " ")) {
                  // 如果是，就截取掉这部分
                  description = description.substring(flag.length + 1);
                  // 通常找到第一个匹配的就可以退出了
                  break;
                }
              }
            }

            // 步骤 3: 组合最终结果
            formattedOptions.push({
              // 现在 description 已经是被清理过的干净版本了
              syntax: `[${syntax}]`,
              description: description,
            });
          }
        }
      }

      const row: TableCell[] = [
        { content: command.name },
        { content: names.slice(1).join("\n") },
        { content: command._arguments["stripped"] },
        { content: this.ctx.dota2tracker.i18n.$t(languageTag, localeKey + ".usage") },
        { content: formattedOptions.map((option) => `${option.syntax} ${option.description}`).join("\n") },
        { content: this.ctx.dota2tracker.i18n.$t(languageTag, localeKey + ".examples") },
      ];
      table.push(row);
    }

    html += this._createTableHTML(table, undefined, this.ctx.i18n._data[languageTag]["commands.dota2tracker.help.messages.header"]); // 这里由于直接使用$t会被错误转义，导致koishi会对<arg>错误地添加一个</arg>闭合标签，所以使用_data直接获取rawData
    // message += await this.ctx.dota2tracker.image.renderToImageByHTML( html);
    message += await this.ctx.dota2tracker.view.renderToImageByEJSCode(undefined, html, languageTag);
    message += this.ctx.dota2tracker.i18n.$t(languageTag, "commands.dota2tracker.help.messages.footer");
    return message;
  }

  async buildHeroOfTheDayMessage(
    languageTag: string,
    heroRcmd: {
      recommendedHeroes: number[];
      recommendationPool: HeroScoreBreakdown[];
      recommendationType: "PERSONALIZED" | "LIFETIME_ONLY" | "LIFETIME_NO_RECORD" | "PLAYER_ANONYMOUS";
    },
    metaRcmd: { recommendation: WeeklyHeroMeta; targetTiers: number[] },
  ) {
    const $t = (key: string, params?: any) => this.ctx.dota2tracker.i18n.$t(languageTag, `commands.dota2tracker.hero-of-the-day.messages.${key}`, params);

    let ejs = "<html><head><style>body{width:fit-content;height:fit-content;margin:0;padding:12px;font-family:<%-fontFamily%>;}</style></head><body>";

    if (heroRcmd.recommendationType !== "LIFETIME_NO_RECORD" && heroRcmd.recommendationType !== "PLAYER_ANONYMOUS") {
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
      if (heroRcmd.recommendationType === "LIFETIME_NO_RECORD") ejs += `<p>${$t("recommendation_type_no_record")}</p>`;
      if (heroRcmd.recommendationType === "PLAYER_ANONYMOUS") ejs += `<p>${$t("recommendation_type_anonymous")}</p>`;
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
    return await this.ctx.dota2tracker.view.renderToImageByEJSCode(undefined, ejs, languageTag);
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
            height: fit-content;
            background-color: #f7f7f7;
            font-family:<%-fontFamily%>;
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
    return await this.ctx.dota2tracker.view.renderToImageByEJSCode({}, ejs, languageTag);
  }

  buildRankChangedMessage(languageTag: string, name: string, prevRank, currRank): string {
    return this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.broadcast.rank_changed", {
      name,
      prev: { medal: this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.template.ranks." + prevRank.medal), star: prevRank.star },
      curr: { medal: this.ctx.dota2tracker.i18n.$t(languageTag, "dota2tracker.template.ranks." + currRank.medal), star: currRank.star },
    });
  }
  private _createTableHTML(data: TableCell[][], totalAlign: "left" | "center" | "right" = "left", header?: string) {
    const maxLength = data.reduce((max, row) => Math.max(max, row.length), 0);
    let html = `<html><head><style>body{width:fit-content;height:fit-content;margin:0;padding:12px;font-family:${this.config.templateFonts};}.table div:not(.row){background-color: #fff;padding: 4px;}</style></head><body>`;
    if (header) html += `<header>${escapeHtml(header)}</header>`;
    html += `<div class="table" style="display:grid;grid-template-columns:repeat(${maxLength},auto);background-color:#000;gap:1px;border:#000 solid 1px;text-align:${totalAlign}">`;
    for (const row of data) {
      html += `<div class="row" style="display:contents;">`;
      for (const cell of row) {
        const style = {
          ...(cell.align ? { "text-align": cell.align } : {}),
          ...(cell.colSpan ? { "grid-column": "span " + cell.colSpan } : {}),
          ...(cell.rowSpan ? { "grid-row": "span " + cell.rowSpan } : {}),
        };
        const styleStr = Object.entries(style)
          .map(([key, value]) => `${key}:${value}`)
          .join(";");
        const styleAttribute = styleStr ? ` style="${styleStr}"` : "";
        html += `<div${styleAttribute}>${escapeHtml(cell.content)}</div>`;
      }
      html += `</div>`;
    }

    html += `</div></body></html>`;
    return html;
    function escapeHtml(str: string): string {
      return (
        (str || "")
          .replace(/[&<>"']/g, function (match) {
            return {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[match];
          })
          // 补充\n替换为<br/>的代码
          .replace(/\n/g, "<br/>")
      );
    }
  }
}
function customConvertArrayOfString(str: string): string[] {
  try {
    return JSON.parse(`[${str}]`);
  } catch (error) {
    throw error;
  }
}

type TableCell = {
  content: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
  rowSpan?: number;
};
