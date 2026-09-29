/** Minimal stand-ins for the Discord objects the /ops handlers touch. */

function createInteraction(options = {}) {
  const state = { replies: [], edits: [], modals: [], deferred: false };
  return {
    state,
    user: { id: options.userId || '111111111111111111', username: 'daniel', globalName: 'Daniel' },
    customId: options.customId,
    options: {
      getSubcommand: () => options.subcommand,
      getString: (name) => (options.values || {})[name] ?? null,
      getInteger: (name) => (options.values || {})[name] ?? null,
    },
    fields: { getTextInputValue: (name) => (options.fields || {})[name] },
    isButton: () => Boolean(options.button),
    async reply(payload) { state.replies.push(payload); return payload; },
    async editReply(payload) { state.edits.push(payload); return payload; },
    async deferReply() { state.deferred = true; },
    async showModal(modal) { state.modals.push(modal); },
  };
}

/** A relay that records submissions instead of performing them. */
function createRelayStub(options = {}) {
  const submissions = [];
  return {
    submissions,
    async targets() {
      if (options.targetsError) return { ok: false, code: 'RELAY_UNREACHABLE', message: 'relay down' };
      return {
        ok: true,
        body: { data: { targets: options.targets || [
          { alias: 'wise2-core', environment: 'production', transport: 'control-bridge', allowedProfiles: ['status', 'logs', 'restart', 'deploy', 'rollback', 'emergency-stop'] },
          { alias: 'wise2-dev', environment: 'staging', transport: 'control-bridge', allowedProfiles: ['status', 'restart'] },
        ] } },
      };
    },
    async submit(payload) {
      submissions.push(payload);
      if (options.submitError) return { ok: false, code: options.submitError, message: 'rejected by relay' };
      return { ok: true, body: { ok: true, data: { code: 0, stdout: 'restarted' } } };
    },
    async health() { return { ok: true, body: { ok: true } }; },
  };
}

export { createInteraction, createRelayStub };
