import { SignJWT } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(getJwtSecret());

    return token;
  } catch (error) {
    console.error('JWT creation failed:', error);
    throw new Error('Failed to create JWT token');
  }
}

export function parseExpiresIn(expiresIn: string): number {
  const units = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    y: 31536000,
  };

  return (multipliers[units] || 1) * value;
}
