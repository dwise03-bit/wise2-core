import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { createAuthRuntime } from "../server/auth/createAuthRuntime.js";
import { MemoryUserRepository } from "../server/auth/repositories.js";

async function withServer(run) { const authRuntime = createAuthRuntime({ env: { AUTH_SECRET: "test-secret-at-least-32-characters-long" }, repository: new MemoryUserRepository(), rounds: 4 }); const server = createApp({ authRuntime }).listen(0, "127.0.0.1"); await new Promise((resolve) => server.once("listening", resolve)); try { await run(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((resolve) => server.close(resolve)); } }
test("security headers allow generated HTTPS media while blocking framing", async () => withServer(async (root) => { const response = await fetch(`${root}/api/health`); const csp = response.headers.get("content-security-policy"); assert.match(csp, /media-src 'self' blob: https:/); assert.match(csp, /frame-ancestors 'none'/); assert.ok(response.headers.get("x-request-id")); assert.equal(response.headers.get("x-powered-by"), null); }));
test("cross-site state changes are rejected before protected routes", async () => withServer(async (root) => { const response = await fetch(`${root}/api/user-state`, { method: "PUT", headers: { "Content-Type": "application/json", Origin: "https://attacker.example", "Sec-Fetch-Site": "cross-site" }, body: "{}" }); assert.equal(response.status, 403); assert.equal((await response.json()).error.code, "CROSS_SITE_REQUEST"); }));
test("readiness checks the persistence repository", async () => withServer(async (root) => { const response = await fetch(`${root}/api/ready`); assert.equal(response.status, 200); assert.equal((await response.json()).database, "ready"); }));
