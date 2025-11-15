import { Logger } from "@cordisjs/logger";
import { I18NService } from "./i18n";
import { Config } from "../../config";
import { inspect } from "util";
import axios from "axios";

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

export class GraphQLQueryError extends Error {
  public readonly errors: any[]; // 可以把原始 errors 存起来
  constructor(message: string, errors: any[], options?: ErrorOptions) {
    super(message, options);
    this.errors = errors;
  }
}

export class FetchMatchDataFailError extends Error {
  public readonly stratzError?: unknown;
  public readonly opendotaError?: unknown;

  constructor(message: string, options?: { stratzError?: unknown; opendotaError?: unknown }) {
    // 我们可以将第一个错误（通常是 stratzError）作为 cause 传递
    super(message, { cause: options?.stratzError || options?.opendotaError });
    this.name = "FetchMatchDataFailError";
    this.stratzError = options?.stratzError;
    this.opendotaError = options?.opendotaError;
  }
}

// 定义清晰的错误分类
export type ClassifiedErrorType =
  | "Forbidden" // HTTP 403
  | "NotFound" // HTTP 404 (对 OpenDota 可能有用)
  | "ClientError" // 其他 4xx
  | "ServerError" // 5xx
  | "Timeout" // 请求超时
  | "Network" // 其他网络连接错误 (DNS, ECONNREFUSED etc.)
  | "Cancel" // 请求被取消 (AbortController)
  | "GraphQLQueryError"
  | "Unknown"; // 其他未能识别的错误

export function classifyAxiosError(error: unknown): ClassifiedErrorType {
  if (axios.isCancel(error)) {
    return "Cancel";
  }

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      return "Timeout";
    }
    if (error.response) {
      // 有响应，是 HTTP 错误
      if (error.response.status === 403) return "Forbidden";
      if (error.response.status === 404) return "NotFound"; // 添加 404
      if (error.response.status >= 400 && error.response.status < 500) return "ClientError";
      if (error.response.status >= 500) return "ServerError";
    } else if (error.request) {
      // 发出了请求但没有收到响应，是网络错误
      // error.code 在这里通常包含具体的网络错误码 (ENOTFOUND, ECONNREFUSED)
      return "Network";
    }
  }

  if (error instanceof GraphQLQueryError) {
    return "GraphQLQueryError";
  }

  // 其他所有无法识别的错误
  return "Unknown";
}

/**
 * 通用的 API 错误处理器，用于 fetchData 的 catch 块
 */
export function processFetchError(error: any, serviceName: string, queryName: string) {
  // 1. 分类
  const errorType = classifyAxiosError(error);
  const message = `${serviceName} query (${queryName}) failed. Type: ${errorType}`;
  // 2. 包装并抛出
  if (errorType === "Forbidden") {
    throw new ForbiddenError(message, { cause: error });
  } else if (["Timeout", "Network", "ServerError", "ClientError", "NotFound"].includes(errorType)) {
    // 统一包装为 NetworkError
    throw new NetworkError(message, { cause: error });
  }

  // 3. 其他 (如 GraphQLQueryError, Cancel, Unknown) 直接原样抛出
  throw error;
}
export function handleError(error: unknown, logger: Logger, i18n: I18NService, config: Config) {
  // 1. 捕获“所有数据源均失败”的复合错误
  if (error instanceof FetchMatchDataFailError) {
    if (error.stratzError && error.opendotaError) {
      // 只有当 *两个* 源都失败时，才打印“all sources failed”
      logger.error("Failed to fetch match data from all available sources. See details below:");
    } else {
      // 否则，只打印一个更通用的“备用源失败”消息
      logger.error("A data source failed during the match fetch process. See details below:");
    }
    if (error.stratzError) {
      logger.error("--- Stratz API Error ---");
      // 递归调用 handleError，以重用下面所有的错误格式化逻辑
      handleError(error.stratzError, logger, i18n, config);
    }
    if (error.opendotaError) {
      logger.error("--- OpenDota API Error ---");
      // 递归调用 handleError
      handleError(error.opendotaError, logger, i18n, config);
    }
  }

  // 2. 捕获 Forbidden 错误
  else if (error instanceof ForbiddenError) {
    let output = i18n.gt(`dota2tracker.logger.${error.message.includes("Stratz") ? "stratz" : "opendota"}_token_banned`) + "\n";
    // 我们可以从 cause 中提取更详细的 axios 错误信息
    if (axios.isAxiosError(error.cause)) {
      output += `Details: ${error.cause.message}. Response: ${JSON.stringify(error.cause.response?.data)}\n`;
    }
    output += error.stack || error.message;
    logger.error(output);
  }

  // 3. 捕获 Stratz GraphQL 逻辑错误
  else if (error instanceof GraphQLQueryError) {
    logger.error(`Stratz GraphQL Query Error: ${error.message}`);
    logger.error("Details:", error.errors);
  }

  // 4. 捕获普通网络错误
  else if (error instanceof NetworkError) {
    let output = `A network error occurred: ${error.message}\n`;

    if (error.cause && axios.isAxiosError(error.cause)) {
      output += `Details: ${error.cause.message}. Response: ${JSON.stringify(error.cause.response?.data)}\n`;
    }
    output += error.stack; // 只打印 NetworkError 的 stack

    // 遵循降噪配置
    const logLevel = config.suppressApiNetworkErrors || config.suppressStratzNetworkErrors ? "debug" : "error";
    logger[logLevel](output);
  }

  // 5. 捕获所有其他意外错误
  else {
    let output = "An unexpected error was thrown:\n";
    if (error instanceof Error && error.stack) {
      output += error.stack;
    } else {
      output += inspect(error, { depth: null });
    }
    logger.error(output);
  }
}
