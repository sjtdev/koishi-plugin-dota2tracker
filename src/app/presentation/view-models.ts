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
    };
    kills: { value: string; subtext: string }; // "1,894", "Avg 45.1"
    duration: { value: string; subtext: string }; // "38:12", "Avg Time"
  };

  spotlights: {
    mvp: SpotlightCardModel;
    lvp: SpotlightCardModel;
  };

  squad: PlayerRowModel[];
}

export interface SpotlightCardModel {
  // 用于决定边框颜色 (Gold vs Red)
  type: "MVP" | "LVP";
  player: {
    name: string;
    heroName: string; // "Playing Juggernaut"
    kda: string; // "12 / 3 / 15 (9.0)"
    heroBannerUrl: string; // 大背景图
    avatarUrl: string; // 左下角如果需要显示头像的话(目前设计没显示，但备用)
  };
  score: {
    value: string; // "85.4"
    label: string; // "MVP Score"
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

  impact: {
    damage: { heroPercent: number; buildingsPercent: number }; // 0-100
    networth: { percent: number }; // 0-100
  };
}
