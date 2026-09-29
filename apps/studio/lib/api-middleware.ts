/**
 * API Middleware Utilities
 * CORS, Authentication, Logging, and Error Handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserContext, ApiErrorResponse } from '@/types/api';
import jwt from 'jsonwebtoken';

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  error?: string;
}

class Logger {
  private logs: RequestLog[] = [];

  log(entry: RequestLog) {
    this.logs.push(entry);
    // In production, send to logging service
    console.log(
      `[${entry.timestamp}] ${entry.method} ${entry.path} - ${entry.statusCode || 'PENDING'} ${entry.duration ? `(${entry.duration}ms)` : ''}`
    );
    if (entry.error) {
      console.error(`  Error: ${entry.error}`);
    }
  }

  getLogs(): RequestLog[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

export function extractUserFromToken(
  request: NextRequest
): UserContext | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, jwtSecret) as UserContext;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAuth(user: UserContext | null): user is UserContext {
  return user !== null;
}

// ============================================================================
// CORS MIDDLEWARE
// ============================================================================

export function corsHeaders(): Record<string, string> {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  return null;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export function createErrorResponse(
  error: unknown,
  statusCode: number = 500
): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiException) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp,
        details: error.details,
      },
      {
        status: error.statusCode,
        headers: corsHeaders(),
      }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: error.message,
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp,
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }

  return NextResponse.json<ApiErrorResponse>(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      timestamp,
    },
    {
      status: 500,
      headers: corsHeaders(),
    }
  );
}

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateRequest(
  data: any,
  schema: ValidationSchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [key, rule] of Object.entries(schema)) {
    const value = data?.[key];

    // Check if required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[key] = `${key} is required`;
      continue;
    }

    // Skip validation if not provided and not required
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Check type
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors[key] = `${key} must be of type ${rule.type}`;
      continue;
    }

    // String validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors[key] = `${key} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors[key] = `${key} must be at most ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[key] = `${key} has invalid format`;
      }
    }

    // Number validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[key] = `${key} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[key] = `${key} must be at most ${rule.max}`;
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors[key] = `${key} must be one of ${rule.enum.join(', ')}`;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors[key] = `${key} failed custom validation`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers: corsHeaders(),
    }
  );
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

// ============================================================================
// REQUEST WRAPPER
// ============================================================================

export function withMiddleware(
  handler: (
    request: NextRequest,
    user: UserContext | null,
    params?: Record<string, string>
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, { params }: { params?: Record<string, string> }) => {
    const corsCheck = handleCorsPreFlight(request);
    if (corsCheck) return corsCheck;

    const startTime = Date.now();
    const user = extractUserFromToken(request);

    try {
      const response = await handler(request, user, params);

      const duration = Date.now() - startTime;
      logger.log({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        duration,
        userId: user?.id,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      logger.log({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.nextUrl.pathname,
        duration,
        userId: user?.id,
        error: errorMsg,
      });

      return createErrorResponse(error);
    }
  };
}
