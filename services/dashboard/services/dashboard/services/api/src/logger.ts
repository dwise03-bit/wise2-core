/**
 * Structured logging with Winston
 * Handles all application logging
 */

import winston, { Logger, transports, format } from "winston";
import { config_ } from "./config";

const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  config_.logging.format === "json"
    ? format.json()
    : format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
        }`;
      }),
);

const winstonLogger: Logger = winston.createLogger({
  level: config_.logging.level,
  format: customFormat,
  defaultMeta: {
    service: "wise2-api",
    environment: config_.app.nodeEnv,
  },
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`;
        }),
      ),
    }),

    // File transport for errors
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // File transport for all logs
    new transports.File({
      filename: "logs/combined.log",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

interface LogContext {
  [key: string]: any;
}

class AppLogger {
  debug(message: string, context?: LogContext): void {
    winstonLogger.debug(message, context);
  }

  info(message: string, context?: LogContext): void {
    winstonLogger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    winstonLogger.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    winstonLogger.error(message, context);
  }

  getLogger(): Logger {
    return winstonLogger;
  }
}

export const logger = new AppLogger();
