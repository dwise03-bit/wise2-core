// Revenue OS — defensive normalizers.
//
// The API is built by a separate workstream, so these accept a few plausible
// key spellings and envelope shapes. The one hard rule: if a value is absent or
// unparseable, it becomes `null` and the UI renders a dash — never a fabricated
// number.

import {
  ActivityItem,
  AttributionResponse,
  AgentStatus,
  Kpis,
  Lead,
  MarketingRoiRow,
  PIPELINE_STAGES,
  PipelineColumn,
  PipelineStage,
  WorkforceAgent,
} from './types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Reads the first present key, tolerating snake_case / camelCase drift. */
function pick(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function str(v: unknown): string | null {
  if (typeof v === 'string' && v.trim() !== '') return v;
  if (typeof v === 'number') return String(v);
  return null;
}

/**
 * Unwraps `{ data: ... }`, `{ items: ... }`, `{ results: ... }` envelopes and
 * returns the array inside, or [] if there isn't one.
 */
function toArray(raw: unknown, ...keys: string[]): Record<string, unknown>[] {
  let candidate: unknown = raw;
  if (isRecord(raw)) {
    candidate =
      pick(raw, 'data', 'items', 'results', 'records', ...keys) ?? raw;
  }
  if (!Array.isArray(candidate)) return [];
  return candidate.filter(isRecord);
}

/** Unwraps a `{ data: {...} }` envelope down to the object of interest. */
function toObject(raw: unknown, ...keys: string[]): Record<string, unknown> {
  if (!isRecord(raw)) return {};
  const inner = pick(raw, 'data', 'result', ...keys);
  return isRecord(inner) ? inner : raw;
}

function toStage(v: unknown): PipelineStage | null {
  const s = str(v);
  if (!s) return null;
  const upper = s.toUpperCase().replace(/[\s-]+/g, '_');
  return (PIPELINE_STAGES as string[]).includes(upper)
    ? (upper as PipelineStage)
    : null;
}

const AGENT_STATUSES: AgentStatus[] = ['ONLINE', 'PAUSED', 'ERROR', 'NEEDS_CONFIG'];

function toAgentStatus(v: unknown): AgentStatus {
  const s = str(v);
  if (!s) return 'NEEDS_CONFIG';
  const upper = s.toUpperCase().replace(/[\s-]+/g, '_');
  if ((AGENT_STATUSES as string[]).includes(upper)) return upper as AgentStatus;
  // Common synonyms from a status field that wasn't designed for this UI.
  if (upper === 'ACTIVE' || upper === 'RUNNING' || upper === 'ENABLED') return 'ONLINE';
  if (upper === 'PAUSED' || upper === 'DISABLED' || upper === 'STOPPED') return 'PAUSED';
  if (upper === 'FAILED' || upper === 'FAULT') return 'ERROR';
  return 'NEEDS_CONFIG';
}

export function normalizeLeads(raw: unknown): Lead[] {
  return toArray(raw, 'leads').map((r, i) => ({
    id: str(pick(r, 'id', 'leadId', '_id')) ?? `lead-${i}`,
    customerName: str(pick(r, 'customerName', 'customer_name', 'name', 'contactName')),
    serviceNeed: str(pick(r, 'serviceNeed', 'service_need', 'service', 'need', 'jobType')),
    source: str(pick(r, 'source', 'channel', 'utmSource')),
    stage: toStage(pick(r, 'stage', 'status', 'pipelineStage')),
    aiStatus: str(pick(r, 'aiStatus', 'ai_status', 'agentStatus')),
    aiAgent: str(pick(r, 'aiAgent', 'ai_agent', 'assignedAgent', 'agent')),
    opportunityValue: num(
      pick(r, 'opportunityValue', 'opportunity_value', 'value', 'estimatedValue'),
    ),
    nextAction: str(pick(r, 'nextAction', 'next_action', 'nextStep')),
    nextActionAt: str(pick(r, 'nextActionAt', 'next_action_at', 'nextActionDue')),
    createdAt: str(pick(r, 'createdAt', 'created_at', 'created')),
  }));
}

export function normalizePipeline(raw: unknown): PipelineColumn[] {
  const rows = toArray(raw, 'pipeline', 'stages', 'columns');

  // Shape A: an array of { stage, count, value } rows.
  if (rows.length > 0) {
    const byStage = new Map<PipelineStage, PipelineColumn>();
    for (const r of rows) {
      const stage = toStage(pick(r, 'stage', 'name', 'status', 'key'));
      if (!stage) continue;
      byStage.set(stage, {
        stage,
        count: num(pick(r, 'count', 'total', 'leads')),
        value: num(pick(r, 'value', 'totalValue', 'opportunityValue')),
      });
    }
    if (byStage.size > 0) {
      return PIPELINE_STAGES.map(
        (stage) => byStage.get(stage) ?? { stage, count: null, value: null },
      );
    }
  }

  // Shape B: a keyed object, e.g. { NEW: 4, CONTACTING: { count, value } }.
  const obj = toObject(raw, 'pipeline', 'stages');
  const keyed = PIPELINE_STAGES.map<PipelineColumn>((stage) => {
    const entry =
      obj[stage] ?? obj[stage.toLowerCase()] ?? obj[stage.toLowerCase().replace(/_/g, '')];
    if (isRecord(entry)) {
      return {
        stage,
        count: num(pick(entry, 'count', 'total', 'leads')),
        value: num(pick(entry, 'value', 'totalValue')),
      };
    }
    return { stage, count: num(entry), value: null };
  });

  return keyed;
}

export function normalizeAgents(raw: unknown): WorkforceAgent[] {
  return toArray(raw, 'agents', 'workforce').map((r, i) => ({
    key: str(pick(r, 'key', 'id', 'slug', 'agent')) ?? `agent-${i}`,
    name: str(pick(r, 'name', 'label', 'title')) ?? 'Unnamed agent',
    status: toAgentStatus(pick(r, 'status', 'state', 'health')),
    detail: str(pick(r, 'detail', 'message', 'lastError', 'note', 'lastRunAt')),
    handledToday: num(pick(r, 'handledToday', 'handled_today', 'interactionsToday', 'count')),
  }));
}

function normalizeKpis(obj: Record<string, unknown>): Kpis {
  const k = isRecord(obj.kpis) ? obj.kpis : obj;
  return {
    revenueToday: num(pick(k, 'revenueToday', 'revenue_today', 'revenue')),
    newLeads: num(pick(k, 'newLeads', 'new_leads', 'leads')),
    booked: num(pick(k, 'booked', 'bookedCount', 'appointments')),
    openEstimateValue: num(
      pick(k, 'openEstimateValue', 'open_estimate_value', 'openEstimates'),
    ),
    closeRate: num(pick(k, 'closeRate', 'close_rate', 'conversionRate')),
    roas: num(pick(k, 'roas', 'ROAS', 'returnOnAdSpend')),
  };
}

function normalizeChannels(raw: unknown): MarketingRoiRow[] {
  return toArray(raw, 'channels', 'marketing', 'attribution').map((r, i) => ({
    channel: str(pick(r, 'channel', 'source', 'name')) ?? `Channel ${i + 1}`,
    spend: num(pick(r, 'spend', 'cost', 'adSpend')),
    leads: num(pick(r, 'leads', 'leadCount')),
    bookedRevenue: num(pick(r, 'bookedRevenue', 'booked_revenue', 'booked')),
    soldRevenue: num(pick(r, 'soldRevenue', 'sold_revenue', 'sold', 'revenue')),
    roas: num(pick(r, 'roas', 'ROAS')),
  }));
}

function normalizeActivity(raw: unknown): ActivityItem[] {
  return toArray(raw, 'activity', 'events', 'feed').map((r, i) => ({
    id: str(pick(r, 'id', 'eventId', '_id')) ?? `activity-${i}`,
    kind: str(pick(r, 'kind', 'type', 'event')) ?? 'unknown',
    message: str(pick(r, 'message', 'description', 'title', 'summary')) ?? '',
    actor: str(pick(r, 'actor', 'agent', 'user', 'by')),
    value: num(pick(r, 'value', 'amount', 'revenue')),
    at: str(pick(r, 'at', 'createdAt', 'created_at', 'timestamp', 'occurredAt')),
  }));
}

export function normalizeAttribution(raw: unknown): AttributionResponse {
  const obj = toObject(raw, 'attribution');
  return {
    kpis: normalizeKpis(obj),
    channels: normalizeChannels(obj.channels ?? obj.marketing ?? obj.byChannel ?? []),
    activity: normalizeActivity(obj.activity ?? obj.events ?? obj.feed ?? []),
  };
}
