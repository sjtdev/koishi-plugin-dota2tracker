import { Context, Session } from "koishi";
import { Config } from "../../config";
import { TemplateType } from "../common/types";
import { resolvePlayerAndHandleErrors } from "./_helper";

export function registerQueryMatchCommand(ctx: Context) {
  ctx
    .command("dota2tracker.query-match <match_id>")
    .alias("查询比赛")
    .option("parse", "-p")
    .option("template", "-t <value:string>")
    .action(async ({ session, options }, match_id) => {
      if (!match_id) return session.text(".empty_input");
      if (!/^\d{1,11}$/.test(match_id)) return session.text(".match_id_invalid");

      await session.send(session.text(".querying_match"));

      return await handleQueryMatchCommand(ctx, ctx.config, session, options, match_id);
    });

  ctx
    .command("dota2tracker.query-recent-match [input_data]")
    .alias("查询最近比赛")
    .option("parse", "-p")
    .option("template", "-t <value:string>")
    .action(async ({ session, options }, input_data) => {
      const steamId = await resolvePlayerAndHandleErrors(ctx, session, input_data);
      if (steamId === null) return;
      session.send(session.text(".querying_match"));
      const lastMatchId = await ctx.dota2tracker.player.getLastMatchId(Number(steamId));
      if (!lastMatchId?.matchId) return session.text(".query_failed");
      if (lastMatchId.isAnonymous) return session.text(".is_anonymous");

      return await handleQueryMatchCommand(ctx, ctx.config, session, options, lastMatchId.matchId);
    });
}

async function handleQueryMatchCommand(ctx: Context, config: Config, session: Session, options: { parse?: boolean; template?: string }, matchId: string | number) {
  const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
  const result = await ctx.dota2tracker.match.getMatchResult({ matchId: Number(matchId), requestParse: options.parse });
  if (result.status === "PENDING") {
    const subscriber = ctx.dota2tracker.parsePolling.createSubscriberByCommand(session, languageTag, { templateName: options?.template });
    ctx.dota2tracker.parsePolling.add(result.matchId, [subscriber]);
    return session.text("commands.dota2tracker.query-match.messages.waiting_for_parse");
  } else if (result.status === "NOT_FOUND") {
    return session.text(".query_failed");
  } else {
    const formattedMatchData = await ctx.dota2tracker.match.generateMatchData(result.matchData, languageTag);
    const message = ctx.dota2tracker.messageBuilder.buildMatchMessage(languageTag, formattedMatchData, []);
    const image = await ctx.dota2tracker.image.renderToImageByFile(formattedMatchData, options.template || config.template_match, TemplateType.Match, languageTag);
    await ctx.dota2tracker.image.renderToImageByFile(formattedMatchData, options.template || config.template_match, TemplateType.Match, languageTag);
    return message + image;
  }
}
