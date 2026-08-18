import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
test("production container is multi-stage, non-root, and health checked", () => { const dockerfile = read("Dockerfile"); assert.match(dockerfile, /FROM node:22-alpine AS build/); assert.match(dockerfile, /USER node/); assert.match(dockerfile, /HEALTHCHECK/); assert.match(dockerfile, /npm ci --omit=dev/); });
test("Compose isolates PostgreSQL and health-gates dependent services", () => { const compose = read("compose.yaml"); assert.match(compose, /internal: true/); assert.match(compose, /condition: service_healthy/g); assert.match(compose, /read_only: true/); assert.match(compose, /cap_drop: \[ALL\]/); assert.doesNotMatch(compose, /5432:5432/); });
test("edge proxy enables compression, reverse proxying, and HSTS", () => { const caddy = read("deploy/Caddyfile"); assert.match(caddy, /reverse_proxy app:8787/); assert.match(caddy, /encode zstd gzip/); assert.match(caddy, /Strict-Transport-Security/); });
test("backup is verified and restore fails closed", () => { const backup = read("deploy/backup.sh"), restore = read("deploy/restore.sh"); assert.match(backup, /pg_dump -Fc/); assert.match(backup, /pg_restore -l/); assert.match(backup, /test -s/); assert.match(restore, /--exit-on-error/); assert.match(restore, /RESTORE/); });
