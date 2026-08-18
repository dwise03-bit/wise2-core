import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const publicUser = (u) => ({ id: u.id, email: u.email, displayName: u.displayName, createdAt: u.createdAt });
export class AuthService {
  constructor({ repository, secret, rounds = 12 }) { this.repository = repository; this.key = new TextEncoder().encode(secret); this.rounds = rounds; }
  validate({ email, password, displayName }, registering = false) { const e = String(email || "").trim().toLowerCase(); if (!emailPattern.test(e)) throw Object.assign(new Error("Enter a valid email address."), { status: 400, code: "INVALID_EMAIL" }); if (typeof password !== "string" || password.length < 10 || Buffer.byteLength(password) > 72) throw Object.assign(new Error("Password must be 10–72 bytes."), { status: 400, code: "INVALID_PASSWORD" }); const n = String(displayName || "").trim(); if (registering && (n.length < 2 || n.length > 60)) throw Object.assign(new Error("Display name must be 2–60 characters."), { status: 400, code: "INVALID_NAME" }); return { email: e, password, displayName: n }; }
  async register(input) { const v = this.validate(input, true); return this.repository.createUser({ ...v, passwordHash: await bcrypt.hash(v.password, this.rounds) }); }
  async login(input) { const v = this.validate(input); const u = await this.repository.findByEmail(v.email); if (!u || !(await bcrypt.compare(v.password, u.passwordHash))) throw Object.assign(new Error("Email or password is incorrect."), { status: 401, code: "INVALID_CREDENTIALS" }); return u; }
  async issue(u) { return new SignJWT({ email: u.email }).setProtectedHeader({ alg: "HS256" }).setSubject(u.id).setIssuer("wise-touch").setAudience("wise-touch-web").setIssuedAt().setExpirationTime("7d").sign(this.key); }
  async verify(token) { return (await jwtVerify(token, this.key, { issuer: "wise-touch", audience: "wise-touch-web", algorithms: ["HS256"], requiredClaims: ["sub", "exp"] })).payload; }
}
export function parseCookies(header = "") { return Object.fromEntries(header.split(";").map((x) => x.trim().split("=")).filter(([k, v]) => k && v).map(([k, v]) => [k, decodeURIComponent(v)])); }
export const authMiddleware = (service) => async (req, res, next) => { try { const token = parseCookies(req.headers.cookie).wt_session; if (!token) throw new Error(); const payload = await service.verify(token); const user = await service.repository.findById(payload.sub); if (!user) throw new Error(); req.user = user; next(); } catch { res.status(401).json({ ok: false, error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } }); } };
export const optionalAuthMiddleware = (service) => async (req, _res, next) => { try { const token = parseCookies(req.headers.cookie).wt_session; if (token) { const payload = await service.verify(token); req.user = await service.repository.findById(payload.sub); } } catch {} next(); };
