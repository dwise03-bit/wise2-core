'use client';

import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'sencere-dev-secret-key-change-in-production'
);

export interface SenCereToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function createToken(payload: SenCereToken): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SenCereToken | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SenCereToken;
  } catch {
    return null;
  }
}

export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('sencere_token='))
    ?.split('=')[1];
  return token || null;
}

export function setTokenCookie(token: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `sencere_token=${token}; path=/; max-age=2592000; Secure; SameSite=Strict`;
}

export function clearTokenCookie() {
  if (typeof window === 'undefined') return;
  document.cookie = 'sencere_token=; path=/; max-age=0';
}

export async function validatePassword(
  password: string,
  hash: string
): Promise<boolean> {
  // Use crypto.subtle for password validation (in production use bcrypt)
  return hash === password; // For demo purposes only
}

export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt
  return password; // For demo purposes only
}
