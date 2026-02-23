import { Context, Service } from "koishi";
import { MatchInfoEx } from "../data/types";
import { DateTime } from "luxon";
import { MatchExtensionData, dt_match_extension_biz, dt_subscribed_players } from "../data/database";
import { DailyReportViewModel, PlayerRowModel } from "../presentation/view-models";
import { ImageType, ImageFormat } from "../common/types";
import * as graphql from "../../@types/graphql-generated";

export class DailyReportService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.daily-report", true);
    this.config = ctx.config;
  }

  public async recordMatchExtension(match: MatchInfoEx) {
    const extensionData: MatchExtensionData = { matchId: match.id, players: [] };
    for (const player of match.players) {
      extensionData.players.push({
        steamAccountId: player.steamAccountId,
        rankSnapshot: player.rank,
        mvpScore: player.mvpScore,
        titles: player.titles,
        utilityScore: player.utilityScore,
        laneResult: player.laneResult,
        partyId: player.partyId,
      });
    }
    this.ctx.dota2tracker.database.insertMatchExtension(extensionData.matchId, new Date(match.startDateTime * 1000), extensionData);
  }

  /**
   * 入口函数，返回报告数据
   */
  public async generateDailyReportBundles(options: { days: number } = { days: 1 }): Promise<{ channelId: string; platform: string; report: DailyReportViewModel }[]> {
    const today = DateTime.now().startOf("day");
    const targetDate = today.minus({ days: options.days });
    // Fetch data for 2x the duration to calculate trends (current period vs previous period)
    const dataStartDate = targetDate.minus({ days: options.days });

    // 获取所有有效用户
    const users = await this.ctx.dota2tracker.database.getActiveSubscribedPlayers();
    const steamIds = [...new Set(users.map((user) => user.steamId))];
    const data = await this.ctx.dota2tracker.stratzAPI.queryPlayersMatchesForDaily(steamIds, Math.floor(dataStartDate.toSeconds()));

    // 汇总所有比赛ID以便查询扩展数据
    const allMatchIds = [...new Set(data.players.flatMap((p) => (p.matches || []).map((m) => m.id)))].map((id) => Number(id));
    const extensions = await this.ctx.dota2tracker.database.getMatchExtension(allMatchIds);

    const getImageUrl = this.ctx.dota2tracker.view.getImageUrl.bind(this.ctx.dota2tracker.view);

    return await DailyReportService.formatDailyReportBundles(
      data,
      users,
      extensions,
      this.ctx.dota2tracker.dotaconstants,
      targetDate,
      async (platform, guildId) => {
        const lang = await this.ctx.dota2tracker.i18n.getLanguageTag({ channelId: guildId });
        return {
          t: (key, params) => this.ctx.i18n.render([lang], [key], params).join(""),
          locale: lang,
          getHeroName: (heroId) => this.ctx.dota2tracker.i18n.$t(lang, `dota2tracker.template.hero_names.${heroId}`),
        };
      },
      getImageUrl,
    );
  }

  /**
   * 静态格式化函数，解耦数据获取与处理逻辑，方便测试与 HMR
   */
  public static async formatDailyReportBundles(
    data: graphql.PlayersMatchesForDailyQuery,
    users: dt_subscribed_players[],
    extensions: dt_match_extension_biz[],
    dotaconstants: any,
    targetDate: DateTime,
    getTranslator: (platform: string, guildId: string) => Promise<{ t: (key: string, params?: any) => string; locale: string; getHeroName: (heroId: number) => string }>,
    getImageUrl: (image: string, type?: ImageType, format?: ImageFormat) => string,
  ): Promise<{ channelId: string; platform: string; report: DailyReportViewModel }[]> {
    const bundles: { channelId: string; platform: string; report: DailyReportViewModel }[] = [];
    const groups = this.groupUsersByChannel(users);

    for (const [key, squadUsers] of groups.entries()) {
      const [platform, channelId] = key.split(":");
      const { t, locale, getHeroName } = await getTranslator(platform, channelId);

      const squadSteamIds = squadUsers.map((u) => u.steamId);
      const squadPlayerData = data.players.filter((p) => squadSteamIds.includes(p.steamAccount.id));

      if (squadPlayerData.length === 0) continue;

      const squadStats = this.calculateSquadStats(squadPlayerData, squadSteamIds, targetDate);
      if (squadStats.totalMatches === 0) continue;

      const playerRows: PlayerRowModel[] = [];
      const playerStats: { steamId: number; avgKda: number; maxMvpScore: number; bestMatchId: number; worstMatchId: number }[] = [];
      const impactData: any[] = [];

      for (const user of squadUsers) {
        const playerData = squadPlayerData.find((p) => p.steamAccount.id === user.steamId);
        if (!playerData || !playerData.matches || playerData.matches.length === 0) continue;

        const processed = this.processPlayer(user, playerData, dotaconstants, targetDate, extensions, getImageUrl);
        // Only include players who actually played/parsed in the current period
        if (processed.impact.matchCount === 0) continue;

        playerRows.push(processed.row);
        playerStats.push(processed.stats);
        impactData.push(processed.impact);
      }

      if (playerRows.length === 0) continue;

      this.calculateImpactPercentages(impactData);

      // MVP / LVP Logic
      // Sort by Max MVP Score (desc), then by AVG KDA (desc)
      playerStats.sort((a, b) => b.maxMvpScore - a.maxMvpScore || b.avgKda - a.avgKda);
      const mvpStat = playerStats[0];
      const lvpStat = playerStats[playerStats.length - 1];
      const mvpPlayerData = squadPlayerData.find((p) => p.steamAccount.id === mvpStat.steamId)!;
      const lvpPlayerData = squadPlayerData.find((p) => p.steamAccount.id === lvpStat.steamId)!;

      // Sort Rows by KDA Ratio
      playerRows.sort((a, b) => parseFloat(b.kda.ratio) - parseFloat(a.kda.ratio));
      playerRows.forEach((row, i) => (row.rank = i + 1));

      const report: DailyReportViewModel = {
        meta: {
          date: targetDate.setLocale(locale).toFormat(t("dota2tracker.template.report.daily.meta.date_format")),
          summary: t("dota2tracker.template.report.daily.meta.summary", [channelId]),
          // footerId: t("dota2tracker.template.report.daily.meta.footer_format", [channelId.slice(-4).toUpperCase(), platform.toUpperCase()]),
          footerId: "koishi-plugin-@sjtdev/dota2tracker",
        },
        headerStats: {
          matches: { value: squadStats.totalMatches, subtext: t("dota2tracker.template.report.daily.stats.matches_subtext", [squadStats.totalWins, squadStats.totalMatches - squadStats.totalWins]) },
          winRate: {
            value: `${squadStats.winRate.toFixed(1)}%`,
            subtext: `${t("dota2tracker.template.report.daily.stats.vs_yesterday")} ${squadStats.winRateDiff >= 0 ? "▲" : "▼"} ${Math.abs(squadStats.winRateDiff).toFixed(1)}%`,
            isPositive: squadStats.winRateDiff >= 0,
            isWinRateAbove50: squadStats.winRate >= 50,
          },
          kills: { value: squadStats.totalKills.toLocaleString(), subtext: t("dota2tracker.template.report.daily.stats.kills_avg", [squadStats.avgKills.toFixed(1)]) },
          duration: { value: this.formatDuration(squadStats.totalDuration), subtext: `${t("dota2tracker.template.report.daily.stats.avg_time")} ${this.formatDuration(squadStats.avgDuration)}` },
        },
        spotlights: {
          mvp: this.buildSpotlightCard(mvpPlayerData, "MVP", mvpStat.bestMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl),
          lvp: this.buildSpotlightCard(lvpPlayerData, "LVP", lvpStat.worstMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl),
        },
        squad: playerRows,
      };

      bundles.push({ channelId, platform, report });
    }

    return bundles;
  }

  private static groupUsersByChannel(users: dt_subscribed_players[]) {
    const groups = new Map<string, dt_subscribed_players[]>();
    for (const user of users) {
      const key = `${user.platform}:${user.guildId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(user);
    }
    return groups;
  }

  private static calculateSquadStats(squadPlayerData: graphql.PlayersMatchesForDailyQuery["players"], squadSteamIds: number[], targetDate: DateTime) {
    const targetSeconds = targetDate.toSeconds();

    // Flatten all matches ensuring uniqueness and separating by period
    const currentMatches = new Map<number, graphql.PlayersMatchesForDailyQuery["players"][number]["matches"][number]>();
    const previousMatches = new Map<number, graphql.PlayersMatchesForDailyQuery["players"][number]["matches"][number]>();

    for (const player of squadPlayerData) {
      for (const match of player.matches || []) {
        if (match.startDateTime >= targetSeconds) {
          currentMatches.set(match.id, match);
        } else {
          previousMatches.set(match.id, match);
        }
      }
    }

    const calcStats = (matchesMap: Map<number, graphql.PlayersMatchesForDailyQuery["players"][number]["matches"][number]>) => {
      const matchesArray = Array.from(matchesMap.values());
      const totalMatches = matchesArray.length;
      let totalWins = 0;
      let totalKills = 0;
      let totalDuration = 0;

      for (const match of matchesArray) {
        totalDuration += match.durationSeconds;
        const squadMembersInMatch = match.players.filter((p) => squadSteamIds.includes(p.steamAccount?.id));
        if (squadMembersInMatch.some((p) => p.isRadiant === match.didRadiantWin)) {
          totalWins += 1;
        }
        totalKills += squadMembersInMatch.reduce((sum, p) => sum + (p.kills || 0), 0);
      }

      return {
        totalMatches,
        totalWins,
        totalKills,
        totalDuration,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
        avgKills: totalMatches > 0 ? totalKills / totalMatches : 0,
        avgDuration: totalMatches > 0 ? totalDuration / totalMatches : 0,
      };
    };

    const currentStats = calcStats(currentMatches);
    const previousStats = calcStats(previousMatches);

    return {
      ...currentStats,
      winRateDiff: currentStats.winRate - previousStats.winRate,
    };
  }

  private static processPlayer(
    user: dt_subscribed_players,
    playerData: graphql.PlayersMatchesForDailyQuery["players"][number],
    dotaconstants: any,
    targetDate: DateTime,
    extensions: dt_match_extension_biz[],
    getImageUrl: (image: string, type?: ImageType, format?: ImageFormat) => string,
  ) {
    const targetSeconds = targetDate.toSeconds();

    let pWins = 0,
      pKills = 0,
      pDeaths = 0,
      pAssists = 0;
    let pHeroDamage = 0,
      pTowerDamage = 0,
      pNetworth = 0;
    let kdaSum = 0,
      mvpScoreSum = 0,
      bestScore = -1,
      worstScore = Infinity;

    let bestKda = -1,
      worstKda = Infinity;

    let bestMatchId = 0,
      worstMatchId = 0;

    const playedHeroes = new Map<number, { count: number; wins: number }>();
    let processedMatchCount = 0;

    for (const m of playerData.matches || []) {
      if (m.startDateTime < targetSeconds) continue; // Filter out previous period matches

      processedMatchCount++;
      const self = m.players.find((p) => p.steamAccount?.id === user.steamId)!;
      if (self.isRadiant === m.didRadiantWin) pWins++;
      pKills += self.kills || 0;
      pDeaths += self.deaths || 0;
      pAssists += self.assists || 0;
      pHeroDamage += self.heroDamage || 0;
      pTowerDamage += self.towerDamage || 0;
      pNetworth += self.networth || 0;

      const matchKda = ((self.kills || 0) + (self.assists || 0)) / Math.max(1, self.deaths || 0);
      kdaSum += matchKda;

      // Extract MVP Score
      const extension = extensions.find((e) => Number(e.matchId) === Number(m.id));
      const playerExtension = extension?.data?.players?.find((p) => p.steamAccountId === user.steamId);
      const mvpScore = playerExtension?.mvpScore || 0;
      mvpScoreSum += mvpScore;

      // Update Best/Worst logic to align with MVP/LVP selection criteria (Score > KDA)
      // Note: This changes the definition of "Best Match" to "Highest MVP Score Match".
      // If score is identical, break tie with KDA.
      if (mvpScore > bestScore || (mvpScore === bestScore && matchKda > bestKda)) {
        bestScore = mvpScore;
        bestKda = matchKda;
        bestMatchId = m.id;
      }

      // For Worst match
      if (mvpScore < worstScore || (mvpScore === worstScore && matchKda < worstKda)) {
        worstScore = mvpScore;
        worstKda = matchKda;
        worstMatchId = m.id;
      }

      const current = playedHeroes.get(self.heroId) || { count: 0, wins: 0 };
      current.count++;
      if (self.isRadiant === m.didRadiantWin) current.wins++;
      playedHeroes.set(self.heroId, current);
    }

    const matchCount = processedMatchCount;
    // Sort by wins (desc), then by total count (asc) => higher win rate preferred
    const sortedHeroes = Array.from(playedHeroes.entries()).sort((a, b) => b[1].wins - a[1].wins || a[1].count - b[1].count);

    const row: PlayerRowModel = {
      rank: 0,
      player: {
        name: user.nickName || playerData.steamAccount.name || "Unknown",
        avatarUrl: playerData.steamAccount.avatar || "",
        winCount: pWins,
        loseCount: matchCount - pWins,
      },
      heroes: sortedHeroes.slice(0, 3).map(([heroId, stats]) => {
        const hero = dotaconstants.heroes[heroId];
        return {
          url: hero ? getImageUrl(hero.name.replace("npc_dota_hero_", ""), ImageType.Heroes) : "",
          wins: stats.wins,
          losses: stats.count - stats.wins,
        };
      }),
      plusHeroesCount: Math.max(0, sortedHeroes.length - 3),
      kda: {
        ratio: pKills + pAssists === 0 ? "0.0" : ((pKills + pAssists) / Math.max(1, pDeaths)).toFixed(1),
        detail: matchCount > 0 ? `${(pKills / matchCount).toFixed(1)} / ${(pDeaths / matchCount).toFixed(1)} / ${(pAssists / matchCount).toFixed(1)}` : "0.0/0.0/0.0",
      },
      impact: {
        damage: { heroPercent: 0, buildingsPercent: 0 },
        networth: { percent: 0 },
      },
    };

    return {
      row,
      stats: {
        steamId: user.steamId,
        avgKda: matchCount > 0 ? kdaSum / matchCount : 0,
        maxMvpScore: bestScore, // Use bestScore as maxMvpScore
        bestMatchId,
        worstMatchId,
      },
      impact: { heroDamage: pHeroDamage, towerDamage: pTowerDamage, networth: pNetworth, matchCount, row },
    };
  }

  private static calculateImpactPercentages(impactData: any[]) {
    let maxAvgTotalDamage = 0;
    let maxAvgNetworth = 0;

    for (const data of impactData) {
      const avgTotalDamage = (data.heroDamage + data.towerDamage) / data.matchCount;
      const avgNetworth = data.networth / data.matchCount;
      if (avgTotalDamage > maxAvgTotalDamage) maxAvgTotalDamage = avgTotalDamage;
      if (avgNetworth > maxAvgNetworth) maxAvgNetworth = avgNetworth;
    }

    for (const data of impactData) {
      const avgHeroDamage = data.heroDamage / data.matchCount;
      const avgTowerDamage = data.towerDamage / data.matchCount;
      const avgNetworth = data.networth / data.matchCount;

      const heroPercent = maxAvgTotalDamage > 0 ? Math.round((avgHeroDamage / maxAvgTotalDamage) * 100) : 0;
      const buildingsPercent = maxAvgTotalDamage > 0 ? Math.round((avgTowerDamage / maxAvgTotalDamage) * 100) : 0;

      data.row.impact.damage.heroPercent = Math.min(100, heroPercent);
      data.row.impact.damage.buildingsPercent = Math.min(100 - data.row.impact.damage.heroPercent, buildingsPercent);

      data.row.impact.networth.percent = maxAvgNetworth > 0 ? Math.round((avgNetworth / maxAvgNetworth) * 100) : 0;
    }
  }

  public static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  public static buildSpotlightCard(
    playerData: graphql.PlayersMatchesForDailyQuery["players"][number],
    type: "MVP" | "LVP",
    matchId: number,
    extensions: dt_match_extension_biz[],
    dotaconstants: any,
    t: (key: string) => string,
    getHeroName: (heroId: number) => string,
    getImageUrl: (image: string, type?: ImageType, format?: ImageFormat) => string,
  ): any {
    const match = (playerData.matches || []).find((m) => m.id === matchId)!;
    const self = match.players.find((p) => p.steamAccount?.id === playerData.steamAccount.id)!;

    // 从扩展数据中获取 titles 和 mvpScore
    const extension = extensions.find((e) => Number(e.matchId) === Number(matchId));
    const playerExtension = extension?.data?.players?.find((p) => p.steamAccountId === playerData.steamAccount.id);
    const badgeKeys = playerExtension?.titles || [];
    const mvpScore = playerExtension?.mvpScore || 0;

    const matchKda = ((self.kills || 0) + (self.assists || 0)) / Math.max(1, self.deaths || 0);

    return {
      type,
      player: {
        name: playerData.steamAccount.name || "Unknown",
        heroName: getHeroName(self.heroId),
        kda: `${self.kills || 0} / ${self.deaths || 0} / ${self.assists || 0} (${matchKda.toFixed(1)})`,
        heroBannerUrl: dotaconstants.heroes[self.heroId] ? getImageUrl(dotaconstants.heroes[self.heroId].name.replace("npc_dota_hero_", ""), ImageType.Heroes, ImageFormat.png) : "",
        avatarUrl: playerData.steamAccount.avatar || "",
      },
      score: {
        value: mvpScore ? mvpScore.toFixed(1) : "-",
        label: t("dota2tracker.template.report.daily.spotlight.score_label"),
      },
      badges: badgeKeys.map((key) => {
        const translated = t(key);
        const [text, hexColor] = translated.split("-#");
        return { text: text || key, hexColor: hexColor ? `#${hexColor}` : "#FFA500" };
      }),
    };
  }
}
