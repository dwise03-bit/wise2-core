#!/usr/bin/env node
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import fs, { existsSync, mkdirSync, readFileSync } from 'node:fs';
import fsp from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ENV = process.env;
const PORT = Number(ENV.WISE2_BIG_BYTE_PORT || ENV.WISE2_LOCAL_PORT || ENV.PORT || 8787);
const NODE_ID = ENV.WISE2_NODE_ID || crypto.randomUUID();
const NODE_NAME = ENV.WISE2_NODE_NAME || os.hostname();
const DEVICE_PROFILE = ENV.WISE2_DEVICE_PROFILE || 'Big Byte';
const DEVICE_CLASS = ENV.WISE2_DEVICE_CLASS || 'raspberry-pi';
const PLATFORM = ENV.WISE2_PLATFORM || 'WISE2';
const ENVIRONMENT = ENV.WISE2_ENVIRONMENT || 'production-big-byte';
const API_URL = ENV.WISE2_API_URL || 'https://api.wise2.net';
const COMMAND_URL = ENV.WISE2_COMMAND_URL || 'https://command.wise2.net';
const SITE_URL = ENV.WISE2_SITE_URL || 'https://wise2.net';
const BIG_BYTE_URL = ENV.WISE2_BIG_BYTE_URL || ENV.WISE2_LOCAL_URL || `http://127.0.0.1:${PORT}`;
const OFFLINE_MODE = String(ENV.WISE2_OFFLINE_MODE || 'true') === 'true';
const SYNC_ENABLED = String(ENV.WISE2_SYNC_ENABLED || 'true') === 'true';
const HEARTBEAT_INTERVAL_MS = Number(ENV.WISE2_HEARTBEAT_INTERVAL_MS || 30000);
const HEALTH_INTERVAL_MS = Number(ENV.WISE2_HEALTH_INTERVAL_MS || 10000);
const TENANT_ID = ENV.WISE2_TENANT_ID || '';
const DEVICE_TOKEN = ENV.WISE2_DEVICE_TOKEN || '';
const NODE_JSON_PATH = ENV.WISE2_NODE_JSON || '/etc/wise2/node.json';
const STATE_DIR = ENV.WISE2_BIG_BYTE_STATE_DIR || '/opt/wise2/big-byte/state';
const QUEUE_DIR = ENV.WISE2_BIG_BYTE_QUEUE_DIR || '/opt/wise2/big-byte/queue';
const STATE_FILE = path.join(STATE_DIR, 'status.json');

let previousCpu = sampleCpu();
let latestHealth = null;
let latestTelemetry = null;
let nodeRecord = null;
let lastHeartbeatAt = null;
let lastHeartbeatError = null;

function log(level, message, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'wise2-big-byte',
    nodeId: NODE_ID,
    message,
    ...(details ? { details } : {}),
  };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o750 });
}

async function ensureIdentity() {
  ensureDir(path.dirname(NODE_JSON_PATH));
  ensureDir(STATE_DIR);
  ensureDir(QUEUE_DIR);

  try {
    const raw = await fsp.readFile(NODE_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.nodeId) return parsed;
  } catch {}

  const record = {
    platform: PLATFORM,
    role: 'big-byte-command-node',
    deviceClass: DEVICE_CLASS,
    profile: DEVICE_PROFILE,
    environment: ENVIRONMENT,
    nodeId: NODE_ID,
    nodeName: NODE_NAME,
    createdAt: new Date().toISOString(),
  };
  await fsp.writeFile(NODE_JSON_PATH, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o640 });
  return record;
}

function sampleCpu() {
  try {
    const line = readFileSync('/proc/stat', 'utf8').split('\n')[0];
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    const idle = (parts[3] || 0) + (parts[4] || 0);
    const total = parts.reduce((sum, n) => sum + n, 0);
    return { idle, total };
  } catch {
    return { idle: 0, total: 0 };
  }
}

function cpuUsage() {
  const current = sampleCpu();
  const totalDelta = current.total - previousCpu.total;
  const idleDelta = current.idle - previousCpu.idle;
  previousCpu = current;
  if (totalDelta <= 0) return 0;
  return Number((((totalDelta - idleDelta) / totalDelta) * 100).toFixed(1));
}

function parseMeminfo() {
  const data = {};
  try {
    const text = readFileSync('/proc/meminfo', 'utf8');
    for (const line of text.split('\n')) {
      const [key, value] = line.split(':');
      if (!key || !value) continue;
      data[key.trim()] = Number.parseInt(value.trim(), 10);
    }
  } catch {}
  return data;
}

async function execCmd(cmd, args, timeoutMs = 3000) {
  try {
    const result = await execFileAsync(cmd, args, { timeout: timeoutMs, maxBuffer: 1024 * 1024 });
    return { ok: true, stdout: String(result.stdout || '').trim() };
  } catch {
    return { ok: false, stdout: '' };
  }
}

async function probe(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const startedAt = Date.now();
    const response = await fetch(url, { signal: controller.signal });
    return {
      status: response.ok ? 'online' : 'degraded',
      reachable: true,
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return { status: 'offline', reachable: false, latencyMs: null };
  } finally {
    clearTimeout(timer);
  }
}

async function collectTelemetry() {
  const mem = parseMeminfo();
  const [api, command, site, tailscale, bluetooth, temp, defaultRoute] = await Promise.all([
    probe(`${API_URL.replace(/\/$/, '')}/health`),
    probe(`${COMMAND_URL.replace(/\/$/, '')}/api/health`),
    probe(SITE_URL),
    execCmd('tailscale', ['status', '--json'], 3500),
    execCmd('bluetoothctl', ['show'], 2500),
    execCmd('vcgencmd', ['measure_temp'], 1500),
    execCmd('sh', ['-lc', "ip route show default 2>/dev/null | head -1"], 1500),
  ]);

  let temperatureC = null;
  const tempRaw = await fsp.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8').catch(() => '');
  if (tempRaw) {
    const parsed = Number.parseInt(tempRaw.trim(), 10);
    if (!Number.isNaN(parsed)) temperatureC = Number((parsed / 1000).toFixed(1));
  } else if (temp.ok) {
    const match = temp.stdout.match(/temp=([0-9.]+)/);
    if (match) temperatureC = Number.parseFloat(match[1]);
  }

  const addresses = Object.entries(os.networkInterfaces()).flatMap(([name, items]) =>
    (items || [])
      .filter((item) => !item.internal)
      .map((item) => ({ interface: name, family: item.family, address: item.address, mac: item.mac }))
  );

  const memory = {
    totalMb: Math.round((mem.MemTotal || 0) / 1024),
    usedMb: Math.round(((mem.MemTotal || 0) - (mem.MemAvailable || 0)) / 1024),
    availableMb: Math.round((mem.MemAvailable || 0) / 1024),
    swapTotalMb: Math.round((mem.SwapTotal || 0) / 1024),
    swapUsedMb: Math.round(((mem.SwapTotal || 0) - (mem.SwapFree || 0)) / 1024),
  };

  const telemetry = {
    timestamp: new Date().toISOString(),
    nodeId: NODE_ID,
    nodeName: NODE_NAME,
    deviceProfile: DEVICE_PROFILE,
    deviceClass: DEVICE_CLASS,
    uptimeSeconds: Math.floor(os.uptime()),
    cpuUsage: cpuUsage(),
    cpuTemperatureC: temperatureC,
    memory,
    network: {
      addresses,
      defaultRoute: defaultRoute.ok ? defaultRoute.stdout : '',
    },
    tailscale: {
      running: tailscale.ok,
      raw: tailscale.stdout || '',
    },
    bluetooth: {
      available: bluetooth.ok,
      raw: bluetooth.stdout || '',
    },
    connectivity: {
      api,
      command,
      site,
    },
    queue: {
      pending: await fsp.readdir(QUEUE_DIR).then((items) => items.length).catch(() => 0),
    },
    power: {
      undervoltage: false,
    },
    sync: {
      enabled: SYNC_ENABLED,
      offlineMode: OFFLINE_MODE,
      lastHeartbeatAt,
      lastHeartbeatError,
    },
    tenant: { id: TENANT_ID || null },
  };

  latestTelemetry = telemetry;
  return telemetry;
}

function deriveStatus(telemetry) {
  const checks = [telemetry.connectivity.api.status, telemetry.connectivity.command.status, telemetry.connectivity.site.status];
  if (checks.every((s) => s === 'online')) return 'online';
  if (checks.some((s) => s === 'offline')) return 'offline';
  return 'degraded';
}

async function persistState() {
  if (!latestHealth) return;
  await fsp.writeFile(
    STATE_FILE,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), node: nodeRecord, health: latestHealth, telemetry: latestTelemetry }, null, 2)}\n`,
    { mode: 0o640 }
  ).catch(() => {});
}

async function buildHealth() {
  const telemetry = latestTelemetry || (await collectTelemetry());
  const status = deriveStatus(telemetry);
  latestHealth = {
    status,
    service: 'wise2-big-byte',
    node: {
      id: NODE_ID,
      name: NODE_NAME,
      profile: DEVICE_PROFILE,
      deviceClass: DEVICE_CLASS,
      platform: PLATFORM,
      environment: ENVIRONMENT,
    },
    urls: {
      api: API_URL,
      command: COMMAND_URL,
      site: SITE_URL,
      bigByte: BIG_BYTE_URL,
    },
    telemetry,
    updatedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - os.uptime() * 1000).toISOString(),
  };
  await persistState();
  return latestHealth;
}

function textResponse(res, code, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'content-type': contentType, 'cache-control': 'no-store' });
  res.end(body);
}

function jsonResponse(res, code, body) {
  textResponse(res, code, `${JSON.stringify(body, null, 2)}\n`, 'application/json; charset=utf-8');
}

function offlineHtml(health) {
  const color = health.status === 'online' ? '#34d399' : health.status === 'degraded' ? '#fbbf24' : '#fb7185';
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WISE² Big Byte</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(180deg,#05070e,#0b1020);color:#edf4ff;font-family:system-ui,sans-serif}
.card{width:min(920px,92vw);padding:32px;border-radius:24px;background:rgba(8,14,27,.92);border:1px solid rgba(125,211,252,.15);box-shadow:0 24px 80px rgba(0,0,0,.45)}
.dot{display:inline-block;width:12px;height:12px;border-radius:999px;background:${color};box-shadow:0 0 16px ${color}}
h1{margin:0;font-size:clamp(32px,6vw,56px)}
p{color:#a4b4d0;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:20px}
.tile{padding:14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.label{text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:#9bb0cf}
.value{margin-top:8px;font-weight:700;font-size:18px}
</style></head>
<body><main class="card">
<div class="label">WISE² Big Byte</div>
<h1><span class="dot"></span> ${health.status.toUpperCase()}</h1>
<p>Command Center and backend connectivity will retry automatically while the local appliance remains available.</p>
<div class="grid">
<div class="tile"><div class="label">Node</div><div class="value">${NODE_NAME}</div></div>
<div class="tile"><div class="label">Profile</div><div class="value">${DEVICE_PROFILE}</div></div>
<div class="tile"><div class="label">Queue</div><div class="value">${health.telemetry.queue.pending} pending</div></div>
<div class="tile"><div class="label">Tailscale</div><div class="value">${health.telemetry.tailscale.running ? 'Running' : 'Unavailable'}</div></div>
</div>
</main></body></html>`;
}

async function postHeartbeat() {
  if (!DEVICE_TOKEN) return;
  try {
    const health = latestHealth || (await buildHealth());
    const payload = {
      deviceId: NODE_ID,
      status: health.status,
      nodeId: NODE_ID,
      nodeName: NODE_NAME,
      tenantId: TENANT_ID || null,
      cpu: health.telemetry.cpuUsage,
      memMb: health.telemetry.memory.usedMb,
      tempC: health.telemetry.cpuTemperatureC,
      uptime: health.telemetry.uptimeSeconds,
      telemetry: health.telemetry,
      connectivity: health.telemetry.connectivity,
      sync: health.telemetry.sync,
      providerStatus: {
        api: health.telemetry.connectivity.api.status,
        command: health.telemetry.connectivity.command.status,
      },
      alerts: [
        health.telemetry.connectivity.api.status !== 'online' ? 'API degraded' : null,
        health.telemetry.connectivity.command.status !== 'online' ? 'Command Center degraded' : null,
      ].filter(Boolean),
    };

    const response = await fetch(`${COMMAND_URL.replace(/\/$/, '')}/api/big-byte/heartbeat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-big-byte-key': DEVICE_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`heartbeat status ${response.status}`);
    lastHeartbeatAt = new Date().toISOString();
    lastHeartbeatError = null;
  } catch (error) {
    lastHeartbeatError = error?.message || String(error);
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(302, { location: '/offline' });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/offline') {
    const health = latestHealth || (await buildHealth());
    return textResponse(res, 200, offlineHtml(health), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return jsonResponse(res, 200, await buildHealth());
  }

  if (req.method === 'GET' && url.pathname === '/status') {
    return jsonResponse(res, 200, {
      ...(await buildHealth()),
      lastHeartbeatAt,
      lastHeartbeatError,
      node: nodeRecord,
    });
  }

  if (req.method === 'GET' && url.pathname === '/telemetry') {
    return jsonResponse(res, 200, latestTelemetry || (await collectTelemetry()));
  }

  if (req.method === 'GET' && url.pathname === '/sync/status') {
    const telemetry = latestTelemetry || (await collectTelemetry());
    return jsonResponse(res, 200, { enabled: SYNC_ENABLED, offlineMode: OFFLINE_MODE, queue: telemetry.queue, lastHeartbeatAt, lastHeartbeatError });
  }

  if (req.method === 'POST' && url.pathname === '/heartbeat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const parsed = JSON.parse(body || '{}');
      lastHeartbeatAt = new Date().toISOString();
      nodeRecord = { ...nodeRecord, lastHeartbeat: parsed };
      await persistState();
      return jsonResponse(res, 200, { ok: true, nodeId: NODE_ID, receivedAt: lastHeartbeatAt });
    } catch {
      return jsonResponse(res, 400, { error: 'invalid_json' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/config') {
    return jsonResponse(res, 200, { node: nodeRecord, urls: { api: API_URL, command: COMMAND_URL, site: SITE_URL, bigByte: BIG_BYTE_URL } });
  }

  return jsonResponse(res, 404, { error: 'not_found' });
}

async function main() {
  nodeRecord = await ensureIdentity();
  await buildHealth();
  await postHeartbeat();

  setInterval(() => buildHealth().catch((error) => log('error', 'health_refresh_failed', { error: error.message })), HEALTH_INTERVAL_MS).unref();
  setInterval(() => postHeartbeat().catch((error) => log('error', 'heartbeat_failed', { error: error.message })), HEARTBEAT_INTERVAL_MS).unref();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      log('error', 'request_failed', { error: error.message, url: req.url, method: req.method });
      jsonResponse(res, 500, { error: 'internal_error' });
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    log('info', 'wise2_big_byte_started', { port: PORT, nodeId: NODE_ID, nodeName: NODE_NAME });
  });

  const shutdown = async (signal) => {
    log('info', 'shutdown_requested', { signal });
    try { await buildHealth(); } catch {}
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  log('error', 'fatal_startup_error', { error: error.message });
  process.exit(1);
});
