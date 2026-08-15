/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
import { ApiError } from "./auth";

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Global error handler middleware
 * Must be registered after all other middleware and routes
 */
export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "An unexpected error occurred";
  let details: any = undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof SyntaxError && "body" in error) {
    // JSON parsing error
    statusCode = 400;
    code = "INVALID_REQUEST";
    message = "Invalid JSON in request body";
  } else {
    // Generic error
    logger.error("Unexpected error", {
      error: error.message,
      stack: error.stack,
      requestId: (req as any).requestId,
    });
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    },
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const error = new ApiError(
    `Route ${req.method} ${req.path} not found`,
    404,
    "NOT_FOUND",
  );
  errorHandler(error, req, res, _next);
}
