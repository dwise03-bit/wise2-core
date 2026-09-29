import { randomBytes } from "node:crypto";
import { AuthService } from "./auth.js";
import { MemoryUserRepository, PostgresUserRepository } from "./repositories.js";
export function createAuthRuntime({ env = process.env, repository, rounds } = {}) { if (env.NODE_ENV === "production" && !env.AUTH_SECRET) throw new Error("AUTH_SECRET is required in production."); if (env.NODE_ENV === "production" && !env.DATABASE_URL && !repository) throw new Error("DATABASE_URL is required in production."); const selected = repository || (env.DATABASE_URL ? new PostgresUserRepository(env.DATABASE_URL) : new MemoryUserRepository()); return { repository: selected, service: new AuthService({ repository: selected, secret: env.AUTH_SECRET || randomBytes(32).toString("hex"), rounds }) }; }
