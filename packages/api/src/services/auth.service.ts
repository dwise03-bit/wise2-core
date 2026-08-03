import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Authentication Service
 * JWT generation, validation, and user session management
 */

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface DecodedToken extends AuthToken {
  iat: number;
  exp: number;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: AuthToken): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'wise2-api',
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate magic link token (for passwordless auth)
 */
export function generateMagicToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return token;
}

/**
 * Hash password
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

/**
 * Compare password
 */
export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Extract token from authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * Create session data
 */
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  lastActive: Date;
}

export function createSession(user: any): SessionData {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    permissions: user.permissions || ['read'],
    lastActive: new Date(),
  };
}
