/**
 * Error Handler
 * Unified error response formatting
 */

import { Request, Response } from 'express';
import { logger } from '../logger';

interface ErrorResponse {
  error: string;
  message: string;
  requestId: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  /**
   * Handle and format errors
   */
  handleError(error: any, req: Request, res: Response): void {
    const statusCode = this.getStatusCode(error);
    const message = this.getMessage(error);
    const errorType = this.getErrorType(error);

    const errorResponse: ErrorResponse = {
      error: errorType,
      message,
      requestId: req.id,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    // Include details in development mode
    if (process.env.NODE_ENV === 'development' && error.stack) {
      errorResponse.details = {
        stack: error.stack,
        originalError: error.toString(),
      };
    }

    // Log error
    this.logError(error, req, statusCode);

    // Send response
    res.status(statusCode).json(errorResponse);
  }

  /**
   * Get HTTP status code from error
   */
  private getStatusCode(error: any): number {
    if (error.statusCode) {
      return error.statusCode;
    }

    if (error.status) {
      return error.status;
    }

    if (error.response?.status) {
      return error.response.status;
    }

    const message = error.message || '';

    if (message.includes('Unauthorized')) {
      return 401;
    }

    if (message.includes('Forbidden')) {
      return 403;
    }

    if (message.includes('Not Found')) {
      return 404;
    }

    if (message.includes('Rate limit')) {
      return 429;
    }

    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return 504;
    }

    if (message.includes('validation') || message.includes('required')) {
      return 400;
    }

    return 500;
  }

  /**
   * Get error message
   */
  private getMessage(error: any): string {
    if (error.message) {
      return error.message;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.statusText) {
      return error.response.statusText;
    }

    return 'Internal Server Error';
  }

  /**
   * Get error type
   */
  private getErrorType(error: any): string {
    if (error.name) {
      return error.name;
    }

    const message = error.message || '';

    if (message.includes('Unauthorized')) {
      return 'UnauthorizedError';
    }

    if (message.includes('Forbidden')) {
      return 'ForbiddenError';
    }

    if (message.includes('Not Found')) {
      return 'NotFoundError';
    }

    if (message.includes('Rate limit')) {
      return 'RateLimitError';
    }

    if (message.includes('timeout')) {
      return 'TimeoutError';
    }

    if (message.includes('validation')) {
      return 'ValidationError';
    }

    if (error.response?.status === 503) {
      return 'ServiceUnavailableError';
    }

    return 'InternalServerError';
  }

  /**
   * Log error details
   */
  private logError(error: any, req: Request, statusCode: number): void {
    const context = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (statusCode >= 500) {
      logger.error('Server error', { error, context });
    } else if (statusCode >= 400) {
      logger.warn('Client error', { error: error.message, context });
    } else {
      logger.info('Request completed with error', { error: error.message, context });
    }
  }

  /**
   * Validate request body against schema
   */
  validateRequestBody(body: any, schema: any): string[] {
    const errors: string[] = [];

    if (schema.required) {
      schema.required.forEach((field: string) => {
        if (!(field in body)) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        if (key in body && body[key] !== null && body[key] !== undefined) {
          if (prop.type && typeof body[key] !== prop.type) {
            errors.push(
              `Invalid type for field '${key}': expected ${prop.type}, got ${typeof body[key]}`
            );
          }

          if (prop.minLength && body[key].length < prop.minLength) {
            errors.push(
              `Field '${key}' is too short (minimum ${prop.minLength} characters)`
            );
          }

          if (prop.maxLength && body[key].length > prop.maxLength) {
            errors.push(
              `Field '${key}' is too long (maximum ${prop.maxLength} characters)`
            );
          }

          if (prop.pattern && !new RegExp(prop.pattern).test(body[key])) {
            errors.push(`Field '${key}' does not match required pattern`);
          }
        }
      });
    }

    return errors;
  }

  /**
   * Create validation error
   */
  createValidationError(errors: string[]): Error {
    const error = new Error('Validation failed');
    (error as any).statusCode = 400;
    (error as any).errors = errors;
    return error;
  }

  /**
   * Create authentication error
   */
  createAuthError(message: string = 'Authentication failed'): Error {
    const error = new Error(message);
    (error as any).statusCode = 401;
    return error;
  }

  /**
   * Create authorization error
   */
  createAuthzError(message: string = 'Insufficient permissions'): Error {
    const error = new Error(message);
    (error as any).statusCode = 403;
    return error;
  }

  /**
   * Create not found error
   */
  createNotFoundError(message: string = 'Not found'): Error {
    const error = new Error(message);
    (error as any).statusCode = 404;
    return error;
  }

  /**
   * Create rate limit error
   */
  createRateLimitError(retryAfter: number): Error {
    const error = new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    (error as any).statusCode = 429;
    (error as any).retryAfter = retryAfter;
    return error;
  }

  /**
   * Create service unavailable error
   */
  createServiceError(serviceName: string): Error {
    const error = new Error(`Service ${serviceName} is unavailable`);
    (error as any).statusCode = 503;
    (error as any).serviceName = serviceName;
    return error;
  }

  /**
   * Create timeout error
   */
  createTimeoutError(operation: string = 'Operation'): Error {
    const error = new Error(`${operation} timed out`);
    (error as any).statusCode = 504;
    return error;
  }
}

export default ErrorHandler;
