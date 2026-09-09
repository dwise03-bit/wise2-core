import { boundedText, redactText } from './redact.js';
import type { Environment } from './types.js';

/**
 * The OPS-XXXX result card, shared by every surface that reports an action to a person:
 * the Discord command reply, the health poller's alerts, and anything added later. One
 * renderer means one place where evidence is capped and sanitized.
 */

export type CardStatus = 'queued' | 'awaiting-confirmation' | 'running' | 'complete' | 'blocked' | 'failed';

export type ResultCardInput = {
  jobId: string;
  actor: string;
  target: string;
  environment: Environment | string;
  actionProfile: string;
  args?: Record<string, string>;
  argsSummary?: string;
  status: CardStatus;
  startedAt?: string;
  finishedAt?: string;
  /** Raw-ish result from the relay or bridge. Always capped and redacted before display. */
  result?: unknown;
  error?: { code: string; message: string };
  rollback?: string;
  nextAction?: string;
  /** Known secret values to blank out on top of the pattern-based redaction. */
  secrets?: string[];
};

/** Evidence budget. Long enough to be useful in a Discord message, short enough to fit. */
export const MAX_EVIDENCE_CHARS = 1200;

function stamp(value?: string): string {
  if (!value) return '—';
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return '—';
  return `${new Date(parsed).toISOString().replace('T', ' ').slice(0, 19)}Z`;
}

/** Caps first, then redacts, so a secret split by the cap cannot survive as a fragment. */
function sanitize(value: string, secrets: string[]): string {
  return redactText(boundedText(value, MAX_EVIDENCE_CHARS * 4), secrets).slice(0, MAX_EVIDENCE_CHARS);
}

export function summariseArgs(args?: Record<string, string>): string {
  const entries = Object.entries(args ?? {});
  return entries.length === 0 ? '' : entries.map(([key, value]) => `${key}=${value}`).join(' ');
}

/**
 * Reduces a bridge response to something a person can act on. Prefers the fields that
 * carry meaning (stdout, a deployment id, an idempotent replay) over dumping JSON.
 */
export function evidenceFor(result: unknown, secrets: string[] = []): string {
  if (result === undefined || result === null) return '—';
  if (typeof result === 'string') return sanitize(result, secrets) || '—';

  // Responses arrive wrapped: the relay returns the bridge's envelope inside its own, so
  // the meaningful fields can sit two levels down. Unwrap while it still looks like one.
  let data: unknown = result;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!data || typeof data !== 'object' || !('data' in (data as Record<string, unknown>))) break;
    data = (data as { data: unknown }).data;
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (record.idempotent === true) return 'Already executed — no action taken (idempotent replay)';
    if (typeof record.stdout === 'string' && record.stdout.trim()) return sanitize(record.stdout.trim(), secrets);
    if (typeof record.id === 'string' && typeof record.status === 'string') return sanitize(`deployment ${record.id} → ${record.status}`, secrets);
    if (typeof record.enabled === 'boolean') return `maintenance ${record.enabled ? 'enabled' : 'disabled'}`;
  }
  const text = JSON.stringify(data);
  return text === undefined ? '—' : sanitize(text, secrets);
}

function rollbackFor(input: ResultCardInput): string {
  if (input.rollback) return input.rollback;
  if (input.status !== 'complete') return 'not applicable';
  return ['restart', 'deploy'].includes(input.actionProfile) ? 'available via /ops rollback' : 'not applicable';
}

function nextActionFor(input: ResultCardInput): string {
  if (input.nextAction) return input.nextAction;
  switch (input.status) {
    case 'awaiting-confirmation': return `Confirm within 10 minutes: /ops confirm ${input.jobId}`;
    case 'queued': return 'Await dispatch';
    case 'running': return 'Await the result';
    case 'blocked': return input.error ? `Resolve: ${input.error.message}` : 'Review the rejection and re-issue the action';
    case 'failed': return 'Check host reachability, then re-issue the action';
    case 'complete': return input.actionProfile === 'status' ? 'No action needed' : 'Verify the service is healthy with /ops status';
    default: return 'Await the result';
  }
}

export function renderResultCard(input: ResultCardInput): string {
  const secrets = input.secrets ?? [];
  const args = input.argsSummary ?? summariseArgs(input.args);
  const evidence = input.error
    ? sanitize(`${input.error.code}: ${input.error.message}`, secrets)
    : evidenceFor(input.result, secrets);

  const card = [
    `## ${input.jobId} — Action Result`,
    `**Actor:** ${input.actor}`,
    `**Target:** ${input.target}`,
    `**Environment:** ${input.environment}`,
    `**Action:** ${input.actionProfile}${args ? ` ${args}` : ''}`,
    `**Status:** ${input.status}`,
    `**Started:** ${stamp(input.startedAt)}`,
    `**Finished:** ${stamp(input.finishedAt)}`,
    `**Evidence:** ${evidence}`,
    `**Rollback:** ${rollbackFor(input)}`,
    `**Next action:** ${nextActionFor(input)}`,
  ].join('\n');

  // Final pass over the assembled card: every field is sanitized, not just the evidence.
  // An error message or a next-action hint can carry host text too.
  return redactText(card, secrets);
}
