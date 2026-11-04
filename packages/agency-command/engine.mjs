import { createHash } from 'node:crypto';
import catalog from '../../config/agency-command/agents.json' with { type: 'json' };
const known = new Map(catalog.agents.map(a => [a.id, a]));
export function validateJob(job) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) throw Error('invalid job');
  for (const key of ['tenantId','agentId','eventId']) if (typeof job[key] !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(job[key])) throw Error('invalid '+key);
  if (!known.has(job.agentId)) throw Error('unknown agent');
  if (job.payload == null || typeof job.payload !== 'object' || Array.isArray(job.payload)) throw Error('invalid payload');
  if (JSON.stringify(job.payload).length > 65536) throw Error('payload too large');
  return known.get(job.agentId);
}
export function idempotencyKey(job) {
  validateJob(job);
  return createHash('sha256').update(JSON.stringify([job.tenantId,job.agentId,job.eventId])).digest('hex');
}
export function planJob(job, context = {}) {
  const agent = validateJob(job);
  if (context.tenantId !== job.tenantId) throw Error('tenant mismatch');
  const requirements = agent.requirements || [];
  const missing = requirements.filter(r => context.consents?.[r] !== true);
  if (missing.length) return { status:'blocked', reason:'missing-requirements', missing, key:idempotencyKey(job) };
  return { status: agent.approval === 'none' ? 'ready-for-adapter' : 'awaiting-approval', approval:agent.approval, provider:agent.provider, key:idempotencyKey(job) };
}
