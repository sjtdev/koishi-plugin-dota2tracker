import * as graphql from "../../@types/graphql-generated";

export interface MatchInfoEx extends NonNullable<graphql.MatchInfoQuery["match"]> {
  radiant: MatchInfoExTeam;
  dire: MatchInfoExTeam;
  party: { [key: string]: string };
  players: PlayerTypeEx[];
  durationTime: string;
}
interface MatchInfoExTeam {
  killsCount: number;
  damageReceived: number;
  heroDamage: number;
  networth: number;
  experience: number;
}
type PlayerType = NonNullable<graphql.MatchInfoQuery["match"]["players"]>[number];
export interface PlayerTypeEx extends PlayerType {
  team: "radiant" | "dire";
  rank: RankInfo;
  killContribution: number;
  deathContribution: number;
  damageReceived: number;
  titles: string[];
  mvpScore: number;
  order: number;
  buffs: {
    id: number;
    type: "ability" | "item";
    stackCount: number;
  }[];
  laneResult: "stomp" | "stomped" | "tie" | "advantage" | "disadvantage" | "jungle";
  supportItemsCount: { name: string; count: number }[];
  items: ItemInfo[];
  backpacks?: ItemInfo[];
  unitItems?: ItemInfo[];
  unitBackpacks?: ItemInfo[];
  facet: { id: number; name: string; displayName: string; color: string; icon: string };
  formattedNetworth: string;
  utilityScore: number;
}
export interface RankInfo {
  medal: number;
  star: number;
  leaderboard: number;
  inTop100: "8" | "8b" | "8c";
}
interface ItemInfo {
  id: number;
  name: string;
  seconds: number;
  time: string | undefined;
  isRecipe: boolean;
}

export interface PlayerInfoEx extends NonNullable<graphql.PlayerInfoWith25MatchesQuery["player"]>, NonNullable<graphql.PlayerExtraInfoQuery["player"]> {
  heroesPerformanceTop10: any[];
  genHero?: { name: string };
  rank: RankInfo;
  isEstimatedRank?: boolean;
}

export type ItemList = {
  id: number;
  name: string;
  name_loc: string;
  name_english_loc: string;
  neutral_item_tier: number;
  is_pregame_suggested: boolean;
  is_earlygame_suggested: boolean;
  is_lategame_suggested: boolean;
  recipes: { items: number[] }[];
  required_recipe: boolean;
  builds_into: number[];
}[];

export interface HeroScoreBreakdown {
  heroId: number;
  recentWinScore: number; // 近期胜场得分
  lifetimeWinScore: number; // 生涯胜场得分 (对数缩放后)
  impBonus: number; // IMP 奖励分

  isHotStreak: boolean; // 是否处于手热状态
  hotStreakBonus: number; // 手热奖励带来的额外加分

  baseScore: number; // 基础总分 (手热奖励前)
  totalScore: number; // 最终总分
}

export interface WeeklyHeroMeta {
  pos1: HeroMeta[];
  pos2: HeroMeta[];
  pos3: HeroMeta[];
  pos4: HeroMeta[];
  pos5: HeroMeta[];
}

export type HeroMeta = {
  heroId: number;
  winCount: number;
  matchCount: number;
  pickRate: number;
  winRate: number;
};
