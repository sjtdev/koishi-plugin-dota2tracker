import { Context, Service } from "koishi";
import { MatchInfoEx } from "../data/types";
import { DateTime } from "luxon";
import { MatchExtensionData, dt_match_extension_biz, dt_subscribed_players } from "../data/database";
import { DailyReportViewModel, PlayerRowModel, SpotlightCardModel } from "../presentation/view-models";
import { ImageType, ImageFormat } from "../common/types";
import * as graphql from "../../@types/graphql-generated";

export class DailyReportService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.daily-report", true);
    this.config = ctx.config;
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
      const playerStats: {
        steamId: number;
        avgKda: number;
        maxMvpScore: number;
        bestMatchId: number;
        minLvpRatio: number;
        worstMatchId: number;
        maxUtilityScore: number;
        bestUtilityMatchId: number;
        maxHealing: number;
        bestHealingMatchId: number;
        maxTowerDamage: number;
        bestTowerDamageMatchId: number;
      }[] = [];
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


      // Spotlight Cards: 遍历各项判定规则，只要通过判定则添加到 cards 数组中
      const cards: SpotlightCardModel[] = [];

      // 1. MVP: 最高单场 MVP 分（bestMatchId 对应场次），KDA 做 tie-breaker
      playerStats.sort((a, b) => b.maxMvpScore - a.maxMvpScore || b.avgKda - a.avgKda);
      const mvpStat = playerStats[0];
      const mvpPlayerData = squadPlayerData.find((p) => p.steamAccount.id === mvpStat.steamId)!;
      const mvpCard = this.buildSpotlightCard(mvpPlayerData, "MVP", mvpStat.bestMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl);
      cards.push(mvpCard);

      // 2. LVP (头号战犯：败局且单场 mvpScore < 10人均分 * 25%，取对当场均分占比最低者)
      let lvpSpotlight: SpotlightCardModel | null = null;
      const lvpCandidates = playerStats.filter((s) => s.worstMatchId > 0);
      if (lvpCandidates.length > 0) {
        const lvpStat = lvpCandidates.reduce((worst, curr) => {
          // 对当场均分占比更低者为更差的 LVP；占比相同时 avgKda 更低者更差
          return curr.minLvpRatio < worst.minLvpRatio || (curr.minLvpRatio === worst.minLvpRatio && curr.avgKda < worst.avgKda) ? curr : worst;
        });

        const lvpPlayerData = squadPlayerData.find((p) => p.steamAccount.id === lvpStat.steamId)!;
        lvpSpotlight = this.buildSpotlightCard(lvpPlayerData, "LVP", lvpStat.worstMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl);
        cards.push(lvpSpotlight);
      }

      // 3. UTILITY (无私奉献：单场 utilityScore > 1200)
      const utilityCandidates = playerStats.filter((s) => s.bestUtilityMatchId > 0);
      if (utilityCandidates.length > 0) {
        utilityCandidates.sort((a, b) => b.maxUtilityScore - a.maxUtilityScore || b.avgKda - a.avgKda);
        const utilityStat = utilityCandidates[0];
        const utilityPlayerData = squadPlayerData.find((p) => p.steamAccount.id === utilityStat.steamId)!;
        cards.push(this.buildSpotlightCard(utilityPlayerData, "UTILITY", utilityStat.bestUtilityMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl));
      }

      // 4. HEALER (救死扶伤：单场 heroHealing > 10000)
      const healerCandidates = playerStats.filter((s) => s.bestHealingMatchId > 0);
      if (healerCandidates.length > 0) {
        healerCandidates.sort((a, b) => b.maxHealing - a.maxHealing || b.avgKda - a.avgKda);
        const healerStat = healerCandidates[0];
        const healerPlayerData = squadPlayerData.find((p) => p.steamAccount.id === healerStat.steamId)!;
        cards.push(this.buildSpotlightCard(healerPlayerData, "HEALER", healerStat.bestHealingMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl));
      }

      // 5. DEMOLISHER (拆迁队长：单场 towerDamage > 10000)
      const demolisherCandidates = playerStats.filter((s) => s.bestTowerDamageMatchId > 0);
      if (demolisherCandidates.length > 0) {
        demolisherCandidates.sort((a, b) => b.maxTowerDamage - a.maxTowerDamage || b.avgKda - a.avgKda);
        const demolisherStat = demolisherCandidates[0];
        const demolisherPlayerData = squadPlayerData.find((p) => p.steamAccount.id === demolisherStat.steamId)!;
        cards.push(this.buildSpotlightCard(demolisherPlayerData, "DEMOLISHER", demolisherStat.bestTowerDamageMatchId, extensions, dotaconstants, t, getHeroName, getImageUrl));
      }

      // Sort Rows by MVP Score (descending), then by KDA Ratio
      playerRows.sort((a, b) => parseFloat(b.mvpScore) - parseFloat(a.mvpScore) || parseFloat(b.kda.ratio) - parseFloat(a.kda.ratio));
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
            subtext: squadStats.hasPreviousMatches
              ? `${t("dota2tracker.template.report.daily.stats.vs_yesterday")} ${squadStats.winRateDiff >= 0 ? "▲" : "▼"} ${Math.abs(squadStats.winRateDiff).toFixed(1)}%`
              : "---",
            isPositive: squadStats.winRateDiff >= 0,
            isWinRateAbove50: squadStats.winRate >= 50,
            hasComparison: squadStats.hasPreviousMatches,
          },
          kills: { value: squadStats.totalKills.toLocaleString(), subtext: t("dota2tracker.template.report.daily.stats.kills_avg", [squadStats.avgKills.toFixed(1)]) },
          duration: { value: this.formatDuration(squadStats.totalDuration), subtext: `${t("dota2tracker.template.report.daily.stats.avg_time")} ${this.formatDuration(squadStats.avgDuration)}` },
        },
        spotlights: {
          cards,
          mvp: mvpCard,
          secondary: cards.length > 1 ? cards[1] : null,
          lvp: lvpSpotlight,
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
      const key = `${user.platform}:${user.channelId}`;
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
    const hasPreviousMatches = previousStats.totalMatches > 0;

    return {
      ...currentStats,
      hasPreviousMatches,
      winRateDiff: hasPreviousMatches ? currentStats.winRate - previousStats.winRate : 0,
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
      worstScore = Infinity,
      worstScoreRatio = Infinity;

    let bestKda = -1,
      worstKda = Infinity;

    let bestMatchId = 0,
      worstMatchId = 0;

    let bestUtilityScore = -1,
      bestUtilityMatchId = 0;

    let bestHealing = -1,
      bestHealingMatchId = 0;

    let bestTowerDamage = -1,
      bestTowerDamageMatchId = 0;

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

      // Extract MVP Score and Utility Score
      const extension = extensions.find((e) => Number(e.matchId) === Number(m.id));
      const playerExtension = extension?.data?.players?.find((p) => p.steamAccountId === user.steamId);
      const mvpScore = playerExtension?.mvpScore || 0;
      const utilityScore = playerExtension?.utilityScore || 0;
      const heroHealing = (self as any).heroHealing || 0;
      const towerDamage = self.towerDamage || 0;
      mvpScoreSum += mvpScore;

      // Update Best/Worst logic to align with MVP/LVP selection criteria (Score > KDA)
      if (mvpScore > bestScore || (mvpScore === bestScore && matchKda > bestKda)) {
        bestScore = mvpScore;
        bestKda = matchKda;
        bestMatchId = m.id;
      }

      // LVP 判定：败场且个人得分 < 所在场次 10 名玩家平均得分的 25%，取对当场均分占比最低者
      const isLostMatch = self.isRadiant !== m.didRadiantWin;
      const matchPlayers = extension?.data?.players || [];
      const avgMatchMvpScore = matchPlayers.length > 0 ? matchPlayers.reduce((sum, p) => sum + (p.mvpScore || 0), 0) / matchPlayers.length : 0;
      const scoreRatio = avgMatchMvpScore > 0 ? mvpScore / avgMatchMvpScore : 1;
      const isLvpQualified = isLostMatch && scoreRatio < 0.25;

      if (isLvpQualified && (scoreRatio < worstScoreRatio || (scoreRatio === worstScoreRatio && matchKda < worstKda))) {
        worstScoreRatio = scoreRatio;
        worstScore = mvpScore;
        worstKda = matchKda;
        worstMatchId = m.id;
      }

      // 顺位 2: Best Utility (> 1200)
      if (utilityScore > 1200 && utilityScore > bestUtilityScore) {
        bestUtilityScore = utilityScore;
        bestUtilityMatchId = m.id;
      }

      // 顺位 3: Best Healing (> 10000)
      if (heroHealing > 10000 && heroHealing > bestHealing) {
        bestHealing = heroHealing;
        bestHealingMatchId = m.id;
      }

      // 顺位 4: Best Tower Damage (> 10000)
      if (towerDamage > 10000 && towerDamage > bestTowerDamage) {
        bestTowerDamage = towerDamage;
        bestTowerDamageMatchId = m.id;
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
        detail: matchCount > 0 ? `${(pKills / matchCount).toFixed(1)} / ${(pDeaths / matchCount).toFixed(1)} / ${(pAssists / matchCount).toFixed(1)}` : "0.0 / 0.0 / 0.0",
      },
      mvpScore: matchCount > 0 ? (mvpScoreSum / matchCount).toFixed(1) : "0.0",
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
        minLvpRatio: worstScoreRatio,
        worstMatchId,
        maxUtilityScore: bestUtilityScore,
        bestUtilityMatchId,
        maxHealing: bestHealing,
        bestHealingMatchId,
        maxTowerDamage: bestTowerDamage,
        bestTowerDamageMatchId,
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
    type: "MVP" | "LVP" | "UTILITY" | string,
    matchId: number,
    extensions: dt_match_extension_biz[],
    dotaconstants: any,
    t: (key: string) => string,
    getHeroName: (heroId: number) => string,
    getImageUrl: (image: string, type?: ImageType, format?: ImageFormat) => string,
  ): SpotlightCardModel {
    const match = (playerData.matches || []).find((m) => m.id === matchId)!;
    const self = match.players.find((p) => p.steamAccount?.id === playerData.steamAccount.id)!;

    // 从扩展数据中获取 titles, mvpScore, utilityScore
    const extension = extensions.find((e) => Number(e.matchId) === Number(matchId));
    const playerExtension = extension?.data?.players?.find((p) => p.steamAccountId === playerData.steamAccount.id);
    const badgeKeys = playerExtension?.titles || [];
    const mvpScore = playerExtension?.mvpScore || 0;
    const utilityScore = playerExtension?.utilityScore || 0;

    const matchKda = ((self.kills || 0) + (self.assists || 0)) / Math.max(1, self.deaths || 0);

    let title = t("dota2tracker.template.report.daily.spotlight.mvp_title");
    let themeColor = "gold";
    let scoreLabel = t("dota2tracker.template.report.daily.spotlight.score_label");
    let scoreValue = mvpScore ? mvpScore.toFixed(1) : "-";

    if (type === "LVP") {
      title = t("dota2tracker.template.report.daily.spotlight.lvp_title");
      themeColor = "red";
      scoreLabel = t("dota2tracker.template.report.daily.spotlight.score_label");
      scoreValue = mvpScore ? mvpScore.toFixed(1) : "-";
    } else if (type === "UTILITY") {
      title = t("dota2tracker.template.report.daily.spotlight.utility_title");
      themeColor = "cyan";
      scoreLabel = t("dota2tracker.template.report.daily.spotlight.utility_score_label");
      scoreValue = utilityScore ? utilityScore.toLocaleString() : "-";
    } else if (type === "HEALER") {
      title = t("dota2tracker.template.report.daily.spotlight.healer_title");
      themeColor = "green";
      scoreLabel = t("dota2tracker.template.report.daily.spotlight.healer_score_label");
      scoreValue = (self as any).heroHealing ? ((self as any).heroHealing as number).toLocaleString() : "-";
    } else if (type === "DEMOLISHER") {
      title = t("dota2tracker.template.report.daily.spotlight.demolisher_title");
      themeColor = "orange";
      scoreLabel = t("dota2tracker.template.report.daily.spotlight.demolisher_score_label");
      scoreValue = self.towerDamage ? self.towerDamage.toLocaleString() : "-";
    }

    return {
      type,
      title,
      themeColor,
      player: {
        name: playerData.steamAccount.name || "Unknown",
        heroName: getHeroName(self.heroId),
        kda: `${self.kills || 0}/${self.deaths || 0}/${self.assists || 0} (${matchKda.toFixed(1)})`,
        heroBannerUrl: dotaconstants.heroes[self.heroId] ? getImageUrl(dotaconstants.heroes[self.heroId].name.replace("npc_dota_hero_", ""), ImageType.Heroes, ImageFormat.png) : "",
        avatarUrl: playerData.steamAccount.avatar || "",
      },
      score: {
        value: scoreValue,
        label: scoreLabel,
      },
      badges: badgeKeys.map((key) => {
        const translated = t(key);
        const [text, hexColor] = translated.split("-#");
        return { text: text || key, hexColor: hexColor ? `#${hexColor}` : "#FFA500" };
      }),
    };
  }

  public static buildDefaultSpotlightCard(t: (key: string) => string): SpotlightCardModel {
    return {
      type: "DEFAULT",
      title: t("dota2tracker.template.report.daily.spotlight.default_title"),
      themeColor: "gray",
      player: {
        name: "",
        heroName: "",
        kda: "",
        heroBannerUrl: "",
        avatarUrl: "",
      },
      score: {
        value: "-",
        label: t("dota2tracker.template.report.daily.spotlight.default_label"),
      },
      badges: [],
    };
  }
}
