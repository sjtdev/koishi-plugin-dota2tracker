import { Context, Random, Service, Session } from "koishi";
import * as graphql from "../../@types/graphql-generated";
import { HeroScoreBreakdown, PlayerInfoEx } from "../data/types";
import * as dotaconstants from "dotaconstants";
import { Config } from "../../config";
import { clamp, enhancedSimpleHashToSeed, sec2time } from "../common/utils";
import { DateTime } from "luxon";
import { RANK_BRACKETS } from "../common/constants";

export class PlayerService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.player", true);
    this.config = ctx.config;
  }

  public async getHeroRecommendation(steamId: number, player: graphql.PlayerPerformanceForHeroRecommendationQuery["player"]) {
    /** imp系数 */
    const RECENT_IMP_WEIGHT = 0.1;
    /** 生涯胜场权重 */
    const LIFETIME_WIN_LOG_WEIGHT = 5.0;
    /** 手热奖励系数 */
    const HOT_STREAK_MULTIPLIER = 1.2;
    /** 手热限时天数 */
    const HOT_STREAK_DAYS = 3;
    /** 推荐数量 */
    const RECOMMENDATION_COUNT = 3;
    /** 推荐池大小 */
    const RECOMMENDATION_POOL_SIZE = 10;

    const now = DateTime.now();
    const scoreMap = new Map<number, HeroScoreBreakdown>();
    const threeDaysAgo = now.minus({ days: HOT_STREAK_DAYS });
    for (const hero of player.lifetimePerformance) {
      const breakdown: HeroScoreBreakdown = {
        heroId: hero.heroId,
        recentWinScore: 0,
        lifetimeWinScore: Math.log(hero.winCount + 1) * LIFETIME_WIN_LOG_WEIGHT,
        impBonus: 0,
        isHotStreak: false,
        hotStreakBonus: 0,
        baseScore: 0,
        totalScore: 0,
      };
      scoreMap.set(hero.heroId, breakdown);
    }
    for (const hero of player.recentPerformance) {
      const lastPlayedDateTime = DateTime.fromSeconds(hero.lastPlayedDateTime);
      const entry = scoreMap.get(hero.heroId);
      entry.recentWinScore = hero.winCount;
      entry.impBonus = (hero.imp || 0) * RECENT_IMP_WEIGHT;
      entry.isHotStreak = lastPlayedDateTime > threeDaysAgo;
      scoreMap.set(hero.heroId, entry);
    }
    for (const breakdown of scoreMap.values()) {
      breakdown.baseScore = breakdown.recentWinScore + breakdown.lifetimeWinScore + breakdown.impBonus;
      if (breakdown.isHotStreak) {
        breakdown.totalScore = breakdown.baseScore * HOT_STREAK_MULTIPLIER;
        breakdown.hotStreakBonus = breakdown.totalScore - breakdown.baseScore;
      } else {
        breakdown.totalScore = breakdown.baseScore;
      }
    }

    /**
     * 推荐的状态
     * @PERSONALIZED 正常推荐
     * @LIFETIME_ONLY 仅有生涯数据无近期数据，可信度较低
     * @LIFETIME_NO_RECORD 无任何记录
     */
    const recommendationType: "PERSONALIZED" | "LIFETIME_ONLY" | "LIFETIME_NO_RECORD" = player.recentPerformance.length > 0 ? "PERSONALIZED" : player.lifetimePerformance.length > 0 ? "LIFETIME_ONLY" : "LIFETIME_NO_RECORD";
    // 获取推荐池
    const recommendationPool = Array.from(scoreMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, RECOMMENDATION_POOL_SIZE);
    // 创建权重表
    const weights: Record<number, number> = {};
    recommendationPool.forEach((hero) => {
      weights[hero.heroId] = hero.totalScore;
    });
    let seedIndex = 0;
    const recommendedHeroes: number[] = [];
    for (let i = 0; i < RECOMMENDATION_COUNT && Object.keys(weights).length > 0; i++) {
      const seed = enhancedSimpleHashToSeed(`${now.toFormat("yyyyMMdd")}-${steamId}-${seedIndex++}`);
      const random = new Random(() => seed);
      const heroId = random.weightedPick(weights);
      recommendedHeroes.push(Number(heroId));
      delete weights[heroId];
    }

    return { recommendedHeroes, recommendationPool, recommendationType };
  }

  async getMembersInChannel(session: Session): Promise<{ name: string; steamId: number; winRate: number; lastMatchTime: number }[]> {
    const subscribedPlayers = await this.ctx.dota2tracker.database.getSubscribedMembersInChannel(session);
    if (!subscribedPlayers || !subscribedPlayers.length) return [];
    const players = (await this.ctx.dota2tracker.stratzAPI.queryPlayersInfoWith10MatchesForGuild({ steamAccountIds: subscribedPlayers.map((player) => player.steamId) })).players;
    const result = [];
    players.forEach((player) => {
      const winCount = player.matches.filter((match) => match.didRadiantWin === match.players.find((innerPlayer) => innerPlayer.steamAccount.id === player.steamAccount.id).isRadiant).length;
      const winRate: number = winCount / player.matches.length;
      const lastMatchTime: number = player.matches[0]?.startDateTime;
      result.push({
        name: subscribedPlayers.find((subPlayer) => subPlayer.steamId == player.steamAccount.id).nickName || player.steamAccount.name,
        steamId: player.steamAccount.id,
        winRate,
        lastMatchTime,
      });
    });
    return result;
  }

  async resolveSteamId(session: Session, input: string): Promise<{ success: true; steamId: string } | { success: false; reason: "NOT_BINDED" | "NICKNAME_NOT_FOUND" | "INVALID_INPUT" }> {
    // 1. 如果有输入
    if (input) {
      // a. 优先判断是否是纯数字 ID
      if (/^\d{1,11}$/.test(input)) {
        return { success: true, steamId: input };
      }
      // b. 如果不是纯数字，则按昵称在数据库中查找
      const targetPlayer = await this.ctx.dota2tracker.database.getSubscribedPlayerByNickNameOrSession(session, input);
      if (targetPlayer) {
        return { success: true, steamId: String(targetPlayer.steamId) };
      }
      // 如果昵称也找不到，说明输入无效
      return { success: false, reason: "INVALID_INPUT" };
    }

    // 2. 如果没有输入，则查找当前 session 绑定的玩家
    const sessionPlayer = await this.ctx.dota2tracker.database.getSubscribedPlayerByNickNameOrSession(session);
    if (sessionPlayer) {
      return { success: true, steamId: String(sessionPlayer.steamId) };
    }

    // 走投无路，说明未绑定
    return { success: false, reason: "NOT_BINDED" };
  }

  async getLastMatchId(steamId: number): Promise<{ matchId: number; isAnonymous?: boolean }> {
    let lastMatchId = 0;
    try {
      const lastMatchQuery = await this.ctx.dota2tracker.stratzAPI.queryPlayersLastMatchRankInfo({
        steamAccountIds: [steamId],
      });
      if (lastMatchQuery.players[0].steamAccount.isAnonymous) return { matchId: 0, isAnonymous: true };

      lastMatchId = lastMatchQuery.players[0].matches[0]?.id;
    } catch (error) {
      this.logger.error(error);
    }
    return { matchId: lastMatchId };
  }

  async getFormattedPlayerData(steamId: number, heroId: number | undefined, languageTag: string): Promise<PlayerInfoEx> {
    const playerQuery = await this.ctx.dota2tracker.stratzAPI.queryPlayerInfoWith25Matches({
      steamAccountId: steamId,
      heroIds: heroId,
    });

    const playerExtraQuery = !playerQuery.player.steamAccount.isAnonymous
      ? await this.ctx.dota2tracker.stratzAPI.queryPlayerExtraInfo({
          steamAccountId: steamId,
          matchCount: playerQuery.player.matchCount,
          heroIds: heroId,
        })
      : {
          player: {
            heroesPerformance: [],
            dotaPlus: null,
          },
        };
    const player = PlayerService.extendPlayerData({
      playerQuery,
      playerExtraQuery,
      genHero: heroId ? { heroId, name: this.ctx.dota2tracker.i18n.getConstantLocale(languageTag).dota2tracker.template.hero_names[heroId] } : null,
      estimateRank: this.config.playerRankEstimate,
    });
    return player;
  }

  public async validateSteamId(steamId: number | string) {
    try {
      // 2. 调用 StratzAPI
      const queryRes = await this.ctx.dota2tracker.stratzAPI.queryVerifyingPlayer(Number(steamId));

      // 3. 根据返回结果，判断业务逻辑
      if (queryRes.player?.matchCount) {
        // 验证成功
        return {
          status: "VALID",
          steamId: steamId,
          isAnonymous: queryRes.player.steamAccount.isAnonymous,
        };
      } else {
        // 账号存在，但没有 Dota2 比赛记录
        return { status: "NO_DOTA_PROFILE", reason: ".reason_without_match" };
      }
    } catch (error) {
      // 4. API 请求本身失败
      // 这里可以结合我们之前设计的 LayerError
      // const wrappedError = new LayerError(`Failed to validate SteamID: ${steamId}`, { cause: error });
      return {
        status: "API_ERROR",
        reason: ".reason_fetch_failed",
      };
    }
  }

  public static extendPlayerData(param: { playerQuery: graphql.PlayerInfoWith25MatchesQuery; playerExtraQuery?: graphql.PlayerExtraInfoQuery; genHero?: { heroId: number; name: string }; estimateRank?: boolean }) {
    const { playerQuery, playerExtraQuery, genHero, estimateRank } = param;
    const player = playerQuery.player as PlayerInfoEx;
    const playerExtra = playerExtraQuery?.player;
    if (player.steamAccount.isAnonymous) {
      for (let index = 0; index < 25; index++) {
        const random = new Random(() => enhancedSimpleHashToSeed(`${player.steamAccount.id}-${index}`));
        const heroId = random.pick(Object.keys(dotaconstants.heroes));
        player.matches.push({
          id: 1000000000 + index,
          gameMode: "UNKNOWN" as any,
          lobbyType: "UNRANKED" as any,
          didRadiantWin: random.bool(0.5),
          rank: random.int(0, 8) * 10,
          radiantKills: [random.int(0, 30)],
          direKills: [random.int(0, 30)],
          parsedDateTime: 1,
          players: [
            {
              steamAccount: { id: player.steamAccount.id },
              isRadiant: true,
              kills: random.int(0, 20),
              deaths: random.int(0, 20),
              assists: random.int(0, 20),
              hero: { id: heroId, shortName: dotaconstants.heroes[heroId].name.match(/^npc_dota_hero_(.+)$/)[1] },
            },
          ],
        });
      }
    }
    // 过滤和保留最高 level 的记录
    let filteredDotaPlus = {};
    playerExtra?.dotaPlus?.forEach((item) => {
      if (!filteredDotaPlus[item.heroId] || filteredDotaPlus[item.heroId].level < item.level) {
        filteredDotaPlus[item.heroId] = {
          heroId: item.heroId,
          level: item.level,
        };
      }
    });

    // 合并 heroesPerformance 数据
    playerExtra?.heroesPerformance?.forEach((hero) => {
      if (filteredDotaPlus[hero.hero.id]) {
        filteredDotaPlus[hero.hero.id].shortName = hero.hero.shortName;
        filteredDotaPlus[hero.hero.id].winCount = hero.winCount;
        filteredDotaPlus[hero.hero.id].matchCount = hero.matchCount;
      }
    });

    // 如果玩家没有段位，为玩家估算段位；必要条件：玩家没有段位信息 且 配置允许推算 且 玩家并未隐藏数据。（若隐藏数据则没有推算用的比赛段位数据）
    if (!player.steamAccount.seasonRank && estimateRank && !player.steamAccount.isAnonymous) {
      player.isEstimatedRank = true;
      player.steamAccount.seasonRank = this.estimateWeightedRank(player);
    }

    // 储存玩家分段
    player.rank = {
      medal: parseInt(player.steamAccount.seasonRank?.toString().split("")[0] ?? 0),
      star: parseInt(player.steamAccount.seasonRank?.toString().split("")[1] ?? 0),
      leaderboard: player.steamAccount.seasonLeaderboardRank,
      inTop100: player.steamAccount.seasonLeaderboardRank ? (player.steamAccount.seasonLeaderboardRank <= 10 ? "8c" : player.steamAccount.seasonLeaderboardRank <= 100 ? "8b" : undefined) : undefined,
    };

    // 转换为数组
    player.dotaPlus = Object.values(filteredDotaPlus); // 排序 dotaPlus 数组
    player.dotaPlus?.sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return a.heroId - b.heroId;
    });

    // 取场次前十的英雄表现数据附加到原player对象中
    player.heroesPerformanceTop10 = playerExtra?.heroesPerformance.slice(0, 10) ?? [];

    if (genHero) {
      const { matchCount, winCount, imp } = player.heroesPerformanceTop10[0];
      player.matchCount = matchCount;
      player.winCount = winCount;
      player.performance.imp = imp;
      player.dotaPlus = player.dotaPlus.filter((dpHero) => dpHero.heroId == genHero.heroId);
      player.genHero = genHero;
    }

    player.matches.forEach((match) => {
      (match as graphql.PlayerInfoWith25MatchesQuery["player"]["matches"][0] & { durationTime: string }).durationTime = sec2time(match.durationSeconds);
    });

    return player;
  }

  /**
   * 根据最近的比赛记录，估算玩家的隐藏段位。
   * @param matches 玩家的比赛记录数组
   * @returns 估算出的段位数值，或在无法估算时返回 "Unknown"
   */
  public static estimateWeightedRank(player: { steamAccount?: { seasonRank?: number }; matches?: { rank?: number }[] }): number {
    if (player.steamAccount?.seasonRank) {
      return player.steamAccount.seasonRank;
    }
    const matches = player.matches;
    if (!matches || matches.length === 0) {
      return 0;
    }

    const validRanks = matches.map((match) => match.rank).filter(validateRank);

    if (validRanks.length === 0) {
      return 0;
    }

    // ✅ 优化：通过一次遍历同时计算加权总和与权重总和
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < validRanks.length; i++) {
      const rank = validRanks[i];
      const value = rankToValue(rank);
      const weight = calculateWeight(i, validRanks.length);

      weightedSum += value * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return 0;
    }

    const weightedAverage = weightedSum / totalWeight;

    // 将连续值转换回段位格式
    // 注意：这里 tier 的计算基准是 6 星（0-5），所以除以 6
    const tier = Math.floor(weightedAverage / 6);
    const stars = Math.round(weightedAverage % 6);

    // 确保段位在有效范围内
    const finalTier = Math.max(1, Math.min(tier, 8));
    const finalStars = Math.max(0, Math.min(stars, 5));

    return finalTier * 10 + finalStars;
  }
}
function rankToValue(rank: number): number {
  const tier = Math.floor(rank / 10);
  const stars = rank % 10;
  return tier * 6 + stars;
}

function calculateWeight(index: number, total: number): number {
  // ✅ 修复了边界情况：如果只有一个元素，权重就是 1.0
  if (total <= 1) {
    return 1.0;
  }
  // 线性衰减：从 1.0 (最新) 到 0.5 (最旧)
  return 1.0 - (0.5 / (total - 1)) * index;
}

function validateRank(rank: number): boolean {
  if (!rank && rank !== 0) return false; // 过滤掉 null 或 undefined
  if (rank === 80) return true; // 冠世一绝段位
  const tier = Math.floor(rank / 10);
  const stars = rank % 10;
  return tier >= 1 && tier <= 8 && stars >= 0 && stars <= 5;
}
