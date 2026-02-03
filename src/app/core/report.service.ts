import { Context, Service } from "koishi";
import { MatchInfoEx } from "../data/types";
import { DateTime } from "luxon";
import { MatchExtensionData } from "../data/database";

export class ReportService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.report", true);
    this.config = ctx.config;
  }

  public async recordMatchExtension(match: MatchInfoEx) {
    const extensionData : MatchExtensionData = { matchId: match.id, players: [] };
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
    this.ctx.dota2tracker.database.insertReportData(extensionData.matchId, new Date(match.startDateTime * 1000), extensionData);
  }
}
