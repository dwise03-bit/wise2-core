/**
 * Request logging middleware
 * Logs all incoming requests and outgoing responses
 */

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logger";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Assign request ID and start time
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  res.setHeader("X-Request-ID", req.requestId);
  next();
}

/**
 * Log request details
 */
export function requestLoggingMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  logger.debug("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  next();
}

/**
 * Log response details
 * Captures response status and duration
 */
export function responseLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Override res.json to capture the response body
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const duration = Date.now() - req.startTime;

    logger.info("Request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    return originalJson(body);
  };

  next();
}

/**
 * Log request errors
 */
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const duration = Date.now() - req.startTime;

  logger.error("Request error", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    duration_ms: duration,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  next(error);
}
