import { jwtVerify } from 'jose';

export interface Principal {
  id: string;
  email?: string;
  role?: string;
}

export async function verifyAccessToken(token: string, secret: string): Promise<Principal> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    algorithms: ['HS256'],
  });

  const id = typeof payload.userId === 'string'
    ? payload.userId
    : typeof payload.id === 'string'
      ? payload.id
      : null;

  if (!id) throw new Error('Token is missing user identity');

  return {
    id,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    role: typeof payload.role === 'string' ? payload.role : undefined,
  };
}

export function bearerToken(value?: string): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}
