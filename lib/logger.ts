type LogContext = Record<string, string | number | boolean | null | undefined>;

function serializeContext(context?: LogContext) {
  if (!context) return "";

  return Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");
}

function log(level: "info" | "warn" | "error", scope: string, message: string, context?: LogContext) {
  const suffix = serializeContext(context);
  const output = suffix ? `[${scope}] ${message} ${suffix}` : `[${scope}] ${message}`;

  if (level === "info") {
    console.info(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.error(output);
}

export const logger = {
  info: (scope: string, message: string, context?: LogContext) =>
    log("info", scope, message, context),
  warn: (scope: string, message: string, context?: LogContext) =>
    log("warn", scope, message, context),
  error: (scope: string, message: string, context?: LogContext) =>
    log("error", scope, message, context),
};
