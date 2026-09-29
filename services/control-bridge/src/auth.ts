import { timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ControlConfig } from './types.js';

export function constantTimeTokenEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function extractBearer(header: unknown): string | null {
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export function buildAuthHook(config: ControlConfig) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (request.method === 'GET' && request.url === '/v1/control/health') return;
    const bearer = extractBearer(request.headers.authorization);
    if (!bearer || !constantTimeTokenEqual(bearer, config.token)) {
      await reply.code(401).send({
        ok: false,
        requestId: request.id,
        action: 'auth',
        timestamp: new Date().toISOString(),
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid bearer token' },
      });
    }
  };
}
