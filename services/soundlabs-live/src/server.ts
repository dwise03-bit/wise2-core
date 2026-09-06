import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketServer } from 'socket.io';
import { z } from 'zod';
import { bearerToken, verifyAccessToken, type Principal } from './auth.js';
import { loadConfig } from './config.js';
import { createDatabase, healthcheck } from './db.js';
import { can } from './permissions.js';
import { LiveRepository } from './repository.js';
import type { LiveParticipantRole } from './domain.js';

const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);
const repo = new LiveRepository(db);
const app = Fastify({ logger: true, trustProxy: true });

await app.register(cors, { origin: config.CORS_ORIGIN.split(',').map((v) => v.trim()), credentials: true });

app.decorateRequest('principal', null);

declare module 'fastify' {
  interface FastifyRequest { principal: Principal | null }
}

app.addHook('preHandler', async (request, reply) => {
  if (request.url === '/health' || request.method === 'OPTIONS') return;
  const token = bearerToken(request.headers.authorization);
  if (!token) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  try {
    request.principal = await verifyAccessToken(token, config.JWT_SECRET);
  } catch {
    return reply.code(401).send({ error: 'UNAUTHORIZED' });
  }
});

app.get('/health', async (_request, reply) => {
  try {
    await healthcheck(db);
    return { service: 'soundlabs-live', status: 'healthy', database: 'connected' };
  } catch {
    return reply.code(503).send({ service: 'soundlabs-live', status: 'degraded', database: 'unavailable' });
  }
});

const OnboardSchema = z.object({
  projectName: z.string().trim().min(1).max(120),
  roomTitle: z.string().trim().min(1).max(120),
  crowdMode: z.enum(['WATCH_ONLY', 'GUIDED', 'CHAOS']).default('GUIDED'),
});

app.post('/v1/onboarding', async (request, reply) => {
  const parsed = OnboardSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_INPUT', details: parsed.error.flatten() });
  const result = await repo.createCustomerRoom({ ownerId: request.principal!.id, ...parsed.data });
  return reply.code(201).send(result);
});

app.get('/v1/sessions/:sessionId/snapshot', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const participant = await repo.getParticipant(sessionId, request.principal!.id);
  if (!participant) return reply.code(403).send({ error: 'FORBIDDEN' });
  const snapshot = await repo.getSnapshot(sessionId);
  if (!snapshot) return reply.code(404).send({ error: 'NOT_FOUND' });
  return snapshot;
});

const RoleSchema = z.object({ role: z.enum(['OWNER','CO_ARTIST','PRODUCER','GUEST','MODERATOR','VIEWER']) });
app.put('/v1/sessions/:sessionId/participants/:userId/role', async (request, reply) => {
  const { sessionId, userId } = request.params as { sessionId: string; userId: string };
  const actor = await repo.getParticipant(sessionId, request.principal!.id);
  if (!actor || !can(actor.role, 'manage_roles')) return reply.code(403).send({ error: 'FORBIDDEN' });
  const parsed = RoleSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_INPUT' });
  if (userId === request.principal!.id && parsed.data.role !== 'OWNER') return reply.code(409).send({ error: 'OWNER_ROLE_PROTECTED' });
  return repo.setRole(sessionId, userId, parsed.data.role as LiveParticipantRole);
});

const MessageSchema = z.object({ text: z.string().trim().min(1).max(2000) });
app.post('/v1/sessions/:sessionId/messages', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const actor = await repo.getParticipant(sessionId, request.principal!.id);
  if (!actor || !can(actor.role, 'chat')) return reply.code(403).send({ error: 'FORBIDDEN' });
  const parsed = MessageSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_INPUT' });
  const message = await repo.addMessage(sessionId, request.principal!.id, parsed.data.text);
  io.to(`session:${sessionId}`).emit('chat.message.created', message);
  return reply.code(201).send(message);
});

const io = new SocketServer(app.server, { cors: { origin: config.CORS_ORIGIN.split(',').map((v) => v.trim()), credentials: true } });
io.use(async (socket, next) => {
  const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : null;
  if (!token) return next(new Error('UNAUTHORIZED'));
  try {
    socket.data.principal = await verifyAccessToken(token, config.JWT_SECRET);
    next();
  } catch { next(new Error('UNAUTHORIZED')); }
});

io.on('connection', (socket) => {
  socket.on('session.join', async (sessionId: string, ack?: (value: unknown) => void) => {
    const principal = socket.data.principal as Principal;
    const participant = await repo.getParticipant(sessionId, principal.id);
    if (!participant) return ack?.({ ok: false, error: 'FORBIDDEN' });
    await socket.join(`session:${sessionId}`);
    const snapshot = await repo.getSnapshot(sessionId);
    socket.emit('session.snapshot', snapshot);
    socket.to(`session:${sessionId}`).emit('participant.joined', { userId: principal.id });
    ack?.({ ok: true });
  });
});

const shutdown = async () => {
  io.close();
  await app.close();
  await db.end();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ port: config.PORT, host: '0.0.0.0' });
