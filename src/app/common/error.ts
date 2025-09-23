import { Logger } from "@cordisjs/logger";
import {I18NService} from "./i18n";
import { Config } from "../../config";
import { inspect } from "util";

export class NetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class ForbiddenError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export function handleError(error: unknown, logger: Logger, i18n: I18NService, config: Config) {
  if (error instanceof ForbiddenError) {
    // 情况1：手动构建完整的输出，然后只调用一次 logger
    let output = i18n.gt("dota2tracker.logger.stratz_token_banned") + "\n";
    output += error.stack || error.message;
    logger.error(output);
  } else if (error instanceof NetworkError) {
    // 情况2：根据配置处理其他网络错误
    if (config.suppressStratzNetworkErrors) {
      logger.debug(error);
      logger.info(1)
    } else {
      logger.error(error);
    }
  } else {
    // 情况3：处理其他错误
    let output = "An unexpected error was thrown:\n";
    if (error instanceof Error && error.stack) {
      // 如果是标准的 Error 对象并且有 stack，就使用 stack
      output += error.stack;
    } else {
      // 如果是其他类型（字符串、对象等），使用 util.inspect 获得更详细的输出
      output += inspect(error, { depth: null });
    }
    logger.error(output);
  }
}
