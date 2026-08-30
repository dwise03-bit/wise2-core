import { jwtVerify, SignJWT } from 'jose';

export interface SenCereToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set for SenCere token signing in production');
    }
    return new TextEncoder().encode('sencere-dev-secret-local-only-not-for-production');
  }
  return new TextEncoder().encode(secret);
}

/** Server-only: never import from client components. */
export async function createSenCereToken(payload: SenCereToken): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(getJwtSecret());
}

/** Server-only: never import from client components. */
export async function verifySenCereToken(token: string): Promise<SenCereToken | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as SenCereToken;
  } catch {
    return null;
  }
}
