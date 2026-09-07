'use strict';
/**
 * The Discord result card. Renders only sanitized fields — the relay has already redacted
 * host output, and nothing here reads a target's address, port, or key reference.
 */

const MAX_EVIDENCE_CHARS = 1200;

function stamp(value) {
  return value ? new Date(value).toISOString().replace('T', ' ').slice(0, 19) + 'Z' : '—';
}

/** Compresses a bridge response into a line or two a person can act on. */
function evidenceFor(result) {
  if (!result) return '—';
  if (typeof result === 'string') return result.slice(0, MAX_EVIDENCE_CHARS);
  const data = result.data !== undefined ? result.data : result;
  if (data && typeof data === 'object') {
    if (data.idempotent) return 'Already executed — no action taken (idempotent replay)';
    if (typeof data.stdout === 'string' && data.stdout.trim()) return data.stdout.trim().slice(0, MAX_EVIDENCE_CHARS);
    if (data.id && data.status) return `deployment ${data.id} → ${data.status}`;
  }
  const text = JSON.stringify(data);
  return text === undefined ? '—' : text.slice(0, MAX_EVIDENCE_CHARS);
}

function rollbackFor(input) {
  if (input.rollback) return input.rollback;
  return ['restart', 'deploy'].includes(input.actionProfile) ? 'available via /ops rollback' : 'not applicable';
}

function nextActionFor(input) {
  if (input.status === 'awaiting-confirmation') return `Confirm within 10 minutes: /ops confirm ${input.jobId}`;
  if (input.status === 'blocked') return input.error ? `Resolve: ${input.error.message}` : 'Review the rejection and re-issue the action';
  if (input.status === 'failed') return 'Check host reachability, then re-issue the action';
  if (input.status === 'complete') return input.actionProfile === 'status' ? 'No action needed' : 'Verify the service is healthy with /ops status';
  return 'Await the result';
}

/**
 * Builds the OPS-XXXX card. Returns markdown; the caller decides whether it goes into an
 * embed or a plain message.
 */
function renderResultCard(input) {
  const lines = [
    `## ${input.jobId} — Action Result`,
    `**Actor:** ${input.actor}`,
    `**Target:** ${input.target}`,
    `**Environment:** ${input.environment}`,
    `**Action:** ${input.actionProfile}${input.argsSummary ? ` ${input.argsSummary}` : ''}`,
    `**Status:** ${input.status}`,
    `**Started:** ${stamp(input.startedAt)}`,
    `**Finished:** ${stamp(input.finishedAt)}`,
    `**Evidence:** ${evidenceFor(input.result)}`,
    `**Rollback:** ${rollbackFor(input)}`,
    `**Next action:** ${nextActionFor(input)}`,
  ];
  return lines.join('\n');
}

function summariseArgs(args) {
  const entries = Object.entries(args || {});
  if (entries.length === 0) return '';
  return entries.map(([key, value]) => `${key}=${value}`).join(' ');
}

module.exports = { renderResultCard, summariseArgs, evidenceFor, MAX_EVIDENCE_CHARS };
