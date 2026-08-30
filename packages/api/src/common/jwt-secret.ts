import { ConfigService } from '@nestjs/config';

const DEV_FALLBACK = 'dev-secret-change-in-production-local-only';

/**
 * Returns JWT_SECRET or fails in production. Development may use a local fallback.
 */
export function resolveJwtSecret(configService?: ConfigService): string {
  const secret =
    configService?.get<string>('JWT_SECRET') ?? process.env.JWT_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be set to a random string of at least 32 characters in production',
    );
  }

  return DEV_FALLBACK;
}
