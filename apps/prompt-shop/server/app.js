import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createClaudeRouter } from "./routes/claude.js";
import { createVideoRouter } from "./routes/video.js";
import { createVideoRuntime } from "./video/createVideoRuntime.js";
import { createAuthRuntime } from "./auth/createAuthRuntime.js";
import { createAuthRouter, createUserStateRouter } from "./routes/auth.js";
import { createImageRouter } from "./routes/image.js";
import { LocalImageAdapter } from "./image/LocalImageAdapter.js";
import { createStripeBillingService } from "./billing/StripeBillingService.js";
import { createBillingRouter, createBillingWebhookRouter } from "./routes/billing.js";

export function createApp(options = {}) {
  const app = express();
  const authRuntime = options.authRuntime || createAuthRuntime();
  const production = process.env.NODE_ENV === "production";
  const imageOutputDir = process.env.GENERATED_IMAGE_DIR || path.resolve("data/generated-images");
  const imageAdapter = options.imageAdapter || new LocalImageAdapter({ baseUrl: process.env.LOCAL_IMAGE_API_URL, outputDir: imageOutputDir });
  const videoRuntime = options.videoRuntime || createVideoRuntime(undefined, { onProviderFailure: (job) => authRuntime.repository.refundVideoCredits(job.userId, job.reservedCostUsd) });
  const billing = options.billing || createStripeBillingService(authRuntime.repository);
  if (production) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" }, contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:", "blob:", "https:"], mediaSrc: ["'self'", "blob:", "https:"], connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"], frameAncestors: ["'none'"], upgradeInsecureRequests: production ? [] : null } } }));
  app.use((request, response, next) => { request.id = request.headers["x-request-id"] || randomUUID(); response.setHeader("X-Request-Id", request.id); if (production) { const started = Date.now(); response.on("finish", () => console.log(JSON.stringify({ level: "info", requestId: request.id, method: request.method, path: request.path, status: response.statusCode, durationMs: Date.now() - started }))); } next(); });
  app.use("/api/billing/webhook", createBillingWebhookRouter(billing));
  app.use(express.json({ limit: "64kb" }));
  app.use((request, response, next) => { if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return next(); const site = request.headers["sec-fetch-site"]; const origin = request.headers.origin; const expected = `${request.protocol}://${request.get("host")}`; if (site === "cross-site" || (origin && origin !== expected)) return response.status(403).json({ ok: false, error: { code: "CROSS_SITE_REQUEST", message: "Cross-site state changes are not allowed." } }); return next(); });
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));
  app.use("/api/auth", rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));
  app.get("/api/health", (_request, response) => response.json({ ok: true, service: "wise-touch-api" }));
  app.get("/api/ready", async (_request, response) => { try { await authRuntime.repository.health(); response.json({ ok: true, service: "wise-touch-api", database: "ready" }); } catch { response.status(503).json({ ok: false, error: { code: "NOT_READY", message: "Database is unavailable." } }); } });
  app.use("/api/auth", createAuthRouter(authRuntime, production));
  app.use("/api/user-state", createUserStateRouter(authRuntime));
  app.use("/api/billing", createBillingRouter(billing, authRuntime));
  app.use("/api/claude", createClaudeRouter(options.claude));
  app.use("/api/video", createVideoRouter(videoRuntime, { authRuntime, enabled: process.env.VIDEO_GENERATION_ENABLED === "true", globalMaxCostUsd: Number(process.env.VIDEO_GLOBAL_MAX_JOB_COST_USD || 2) }));
  app.use("/api/image", createImageRouter(imageAdapter, { authRuntime, billing }));
  app.use("/generated", express.static(imageOutputDir, { maxAge: "1y", immutable: true }));
  if (production) {
    const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
    app.use(express.static(dist, { index: false, maxAge: "1h" }));
    app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => response.sendFile(path.join(dist, "index.html")));
  }
  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.too.large") return response.status(413).json({ ok: false, error: { code: "REQUEST_TOO_LARGE", message: "Request body is too large." } });
    return response.status(400).json({ ok: false, error: { code: "INVALID_REQUEST", message: "Invalid request body." } });
  });
  return app;
}
