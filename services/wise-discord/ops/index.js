'use strict';
/**
 * Wiring for the /ops surface. Everything it needs is created here so bot.js stays a thin
 * router and the policy pieces remain independently testable.
 */

const { createRoleResolver } = require('./roles.js');
const { createPendingStore } = require('./pending.js');
const { createRelayClient } = require('./relay.js');
const { createOpsAuditor } = require('./audit.js');
const { parseSigningKey } = require('./dispatch.js');
const { opsCommand, handleOpsCommand, handleOpsComponent, handleOpsModal } = require('./command.js');

function createOpsContext(env = process.env, overrides = {}) {
  const signingKey = parseSigningKey(env.WISE2_OPS_SIGNING_KEY);
  const relayToken = env.WISE2_RELAY_TOKEN;
  const roles = createRoleResolver(env);

  const context = {
    roles,
    pending: createPendingStore(),
    relay: createRelayClient({ baseUrl: env.WISE2_RELAY_URL || 'http://127.0.0.1:4600', token: relayToken }),
    signingKey,
    audit: createOpsAuditor({
      file: env.WISE2_OPS_AUDIT_FILE || '/tmp/wise2-ops-discord-audit.jsonl',
      secrets: [relayToken, signingKey && signingKey.secret].filter(Boolean),
    }),
    ephemeralReads: env.WISE2_OPS_EPHEMERAL_READS !== 'false',
    ...overrides,
  };

  /** Reasons the surface cannot act, surfaced at startup instead of at 03:00. */
  context.readiness = [
    roles.configured ? undefined : 'DISCORD_OPS_OWNER_IDS is not set — /ops will refuse every command',
    signingKey ? undefined : 'WISE2_OPS_SIGNING_KEY is not set or too short — writes cannot be signed',
    relayToken ? undefined : 'WISE2_RELAY_TOKEN is not set — the relay will refuse this bot',
  ].filter(Boolean);

  return context;
}

module.exports = { createOpsContext, opsCommand, handleOpsCommand, handleOpsComponent, handleOpsModal };
