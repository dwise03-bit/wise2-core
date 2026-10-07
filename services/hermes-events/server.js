'use strict';

const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = parseInt(process.env.HERMES_EVENTS_PORT || '3014', 10);
const BIND = process.env.HERMES_EVENTS_BIND || '127.0.0.1';
const EVENTS_SECRET = process.env.HERMES_EVENTS_SECRET || '';
const MAX_BODY_BYTES = 64 * 1024;
const RECENT_CAP = 200;

const recent = [];
const clients = new Set();

function emit(event) {
  const frame = JSON.stringify(event);
  recent.push(event);
  while (recent.length > RECENT_CAP) recent.shift();
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(frame); } catch { /* drop */ }
    }
  }
}

function emitSystem(status, note) {
  emit({
    event_type: 'system.heartbeat',
    source: 'hermes-events',
    status,
    note,
    ts: new Date().toISOString(),
  });
}

function readJson(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, clients: clients.size, recent: recent.length });
  }
  if (req.method === 'GET' && req.url === '/recent') {
    return send(res, 200, { events: recent });
  }
  if (req.method === 'POST' && req.url === '/ingest') {
    if (!EVENTS_SECRET) return send(res, 503, { error: 'secret-not-configured' });
    const key = req.headers['x-events-key'];
    if (key !== EVENTS_SECRET) return send(res, 401, { error: 'bad-key' });
    let body;
    try {
      body = await readJson(req, MAX_BODY_BYTES);
    } catch (err) {
      return send(res, 400, { error: 'bad-json', detail: err.message });
    }
    if (!body || typeof body.event_type !== 'string') {
      return send(res, 400, { error: 'missing-event_type' });
    }
    const normalized = { ...body, ts: body.ts || new Date().toISOString() };
    emit(normalized);
    return send(res, 202, { accepted: true });
  }
  send(res, 404, { error: 'not-found' });
});

const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_BODY_BYTES });

server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/brain-stream') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    clients.add(ws);
    for (const event of recent) {
      try { ws.send(JSON.stringify(event)); } catch { /* drop */ }
    }
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => { try { ws.close(); } catch { /* noop */ } });
  });
});

const heartbeat = setInterval(() => emitSystem('alive', 'periodic'), 15000);
heartbeat.unref();

function shutdown(signal) {
  emitSystem('shutting-down', signal);
  clearInterval(heartbeat);
  for (const ws of clients) { try { ws.close(1001, 'shutdown'); } catch { /* noop */ } }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.listen(PORT, BIND, () => {
  console.log(`[hermes-events] listening on ${BIND}:${PORT}`);
  console.log(`[hermes-events] secret configured: ${EVENTS_SECRET ? 'yes' : 'NO (ingest will 503)'}`);
  emitSystem('started', `${BIND}:${PORT}`);
});
