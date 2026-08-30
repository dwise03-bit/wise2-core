/**
 * @deprecated Use sencere-auth.server.ts (JWT) and sencere-auth-cookies.ts (browser cookies).
 * Client-side JWT signing removed for security.
 */
export type { SenCereToken } from './sencere-auth.server';
export { createSenCereToken as createToken, verifySenCereToken as verifyToken } from './sencere-auth.server';
export { getTokenFromCookie, setTokenCookie, clearTokenCookie } from './sencere-auth-cookies';
