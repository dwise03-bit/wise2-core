import http from 'node:http';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { loadConfig } from './config.js';
import { authorize } from './auth.js';
import { runCommand, boundedText } from './lib/exec.js';
import { appendAudit, readAudit } from './lib/audit.js';
import { getServiceLogs, listServices, restartService } from './adapters/docker.js';

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function probe(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'manual' });
    return { ok: response.ok || (response.status >= 300 && response.status < 400), status: response.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, error: boundedText(error.message, 300), latencyMs: Date.now() - started };
  }
}

export function createHandler(config) {
  return async (req, res) => {
    const requestId = randomUUID();
    const timestamp = new Date().toISOString();
    if (!authorize(req.headers.authorization, config.authToken)) return send(res, 401, { ok: false, requestId, timestamp, error: { code: 'UNAUTHORIZED', message: 'Valid bearer token required' } });
    const url = new URL(req.url, 'http://localhost');
    const action = `${req.method} ${url.pathname}`;
    try {
      let data;
      if (req.method === 'GET' && url.pathname === '/v1/control/health') data = { service: 'wise2-control-bridge', status: 'ok', writeEnabled: config.writeEnabled };
      else if (req.method === 'GET' && url.pathname === '/v1/control/host/metrics') data = { hostname: os.hostname(), uptimeSeconds: os.uptime(), loadAverage: os.loadavg(), memory: { total: os.totalmem(), free: os.freemem() } };
      else if (req.method === 'GET' && url.pathname === '/v1/control/host/gpu') {
        const r = await runCommand('/usr/bin/nvidia-smi', ['--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu', '--format=csv,noheader,nounits'], { timeoutMs: 5000 });
        data = { available: r.code === 0, output: r.code === 0 ? r.stdout.trim() : null };
      }
      else if (req.method === 'GET' && url.pathname === '/v1/control/docker/services') data = await listServices(config);
      else if (req.method === 'GET' && url.pathname.match(/^\/v1\/control\/docker\/[^/]+\/logs$/)) {
        const service = decodeURIComponent(url.pathname.split('/')[4]);
        data = { service, logs: await getServiceLogs(config, service, url.searchParams.get('lines')) };
      }
      else if (req.method === 'POST' && url.pathname.match(/^\/v1\/control\/docker\/[^/]+\/restart$/)) {
        const service = decodeURIComponent(url.pathname.split('/')[4]);
        data = await restartService(config, service);
        await appendAudit(config.auditFile, { requestId, actor: 'api-token', action: 'restart', target: service, timestamp, ok: true });
      }
      else if (req.method === 'GET' && url.pathname === '/v1/control/git/revision') {
        const branch = await runCommand('/usr/bin/git', ['-C', config.repoPath, 'rev-parse', '--abbrev-ref', 'HEAD']);
        const sha = await runCommand('/usr/bin/git', ['-C', config.repoPath, 'rev-parse', 'HEAD']);
        data = { branch: branch.stdout.trim(), sha: sha.stdout.trim() };
      }
      else if (req.method === 'GET' && url.pathname === '/v1/control/git/status') {
        const r = await runCommand('/usr/bin/git', ['-C', config.repoPath, 'status', '--porcelain=v1']);
        data = { clean: !r.stdout.trim(), status: r.stdout.trim() };
      }
      else if (req.method === 'GET' && url.pathname === '/v1/control/ollama/status') data = await probe(config.ollamaUrl);
      else if (req.method === 'GET' && url.pathname === '/v1/control/ollama/models') {
        const r = await fetch(config.ollamaUrl, { signal: AbortSignal.timeout(5000) });
        data = r.ok ? await r.json() : { models: [], status: r.status };
      }
      else if (req.method === 'GET' && url.pathname === '/v1/control/hermes/status') data = await probe(config.hermesUrl);
      else if (req.method === 'GET' && url.pathname === '/v1/control/web/wise2') data = await probe(config.wise2Url);
      else if (req.method === 'GET' && url.pathname === '/v1/control/audit') data = await readAudit(config.auditFile, Number(url.searchParams.get('limit') ?? 100));
      else return send(res, 404, { ok: false, requestId, action, timestamp, error: { code: 'NOT_FOUND', message: 'Control route not found' } });
      return send(res, 200, { ok: true, requestId, action, timestamp, data });
    } catch (error) {
      if (req.method !== 'GET') await appendAudit(config.auditFile, { requestId, actor: 'api-token', action, timestamp, ok: false, error: error.code ?? 'CONTROL_ERROR' }).catch(() => {});
      const status = error.code === 'SERVICE_NOT_ALLOWED' ? 403 : error.code === 'WRITE_DISABLED' ? 409 : 500;
      return send(res, status, { ok: false, requestId, action, timestamp, error: { code: error.code ?? 'CONTROL_ERROR', message: boundedText(error.message, 500) } });
    }
  };
}

if (process.env.NODE_ENV !== 'test') {
  const config = loadConfig();
  http.createServer(createHandler(config)).listen(config.port, config.host, () => console.log(`WISE2 control bridge listening on ${config.host}:${config.port}`));
}
