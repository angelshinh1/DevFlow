import "server-only";
import pino, { type Logger } from "pino";

/**
 * Structured logging. Pretty-printed in development, JSON in production so it
 * drops cleanly into a log aggregator. Use child loggers (`log.child({ ... })`)
 * to bind request/route context.
 */
const isDev = process.env.NODE_ENV !== "production";
const level = process.env.LOG_LEVEL ?? (isDev ? "debug" : "info");

export const logger: Logger = pino({
  level,
  base: { service: "devflow" },
  redact: {
    paths: [
      "*.access_token",
      "*.refresh_token",
      "*.provider_token",
      "*.authorization",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[redacted]",
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service" },
        },
      }
    : {}),
});

/** Convenience for tagging a logger with a stable component name. */
export function childLogger(component: string, bindings: Record<string, unknown> = {}): Logger {
  return logger.child({ component, ...bindings });
}
