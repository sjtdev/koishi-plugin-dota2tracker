import { Context, Session } from "koishi";
import { Config } from "../../config";
import { TemplateType } from "../common/types";
import { resolvePlayerAndHandleErrors, TaskMessenger } from "./_helper";
import { handleError } from "../common/error";

export function registerQueryMatchCommand(ctx: Context) {
  ctx
    .command("dota2tracker.query-match <match_id>")
    .alias("查询比赛")
    .option("parse", "-p")
    .option("template", "-t <value:string>")
    .action(async ({ session, options }, match_id) => {
      const name = "query-match";
      const logger = ctx.logger("command/" + name);

      const task = new TaskMessenger(session, { autoRecall: ctx.config.autoRecallTips });
      try {
        if (!match_id) return session.text(".empty_input");
        if (!/^\d{1,11}$/.test(match_id)) return session.text(".match_id_invalid");

        await task.send(session.text(".querying_match"));

        const message = await handleQueryMatchCommand(ctx, ctx.config, session, options, match_id);
        await task.finish();
        return message;
      } catch (error) {
        await task.finish();
        handleError(error, logger, ctx.dota2tracker.i18n, ctx.config);
        return session.text(".query_failed");
      }
    });

  ctx
    .command("dota2tracker.query-recent-match [input_data]")
    .alias("查询最近比赛")
    .option("parse", "-p")
    .option("template", "-t <value:string>")
    .action(async ({ session, options }, input_data) => {
      const name = "query-recent-match";
      const logger = ctx.logger("command/" + name);

      const task = new TaskMessenger(session, { autoRecall: ctx.config.autoRecallTips });
      try {
        const steamId = await resolvePlayerAndHandleErrors(ctx, session, input_data);
        if (steamId === null) return;
        await task.send(session.text(".querying_match"));

        const lastMatch = await ctx.dota2tracker.player.getLastMatchId(Number(steamId));

        if (!lastMatch?.id) {
          await task.finish();
          return session.text(".query_failed");
        }
        if (lastMatch.isAnonymous) {
          await task.finish();
          return session.text(".is_anonymous");
        }

        const message = await handleQueryMatchCommand(ctx, ctx.config, session, options, lastMatch.id);
        await task.finish();
        return message;
      } catch (error) {
        await task.finish();
        handleError(error, logger, ctx.dota2tracker.i18n, ctx.config);
        return session.text(".query_failed");
      }
    });
}

async function handleQueryMatchCommand(ctx: Context, config: Config, session: Session, options: { parse?: boolean; template?: string }, matchId: string | number) {
  const languageTag = await ctx.dota2tracker.i18n.getLanguageTag({ session });
  const result = await ctx.dota2tracker.match.getMatchResult({ matchId: Number(matchId), waitForParse: options.parse, allowFallback: config.enableOpenDotaFallback });
  if (result.status === "PENDING") {
    const subscriber = ctx.dota2tracker.parsePolling.createSubscriberByCommand(session, languageTag, { templateName: options?.template });
    ctx.dota2tracker.parsePolling.add(result.matchId, [subscriber]);
    return session.text("commands.dota2tracker.query-match.messages.waiting_for_parse");
  } else if (result.status === "NOT_FOUND") {
    return session.text(".query_failed");
  } else {
    const formattedMatchData = await ctx.dota2tracker.match.generateMatchData(result.matchData, languageTag);
    const message = ctx.dota2tracker.messageBuilder.buildMatchMessage(languageTag, formattedMatchData, []);
    const image = await ctx.dota2tracker.view.renderToImageByFile(formattedMatchData, options.template || config.template_match, TemplateType.Match, languageTag);
    return message + image;
  }
}
