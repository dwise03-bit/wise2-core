/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export class RouterError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details: any = {}
  ) {
    super(message);
    this.name = 'RouterError';
  }
}

/**
 * Global error handler
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const requestId = uuid();
  const timestamp = new Date().toISOString();

  console.error(`[${requestId}] Error:`, err);

  if (err instanceof RouterError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp,
        request_id: requestId,
      },
    });
    return;
  }

  // Generic error
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
      request_id: requestId,
    },
  });
}
