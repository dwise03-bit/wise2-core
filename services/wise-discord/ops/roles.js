'use strict';
/**
 * Role resolution for the /ops surface.
 *
 * Deliberately fail-closed, unlike the bot's legacy `isAdmin`, which grants everyone
 * access when its allowlist is empty. An unconfigured ops surface must control nothing.
 */

function parseIds(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => /^[0-9]{5,32}$/.test(entry));
}

function createRoleResolver(env = process.env) {
  const owners = parseIds(env.DISCORD_OPS_OWNER_IDS);
  const operators = parseIds(env.DISCORD_OPS_OPERATOR_IDS).filter((id) => !owners.includes(id));
  return {
    owners,
    operators,
    configured: owners.length > 0,
    /** Returns 'owner', 'operator', or null. Never a default role. */
    roleFor(userId) {
      if (owners.includes(userId)) return 'owner';
      if (operators.includes(userId)) return 'operator';
      return null;
    },
  };
}

module.exports = { createRoleResolver, parseIds };
