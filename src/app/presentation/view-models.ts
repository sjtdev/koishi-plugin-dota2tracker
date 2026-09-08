export interface DailyReportViewModel {
  meta: {
    date: string; // "Tuesday, October 24, 2023"
    summary: string; // "Performance summary for the Ancient Defense Squad..."
    footerId: string; // "ID: #8392-AD • Server: US East"
  };

  headerStats: {
    matches: { value: number; subtext: string }; // 42, "24W - 18L"
    winRate: {
      value: string; // "52.5%"
      subtext: string; // "▲ 5.2%"
      isPositive: boolean; // trend is positive
      isWinRateAbove50: boolean; // win rate >= 50%
      hasComparison?: boolean; // whether yesterday has comparison matches
    };
    kills: { value: string; subtext: string }; // "1,894", "Avg 45.1"
    duration: { value: string; subtext: string }; // "38:12", "Avg Time"
  };

  spotlights: {
    cards: SpotlightCardModel[];
    mvp?: SpotlightCardModel;
    secondary?: SpotlightCardModel | null; // 向下兼容
    lvp?: SpotlightCardModel | null; // 向下兼容
  };

  squad: PlayerRowModel[];
}

export interface SpotlightCardModel {
  type: "MVP" | "LVP" | "UTILITY" | "HEALER" | "DEMOLISHER" | "DEFAULT" | string;
  title: string; // "全 场 最 佳" / "头 号 战 犯" / "无 私 奉 献" / "救 死 扶 伤" / "拆 迁 队 长" / "平 平 无 奇"
  themeColor: "gold" | "red" | "cyan" | "green" | "orange" | "gray" | string;
  player: {
    name: string;
    heroName: string;
    kda: string;
    heroBannerUrl: string;
    avatarUrl: string;
  };
  score: {
    value: string;
    label: string; // "综合评分" / "辅助贡献" / "治疗量" / "建筑伤害" / "当日无趣味数据"
  };
  // 称号列表
  badges: TitleBadge[];
}

export interface TitleBadge {
  text: string; // "Godlike"
  hexColor: string; // "#FFA500" (原始 HEX)
  // 建议在 ViewModel 层处理好颜色，方便前端直接用
  // 或者前端 EJS 处理 hex -> rgba
}

export interface PlayerRowModel {
  rank: number;
  player: {
    name: string;
    avatarUrl: string;
    winCount: number;
    loseCount: number;
  };
  heroes: {
    url: string; // 英雄图片链接
    wins: number;
    losses: number;
  }[];
  plusHeroesCount: number; // "+2"

  kda: {
    ratio: string; // "14.0"
    detail: string; // "22 / 2 / 18"
  };

  mvpScore: string; // "75.5"

  impact: {
    damage: { heroPercent: number; buildingsPercent: number }; // 0-100
    networth: { percent: number }; // 0-100
  };
}
