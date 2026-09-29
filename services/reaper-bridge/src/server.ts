import http from 'node:http';
import { MockReaperAdapter, StudioService } from '../../discord-ecosystem/src/studio/contracts.js';

const host = process.env.WISE2_REAPER_BRIDGE_HOST ?? '127.0.0.1';
const port = Number(process.env.WISE2_REAPER_BRIDGE_PORT ?? 8787);
const token = process.env.WISE2_REAPER_BRIDGE_TOKEN;
if (!token) throw new Error('WISE2_REAPER_BRIDGE_TOKEN is required');
const studio = new StudioService(new MockReaperAdapter());

async function handler(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
  response.setHeader('Content-Type', 'application/json');
  if (request.headers.authorization !== `Bearer ${token}`) { response.writeHead(401); response.end(JSON.stringify({ error: 'Unauthorized' })); return; }
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);
  try {
    if (request.method === 'GET' && url.pathname === '/health') return send(response, 200, { status: 'ok' });
    if (request.method === 'GET' && url.pathname === '/reaper/status') return send(response, 200, await studio.status());
    if (request.method === 'GET' && url.pathname === '/reaper/project') return send(response, 200, await studio.project());
    if (request.method === 'GET' && url.pathname === '/reaper/tracks') return send(response, 200, await studio.tracks());
    const action = url.pathname.match(/^\/reaper\/(play|stop|pause|record)$/)?.[1] as 'play' | 'stop' | 'pause' | 'record' | undefined;
    if (request.method === 'POST' && action) return send(response, 200, await studio.transport(action));
    if (request.method === 'POST' && url.pathname === '/reaper/marker') { const body = await json(request); return send(response, 200, await studio.marker(String(body.name ?? ''))); }
    const track = url.pathname.match(/^\/reaper\/tracks\/(\d+)\/(mute|unmute|solo|unsolo|arm|disarm)$/);
    if (request.method === 'POST' && track) return send(response, 200, await studio.setTrack(Number(track[1]), track[2] as 'mute' | 'unmute' | 'solo' | 'unsolo' | 'arm' | 'disarm'));
    if (request.method === 'POST' && url.pathname === '/reaper/render') { const body = await json(request); return send(response, 200, await studio.render({ format: body.format === 'wav' ? 'wav' : 'mp3', kind: body.kind === 'master' ? 'master' : 'preview' })); }
    send(response, 404, { error: 'Not found' });
  } catch (error) { send(response, 400, { error: error instanceof Error ? error.message : 'Bad request' }); }
}
function send(response: http.ServerResponse, status: number, body: unknown): void { response.writeHead(status); response.end(JSON.stringify(body)); }
function json(request: http.IncomingMessage): Promise<Record<string, unknown>> { return new Promise((resolve, reject) => { let data = ''; request.on('data', chunk => { data += chunk; if (data.length > 10000) reject(new Error('Payload too large')); }); request.on('end', () => { try { resolve(JSON.parse(data || '{}') as Record<string, unknown>); } catch { reject(new Error('Invalid JSON')); } }); request.on('error', reject); }); }
http.createServer(handler).listen(port, host, () => console.log(`WISE² REAPER bridge listening on http://${host}:${port}`));
