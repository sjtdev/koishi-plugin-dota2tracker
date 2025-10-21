import { Context, Service } from "koishi";
import { Benchmarks, OpenDotaMatch } from "../../@types/opendota-generated";
import * as dotaconstants from "dotaconstants";
import { LeaverStatusEnum, MatchInfoQuery, MatchLaneType, MatchPlayerPositionType, LaneOutcomeEnums, LobbyTypeEnum, GameModeEnumType } from "../../@types/graphql-generated";

export class OpenDotaAdapter extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.opendota-adapter", true);
  }

  transform(_match: OpenDotaMatch): StrictMatchInfo {
    determinePlayerPositions(_match);
    const players: StrictPlayerInfo[] = [];
    for (const _player of _match.players as PlayerWithPosition[]) {
      const player: StrictPlayerInfo = {
        steamAccountId: _player.account_id,
        level: _player.level,
        variant: _player.hero_variant,
        leaverStatus: convertLeaverStatus(_player.leaver_status),
        partyId: _player.party_id,
        position: convertPosition(_player.calculatedPosition),
        playerSlot: _player.player_slot,
        lane: convertLane(_player.lane),
        imp: determineIMP(_player),
        kills: _player.kills,
        deaths: _player.deaths,
        assists: _player.assists,
        isRadiant: _player.isRadiant,
        networth: _player.net_worth,
        // 因万恶的TypeScript严格类型检查，此处优雅的reduce赋值物品算法无法使用！
        // ...[0, 1, 2, 3, 4, 5].reduce((acc, i) => {
        //   acc[`item${i}Id`] = _player[`item_${i}`];
        //   if (i < 3) acc[`backpack${i}Id`] = _player[`backpack_${i}`];
        //   return acc;
        // }, {}),
        item0Id: _player.item_0,
        item1Id: _player.item_1,
        item2Id: _player.item_2,
        item3Id: _player.item_3,
        item4Id: _player.item_4,
        item5Id: _player.item_5,
        backpack0Id: _player.backpack_0,
        backpack1Id: _player.backpack_1,
        backpack2Id: _player.backpack_2,
        neutral0Id: _player.item_neutral,
        // _player.item_neutral2   是一个因stratz不再更新而缺失的字段，而opendota更新了的功能：中立物品的附魔。在此记录以留待未来考量决定是否使用。
        heroDamage: _player.hero_damage,
        towerDamage: _player.tower_damage,
        numLastHits: _player.last_hits,
        numDenies: _player.denies,
        goldPerMinute: _player.gold_per_min,
        experiencePerMinute: _player.xp_per_min,
        heroHealing: _player.hero_healing,
        isRandom: _player.randomed,
        steamAccount: { name: _player.personaname, seasonRank: _player.rank_tier, seasonLeaderboardRank: null },
        hero: {
          id: _player.hero_id,
          name: dotaconstants.heroes[_player.hero_id].name,
          shortName: dotaconstants.heroes[_player.hero_id].name.match(/^npc_dota_hero_(.+)$/)[1],
          facets: [...dotaconstants.hero_abilities[dotaconstants.heroes[_player.hero_id].name].facets.map((f) => ({ id: -1, name: f.name }))],
        },
        dotaPlus: null,
        stats: {
          networthPerMinute: _player.gold_t,
          experiencePerMinute: _player.xp_t,
          campStack: [_player.camps_stacked],
          matchPlayerBuffEvent: [],
          killEvents: [],
          deathEvents: [],
          assistEvents: [],
          heroDamageReport: {
            receivedTotal: {
              // 由于opendota获取不到伤害类型，此处只能粗暴地归一化。
              physicalDamage: Object.entries(_player.damage_taken)
                .filter(([source, damage]) => source.startsWith("npc_dota_hero_"))
                .reduce((total, [source, damage]) => total + damage, 0),
              magicalDamage: 0,
              pureDamage: 0,
            },
            dealtTotal: {
              // 同理，opendota只能获取到眩晕相关数据。
              // 据测stratz的控制时间单位为10毫秒，此处乘以100来模拟。
              stunDuration: _player.stuns * 100,
              stunCount: _player.stuns > 0 ? 1 : 0,
              slowDuration: 0,
              slowCount: 0,
              disableDuration: 0,
              disableCount: 0,
            },
          },
          itemPurchases: _player.purchase_log.map((p) => ({ time: p.time, itemId: dotaconstants.items[p.key].id })),
        },
        additionalUnit: null,
      };
      if (_player.additional_units) {
        const additionalUnit = _player.additional_units[0];
        player.additionalUnit = {
          // ...[0, 1, 2, 3, 4, 5].reduce((acc, i) => {
          //   acc[`item${i}Id`] = additionalUnit[`item_${i}`];
          //   if (i < 3) acc[`backpack${i}Id`] = additionalUnit[`backpack_${i}`];
          //   return acc;
          // }, {}),
          item0Id: additionalUnit.item_0,
          item1Id: additionalUnit.item_1,
          item2Id: additionalUnit.item_2,
          item3Id: additionalUnit.item_3,
          item4Id: additionalUnit.item_4,
          item5Id: additionalUnit.item_5,
          backpack0Id: additionalUnit.backpack_0,
          backpack1Id: additionalUnit.backpack_1,
          backpack2Id: additionalUnit.backpack_2,
          neutral0Id: additionalUnit.item_neutral,
        };
      }
      players.push(player);
    }
    const match: StrictMatchInfo = {
      id: _match.match_id,
      didRadiantWin: _match.radiant_win,
      lobbyType: convertLobbyType(_match.lobby_type),
      gameMode: convertGameMode(_match.game_mode),
      regionId: _match.region,
      parsedDateTime: _match.start_time + _match.duration,
      startDateTime: _match.start_time,
      endDateTime: _match.start_time + _match.duration,
      rank: (({ sum, count }) => (count ? sum / count : 0))(_match.players.reduce((acc, player) => (player.rank_tier != null ? { sum: acc.sum + player.rank_tier, count: acc.count + 1 } : acc), { sum: 0, count: 0 })),
      actualRank: 0,
      averageRank: 0,
      durationSeconds: _match.duration,
      topLaneOutcome: null,
      midLaneOutcome: null,
      bottomLaneOutcome: null,
      ...determineLaneOutcome(_match),
      radiantKills: [_match.radiant_score],
      direKills: [_match.dire_score],
      radiantNetworthLeads: _match.radiant_gold_adv,
      radiantExperienceLeads: _match.radiant_xp_adv,
      winRates: null,
      players,
      pickBans: _match.picks_bans?.map((pb) => ({ isPick: pb.is_pick, ...(pb.is_pick ? { heroId: pb.hero_id, bannedHeroId: null } : { bannedHeroId: pb.hero_id, heroId: null }), order: pb.order })),
      odParsed: true,
    };

    return match;
  }
}
// 一个更智能的、能够正确处理数组的 DeepRequiredAndOmit 版本
type DeepRequiredAndOmit<T, K extends keyof any> = T extends (infer E)[]
  ? DeepRequiredAndOmit<E, K>[] // 如果 T 是一个数组，则递归处理数组成员 E，并返回一个新数组
  : T extends object // 如果 T 是一个对象
    ? {
        // 使用 "as" 进行键的重映射，如果键 P 是我们要忽略的 K，则将其丢弃
        [P in keyof T as P extends K ? never : P]-?: DeepRequiredAndOmit<T[P], K>;
      }
    : T; // 如果 T 是原始类型（string, number等），则保持原样

// 创建一个严格版的 MatchInfo
type StrictMatchInfo = DeepRequiredAndOmit<MatchInfoQuery["match"], "__typename"> & { odParsed?: boolean };
type StrictPlayerInfo = DeepRequiredAndOmit<MatchInfoQuery["match"]["players"][number], "__typename">;
type PlayerWithPosition = OpenDotaMatch["players"][number] & {
  calculatedPosition: number;
};
function convertLeaverStatus(openDotaStatus: number): LeaverStatusEnum {
  switch (openDotaStatus) {
    case 0:
      return LeaverStatusEnum.None;
    case 1:
      return LeaverStatusEnum.DisconnectedTooLong;
    case 2:
      return LeaverStatusEnum.Abandoned;
    case 3:
      return LeaverStatusEnum.Afk;
    case 4:
      return LeaverStatusEnum.NeverConnected;
    case 5:
      return LeaverStatusEnum.NeverConnectedTooLong;
    case 6:
      return LeaverStatusEnum.FailedToReadyUp;
    default:
      return LeaverStatusEnum.None;
  }
}

function convertLane(openDotaLane: number): MatchLaneType {
  switch (openDotaLane) {
    case 1:
      return MatchLaneType.SafeLane;
    case 2:
      return MatchLaneType.MidLane;
    case 3:
      return MatchLaneType.OffLane;
    case 4:
      return MatchLaneType.Jungle;
    case 5:
      return MatchLaneType.Roaming;
    default:
      return MatchLaneType.Unknown;
  }
}

function convertPosition(openDotaPosition: number): MatchPlayerPositionType {
  switch (openDotaPosition) {
    case 1:
      return MatchPlayerPositionType.Position_1;
    case 2:
      return MatchPlayerPositionType.Position_2;
    case 3:
      return MatchPlayerPositionType.Position_3;
    case 4:
      return MatchPlayerPositionType.Position_4;
    case 5:
      return MatchPlayerPositionType.Position_5;
    default:
      return MatchPlayerPositionType.Unknown;
  }
}

function convertLobbyType(openDotaLobbyType: number): LobbyTypeEnum {
  const map = {
    lobby_type_normal: LobbyTypeEnum.Unranked,
    lobby_type_practice: LobbyTypeEnum.Practice,
    lobby_type_tournament: LobbyTypeEnum.Tournament,
    lobby_type_tutorial: LobbyTypeEnum.Tutorial,
    lobby_type_coop_bots: LobbyTypeEnum.CoopVsBots,
    lobby_type_ranked_team_mm: LobbyTypeEnum.TeamMatch,
    lobby_type_ranked_solo_mm: LobbyTypeEnum.SoloQueue,
    lobby_type_ranked: LobbyTypeEnum.Ranked,
    lobby_type_1v1_mid: LobbyTypeEnum.SoloMid,
    lobby_type_battle_cup: LobbyTypeEnum.BattleCup,
    lobby_type_event: LobbyTypeEnum.Event,
    lobby_type_gauntlet: LobbyTypeEnum.Event,
    lobby_type_new_player: LobbyTypeEnum.CoopVsBots,
    lobby_type_featured: LobbyTypeEnum.Event,
  };
  return map[dotaconstants.lobby_type[openDotaLobbyType].name] || LobbyTypeEnum.Event;
}

function convertGameMode(openDotaGameModeId: number): GameModeEnumType {
  const gameModeName = dotaconstants.game_mode[openDotaGameModeId]?.name;

  switch (gameModeName) {
    case "game_mode_all_pick":
      return GameModeEnumType.AllPick;
    case "game_mode_captains_mode":
      return GameModeEnumType.CaptainsMode;
    case "game_mode_random_draft":
      return GameModeEnumType.RandomDraft;
    case "game_mode_single_draft":
      return GameModeEnumType.SingleDraft;
    case "game_mode_all_random":
      return GameModeEnumType.AllRandom;
    case "game_mode_intro":
      return GameModeEnumType.Intro;
    case "game_mode_diretide":
      return GameModeEnumType.TheDiretide;
    case "game_mode_reverse_captains_mode":
      return GameModeEnumType.ReverseCaptainsMode;
    case "game_mode_greeviling":
      return GameModeEnumType.TheGreeviling;
    case "game_mode_tutorial":
      return GameModeEnumType.Tutorial;
    case "game_mode_mid_only":
      return GameModeEnumType.MidOnly;
    case "game_mode_least_played":
      return GameModeEnumType.LeastPlayed;
    case "game_mode_compendium_matchmaking":
      return GameModeEnumType.CompendiumMatchmaking;
    case "game_mode_custom":
      return GameModeEnumType.Custom;
    case "game_mode_captains_draft":
      return GameModeEnumType.CaptainsDraft;
    case "game_mode_balanced_draft":
      return GameModeEnumType.BalancedDraft;
    case "game_mode_ability_draft":
      return GameModeEnumType.AbilityDraft;
    case "game_mode_event":
      return GameModeEnumType.Event;
    case "game_mode_all_random_death_match":
      return GameModeEnumType.AllRandomDeathMatch;
    case "game_mode_1v1_mid":
      return GameModeEnumType.SoloMid;
    case "game_mode_all_draft":
      return GameModeEnumType.AllPickRanked; // 天梯 AP
    case "game_mode_turbo":
      return GameModeEnumType.Turbo;
    case "game_mode_mutation":
      return GameModeEnumType.Mutation;
    default:
      return GameModeEnumType.Unknown;
  }
}

/**
 * 为一个5人团队分配 1, 3, 4, 5 号位（假设 2 号位已被移除）
 */
function assignSideLanePositions(sideLanePlayers: PlayerWithPosition[]) {
  // 确保按补刀降序排序
  sideLanePlayers.sort((a, b) => b.last_hits - a.last_hits);

  // Step.1: 确定核心
  const pos1 = sideLanePlayers[0];
  const pos3 = sideLanePlayers[1];
  pos1.calculatedPosition = 1;
  pos3.calculatedPosition = 3;

  // Step.2: 确定辅助
  const supA = sideLanePlayers[2];
  const supB = sideLanePlayers[3];

  // 默认分配：补刀高的辅助是4，低的5
  let pos4 = supA;
  let pos5 = supB;

  // 修正：如果补刀高的辅助（supA）和1号位同路，那他才是5号位
  if (supA.lane === pos1.lane) {
    pos5 = supA;
    pos4 = supB;
  }
  // (如果补刀低的 supB 和 1 号位同路，那默认分配就是对的，无需改变)

  pos4.calculatedPosition = 4;
  pos5.calculatedPosition = 5;
}

/**
 * 健壮的1-5号位推断函数
 */
function determinePlayerPositions(match: OpenDotaMatch) {
  const players = match.players as PlayerWithPosition[];

  // 1. 按团队分组
  const radiantTeam = players.filter((p) => p.isRadiant);
  const direTeam = players.filter((p) => !p.isRadiant);

  // 2. 遍历两个团队
  for (const team of [radiantTeam, direTeam]) {
    // 确保团队有5名玩家，否则跳过（防止奇怪的比赛数据）
    if (team.length !== 5) {
      continue;
    }

    // 3. 锁定真正的 2 号位
    const midPlayers = team
      .filter((p) => p.lane === 2)
      .sort((a, b) => b.last_hits - a.last_hits);

    let pos2Player: PlayerWithPosition | undefined = undefined;

    if (midPlayers.length > 0) {
      // 无论有多少人中路，补刀最高的是 2 号位
      pos2Player = midPlayers[0];
      pos2Player.calculatedPosition = 2;
    }

    // 4. 获取剩余的 4 名（或 5 名，如果没有中单）“边路”玩家
    //    p !== pos2Player 会处理 pos2Player 是 undefined 的情况 (即没有中单)
    const sideLanePlayers = team.filter((p) => p !== pos2Player);

    // 5. 分配 1, 3, 4, 5
    if (sideLanePlayers.length === 4) {
      // 正常情况：1 个中单 + 4 个边路
      assignSideLanePositions(sideLanePlayers);
    } else if (sideLanePlayers.length === 5) {
      // 特殊情况：没有中单（例如 5 人刚三或 5 人优势路）
      // 我们需要从这 5 人中推断出 1, 2, 3, 4, 5

      // 按经济排序
      sideLanePlayers.sort((a, b) => b.net_worth - a.net_worth);

      // 补刀前 3 是核心，后 2 是辅助
      const pos1 = sideLanePlayers[0];
      const pos2 = sideLanePlayers[1]; // 补刀第2的推断为 2 号位
      const pos3 = sideLanePlayers[2];
      const supA = sideLanePlayers[3];
      const supB = sideLanePlayers[4];

      pos1.calculatedPosition = 1;
      pos2.calculatedPosition = 2;
      pos3.calculatedPosition = 3;

      // 辅助的 4/5 号位判断逻辑依然复用
      let pos4 = supA;
      let pos5 = supB;
      if (supA.lane === pos1.lane) {
        pos5 = supA;
        pos4 = supB;
      }
      pos4.calculatedPosition = 4;
      pos5.calculatedPosition = 5;
    }
  }
}
function determineLaneOutcome(match: OpenDotaMatch) {
  // 1. 初始化各路经济
  const laneGold = {
    radiant: { top: 0, mid: 0, bottom: 0 },
    dire: { top: 0, mid: 0, bottom: 0 },
  };

  // 2. 遍历所有玩家，根据他们的 Position 将10分钟经济累加到对应的路
  for (const player of match.players as PlayerWithPosition[]) {
    const team = player.isRadiant ? "radiant" : "dire";
    const goldAt10 = player.gold_t?.[10] || 0;

    switch (
      player.calculatedPosition // 使用我们已经计算好的 position
    ) {
      case 1: // 核心C位，在优势路
      case 5: // 辅助，也在优势路
        // 天辉的优势路是下路，夜魇的优势路是上路
        const safeLane = player.isRadiant ? "bottom" : "top";
        laneGold[team][safeLane] += goldAt10;
        break;

      case 2: // 中单
        laneGold[team]["mid"] += goldAt10;
        break;

      case 3: // 劣势路核心
      case 4: // 劣势路辅助
        // 天辉的劣势路是上路，夜魇的劣势路是下路
        const offLane = player.isRadiant ? "top" : "bottom";
        laneGold[team][offLane] += goldAt10;
        break;
    }
  }

  // 3. 计算各路经济差并判断结果
  const topDiff = laneGold.radiant.top - laneGold.dire.top;
  const midDiff = laneGold.radiant.mid - laneGold.dire.mid;
  const bottomDiff = laneGold.radiant.bottom - laneGold.dire.bottom;
  return {
    topLaneOutcome: judge(topDiff),
    midLaneOutcome: judge(midDiff),
    bottomLaneOutcome: judge(bottomDiff),
  };
  function judge(goldAdv: number) {
    const STOMP_THRESHOLD = 2500;
    const VICTORY_THRESHOLD = 800;

    if (goldAdv > STOMP_THRESHOLD) {
      return LaneOutcomeEnums.RadiantStomp;
    } else if (goldAdv > VICTORY_THRESHOLD) {
      return LaneOutcomeEnums.RadiantVictory;
    } else if (goldAdv < -STOMP_THRESHOLD) {
      return LaneOutcomeEnums.DireStomp;
    } else if (goldAdv < -VICTORY_THRESHOLD) {
      return LaneOutcomeEnums.DireVictory;
    } else {
      return LaneOutcomeEnums.Tie;
    }
  }
}

function determineIMP(player: OpenDotaMatch["players"][number]) {
  const values = Object.values(player.benchmarks).filter((value) => value.raw > 0);
  if (values.length === 0) return 0;
  const totalScore = values.reduce((acc, cur) => acc + cur.pct, 0);
  return Math.round((totalScore / values.length) * 100 - 50);
}
