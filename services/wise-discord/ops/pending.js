'use strict';
/**
 * Pending confirmations for /ops write actions.
 *
 * A write is created here as an unsigned intent and only becomes a signed job once the
 * required confirmations exist. Nothing in this store can reach a host: the dispatcher
 * refuses any entry that is not `ready`.
 */

const TEN_MINUTES_MS = 10 * 60 * 1000;

function createPendingStore(options = {}) {
  const ttlMs = options.ttlMs || TEN_MINUTES_MS;
  const now = options.now || Date.now;
  const entries = new Map();

  const sweep = () => {
    const current = now();
    for (const [jobId, entry] of entries) {
      if (entry.expiresAt <= current) entries.delete(jobId);
    }
  };

  return {
    ttlMs,
    create(input) {
      sweep();
      const createdAt = now();
      const entry = {
        ...input,
        confirmations: [],
        createdAt,
        expiresAt: createdAt + ttlMs,
        status: 'awaiting-confirmation',
      };
      entries.set(entry.jobId, entry);
      return entry;
    },

    get(jobId) {
      sweep();
      return entries.get(jobId);
    },

    /**
     * Records one confirmation. The confirming user must be the requester, the entry must
     * still be live, and a production write must echo the environment back exactly.
     */
    confirm(jobId, input) {
      // Deliberately before sweep(): an expired entry must say so, rather than being
      // swept away and reported as a job that never existed.
      const entry = entries.get(jobId);
      if (!entry) return { ok: false, code: 'JOB_UNKNOWN', message: 'That job has expired or does not exist' };
      if (entry.status === 'consumed') return { ok: false, code: 'JOB_ALREADY_RUN', message: 'That job has already been executed' };
      if (entry.expiresAt <= now()) {
        entries.delete(jobId);
        return { ok: false, code: 'CONFIRMATION_EXPIRED', message: 'Confirmation expired; request the action again' };
      }
      sweep();
      if (input.userId !== entry.actorId) {
        return { ok: false, code: 'CONFIRMATION_ACTOR_MISMATCH', message: 'Only the person who requested this action may confirm it' };
      }
      if (entry.environment === 'production' && input.environmentEcho !== 'production') {
        return { ok: false, code: 'ENVIRONMENT_CONFIRMATION_REQUIRED', message: 'Type `production` to confirm a production action' };
      }
      if (entry.confirmations.length >= entry.requiredConfirmations) {
        return { ok: false, code: 'ALREADY_CONFIRMED', message: 'This action is already fully confirmed' };
      }

      const sequence = entry.confirmations.length + 1;
      entry.confirmations.push({ sequence, userId: input.userId, confirmedAt: new Date(now()).toISOString(), environmentEcho: input.environmentEcho });
      entry.status = entry.confirmations.length >= entry.requiredConfirmations ? 'ready' : 'awaiting-confirmation';
      return {
        ok: true,
        entry,
        remaining: Math.max(0, entry.requiredConfirmations - entry.confirmations.length),
      };
    },

    /** Marks an entry as executed. Single use: a second dispatch can never happen here. */
    consume(jobId) {
      const entry = entries.get(jobId);
      if (!entry || entry.status !== 'ready') return undefined;
      entry.status = 'consumed';
      return entry;
    },

    cancel(jobId, userId) {
      const entry = entries.get(jobId);
      if (!entry) return { ok: false, code: 'JOB_UNKNOWN', message: 'That job has expired or does not exist' };
      if (entry.actorId !== userId) return { ok: false, code: 'CONFIRMATION_ACTOR_MISMATCH', message: 'Only the requester may cancel this action' };
      entries.delete(jobId);
      return { ok: true, entry };
    },

    size() {
      sweep();
      return entries.size;
    },
  };
}

module.exports = { createPendingStore, TEN_MINUTES_MS };
