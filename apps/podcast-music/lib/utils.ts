import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, statusCode = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

export function errorResponse(
  error: unknown,
  defaultStatusCode = 500
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: defaultStatusCode }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: defaultStatusCode }
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateRandomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function extractUserIdFromHeaders(headers: Headers): string {
  const userId = headers.get('x-user-id');
  if (!userId) {
    throw new ApiError(401, 'User ID not found in headers', 'MISSING_USER_ID');
  }
  return userId;
}

export function extractUserFromHeaders(headers: Headers) {
  const userId = headers.get('x-user-id');
  const email = headers.get('x-user-email');
  const role = headers.get('x-user-role');

  if (!userId || !email) {
    throw new ApiError(401, 'User information not found in headers', 'MISSING_USER_INFO');
  }

  return { userId, email, role: role || 'CUSTOMER' };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
