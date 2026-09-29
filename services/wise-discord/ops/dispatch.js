'use strict';
/**
 * Turns a confirmed pending entry into a signed job and submits it to the relay.
 * This is the only place in the bot that signs anything.
 */

const { loadProtocol } = require('./protocol.js');

function parseSigningKey(value) {
  const raw = String(value || '').trim();
  const separator = raw.indexOf(':');
  if (separator <= 0) return undefined;
  const keyId = raw.slice(0, separator).trim();
  const secret = raw.slice(separator + 1).trim();
  if (!keyId || secret.length < 32) return undefined;
  return { keyId, secret };
}

/**
 * Signs and submits. Refuses anything that is not fully confirmed, so a bug in the
 * command layer cannot turn an unconfirmed intent into an executed action.
 */
async function dispatchJob(input) {
  const { entry, signingKey, relay, protocol } = input;
  const api = protocol || (await loadProtocol());

  if (!signingKey) return { ok: false, code: 'SIGNING_KEY_MISSING', message: 'WISE2_OPS_SIGNING_KEY is not configured; no action was taken' };

  const profile = api.findProfile(entry.actionProfile);
  if (!profile) return { ok: false, code: 'PROFILE_UNKNOWN', message: `Unknown action profile: ${entry.actionProfile}` };

  // The invariant is the confirmations themselves, not a status label: by the time a job
  // is dispatched the store has already marked it consumed.
  const required = profile.requiresConfirmation ? (profile.requiresDoubleConfirmation ? 2 : 1) : 0;
  if (profile.kind === 'write' && entry.confirmations.length < required) {
    return { ok: false, code: 'CONFIRMATION_REQUIRED', message: 'This action is not confirmed; no action was taken' };
  }

  const issuedAt = new Date(entry.createdAt).toISOString();
  const actor = { id: entry.actorId, displayName: entry.actorName, role: entry.role };
  const job = {
    jobId: entry.jobId,
    actor,
    target: entry.target,
    environment: entry.environment,
    actionProfile: entry.actionProfile,
    args: entry.args,
    nonce: api.newNonce(),
    issuedAt,
    expiresAt: new Date(entry.expiresAt).toISOString(),
    idempotencyKey: api.idempotencyKeyFor({
      actorId: actor.id,
      target: entry.target,
      actionProfile: entry.actionProfile,
      args: entry.args,
      window: issuedAt.slice(0, 16),
    }),
  };

  const signedJob = api.sign(job, signingKey);
  const confirmations = entry.confirmations.map((confirmation) => api.sign({
    jobId: job.jobId,
    confirmedBy: actor,
    confirmedAt: confirmation.confirmedAt,
    environmentEcho: confirmation.environmentEcho,
    sequence: confirmation.sequence,
  }, signingKey));

  const result = await relay.submit({ job: signedJob, confirmations });
  return result.ok
    ? { ok: true, job, result: result.body }
    : { ok: false, code: result.code, message: result.message, detail: result.detail, job };
}

module.exports = { dispatchJob, parseSigningKey };
