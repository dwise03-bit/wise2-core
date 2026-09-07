'use strict';
const { describe, expect, it, beforeAll } = require('vitest');
const { createOpsContext, handleOpsCommand, handleOpsComponent, handleOpsModal } = require('../index.js');
const { createInteraction, createRelayStub } = require('./fakes.js');

const OWNER = '111111111111111111';
const OPERATOR = '222222222222222222';
const STRANGER = '333333333333333333';

const env = {
  DISCORD_OPS_OWNER_IDS: OWNER,
  DISCORD_OPS_OPERATOR_IDS: OPERATOR,
  WISE2_OPS_SIGNING_KEY: 'discord-test:a-signing-secret-of-at-least-32-chars',
  WISE2_RELAY_TOKEN: 'a-relay-token',
  WISE2_RELAY_URL: 'http://127.0.0.1:4600',
};

let protocol;
beforeAll(async () => {
  protocol = await require('../protocol.js').loadProtocol();
});

function context(overrides = {}) {
  const audits = [];
  const relay = overrides.relay || createRelayStub();
  const ctx = createOpsContext(env, {
    relay,
    protocol,
    audit: async (entry) => { audits.push(entry); },
    ...overrides,
  });
  return { ctx, audits, relay };
}

describe('authorization', () => {
  it('refuses a stranger and records the refusal', async () => {
    const { ctx, audits, relay } = context();
    const interaction = createInteraction({ subcommand: 'restart', userId: STRANGER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(interaction, ctx);
    expect(interaction.state.replies[0].content).toContain('not authorized');
    expect(interaction.state.replies[0].ephemeral).toBe(true);
    expect(audits[0]).toMatchObject({ event: 'ops.refused', code: 'ROLE_DENIED', actorId: STRANGER });
    expect(relay.submissions).toEqual([]);
  });

  it('refuses an operator a write but allows a read', async () => {
    const { ctx, audits, relay } = context();
    const write = createInteraction({ subcommand: 'restart', userId: OPERATOR, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(write, ctx);
    expect(write.state.replies[0].content).toContain('requires the owner role');
    expect(relay.submissions).toEqual([]);
    expect(audits.some((entry) => entry.code === 'ROLE_DENIED')).toBe(true);

    const read = createInteraction({ subcommand: 'status', userId: OPERATOR, values: { target: 'wise2-core' } });
    await handleOpsCommand(read, ctx);
    expect(relay.submissions).toHaveLength(1);
  });

  it('refuses everything when no owner is configured', async () => {
    const { ctx, relay } = context({ roles: require('../roles.js').createRoleResolver({}) });
    const interaction = createInteraction({ subcommand: 'status', userId: OWNER, values: { target: 'wise2-core' } });
    await handleOpsCommand(interaction, ctx);
    expect(interaction.state.replies[0].content).toContain('not configured');
    expect(relay.submissions).toEqual([]);
  });
});

describe('writes require confirmation', () => {
  it('never reaches the relay before confirmation', async () => {
    const { ctx, relay } = context();
    const interaction = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(interaction, ctx);
    expect(relay.submissions).toEqual([]);
    const reply = interaction.state.replies[0];
    expect(reply.content).toContain('awaiting-confirmation');
    expect(reply.content).toMatch(/OPS-\d{8}-[A-Z0-9]{4}/);
    expect(reply.components).toHaveLength(1);
  });

  it('requires typing production before a production write runs', async () => {
    const { ctx, relay } = context();
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];

    // Pressing Confirm opens the modal instead of executing.
    const button = createInteraction({ userId: OWNER, customId: `ops:confirm:${jobId}`, button: true });
    await handleOpsComponent(button, ctx);
    expect(button.state.modals).toHaveLength(1);
    expect(relay.submissions).toEqual([]);

    // The wrong word is refused.
    const wrong = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'prod' } });
    await handleOpsModal(wrong, ctx);
    expect(relay.submissions).toEqual([]);

    // The right word executes exactly once.
    const right = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(right, ctx);
    expect(relay.submissions).toHaveLength(1);
    expect(right.state.edits[0].content).toContain('**Status:** complete');
  });

  it('refuses a confirmation from someone other than the requester', async () => {
    const { ctx, relay } = context();
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];

    const other = createInteraction({ userId: OPERATOR, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(other, ctx);
    expect(other.state.replies[0].content).toContain('Only the person who requested');
    expect(relay.submissions).toEqual([]);
  });

  it('requires two confirmations for emergency-stop', async () => {
    const { ctx, relay } = context();
    const request = createInteraction({ subcommand: 'emergency-stop', userId: OWNER, values: { target: 'wise2-core', service: 'studio' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];

    const first = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(first, ctx);
    expect(relay.submissions).toEqual([]);
    expect(first.state.replies[0].content).toContain('1 further confirmation required');

    const second = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(second, ctx);
    expect(relay.submissions).toHaveLength(1);
  });

  it('cancels a pending action without running it', async () => {
    const { ctx, relay } = context();
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];

    const cancel = createInteraction({ userId: OWNER, customId: `ops:cancel:${jobId}`, button: true });
    await handleOpsComponent(cancel, ctx);
    expect(cancel.state.replies[0].content).toContain('cancelled');

    const late = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(late, ctx);
    expect(relay.submissions).toEqual([]);
  });
});

describe('argument and target validation', () => {
  it('rejects a shell-shaped service name before anything is signed', async () => {
    const { ctx, relay, audits } = context();
    const interaction = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker; rm -rf /' } });
    await handleOpsCommand(interaction, ctx);
    expect(interaction.state.replies[0].content).toContain('⛔');
    expect(relay.submissions).toEqual([]);
    expect(audits.some((entry) => entry.code === 'ARG_INVALID')).toBe(true);
  });

  it('rejects an unknown target alias', async () => {
    const { ctx, relay } = context();
    const interaction = createInteraction({ subcommand: 'status', userId: OWNER, values: { target: 'wise2-ghost' } });
    await handleOpsCommand(interaction, ctx);
    expect(interaction.state.replies[0].content).toContain('Unknown target');
    expect(relay.submissions).toEqual([]);
  });

  it('rejects a profile the target does not accept', async () => {
    const { ctx, relay } = context();
    const interaction = createInteraction({ subcommand: 'deploy', userId: OWNER, values: { target: 'wise2-dev', app: 'website', release: 'abc1234' } });
    await handleOpsCommand(interaction, ctx);
    expect(interaction.state.replies[0].content).toContain('does not accept');
    expect(relay.submissions).toEqual([]);
  });
});

describe('signed payloads', () => {
  it('sends a signed job with a signed confirmation bound to the same job', async () => {
    const { ctx, relay } = context();
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];
    const confirmModal = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(confirmModal, ctx);

    const [submission] = relay.submissions;
    expect(submission.job.keyId).toBe('discord-test');
    expect(submission.job.payload).toMatchObject({ jobId, actionProfile: 'restart', target: 'wise2-core', environment: 'production', args: { service: 'worker' } });
    expect(submission.job.payload.actor).toMatchObject({ id: OWNER, role: 'owner' });
    expect(submission.confirmations).toHaveLength(1);
    expect(submission.confirmations[0].payload).toMatchObject({ jobId, environmentEcho: 'production', sequence: 1 });

    // The signatures must verify against the same protocol the relay uses.
    const keys = [{ keyId: 'discord-test', secret: 'a-signing-secret-of-at-least-32-chars' }];
    expect(protocol.verify(submission.job, keys).ok).toBe(true);
    expect(protocol.verify(submission.confirmations[0], keys).ok).toBe(true);
  });

  it('reports a relay outage as failed rather than done', async () => {
    const relay = createRelayStub({ submitError: 'RELAY_UNREACHABLE' });
    const { ctx } = context({ relay });
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];
    const confirmModal = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(confirmModal, ctx);
    expect(confirmModal.state.edits[0].content).toContain('**Status:** failed');
  });

  it('surfaces a bridge rejection as blocked', async () => {
    const relay = createRelayStub({ submitError: 'PROFILE_NOT_ALLOWED_ON_TARGET' });
    const { ctx } = context({ relay });
    const request = createInteraction({ subcommand: 'restart', userId: OWNER, values: { target: 'wise2-core', service: 'worker' } });
    await handleOpsCommand(request, ctx);
    const jobId = request.state.replies[0].content.match(/OPS-\d{8}-[A-Z0-9]{4}/)[0];
    const confirmModal = createInteraction({ userId: OWNER, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(confirmModal, ctx);
    expect(confirmModal.state.edits[0].content).toContain('**Status:** blocked');
  });
});
