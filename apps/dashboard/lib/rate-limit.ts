import { NextRequest, NextResponse } from 'next/server';

interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export function rateLimit(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  let limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    limit = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimits.set(ip, limit);
  }

  limit.count++;

  if (limit.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((limit.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - limit.count,
    resetTime: limit.resetTime,
  };
}

export function withRateLimit(handler: Function) {
  return async (request: NextRequest) => {
    const limit = rateLimit(request);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': limit.retryAfter.toString(),
          },
        }
      );
    }

    return handler(request);
  };
}
