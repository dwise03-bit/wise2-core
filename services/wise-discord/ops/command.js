'use strict';
/**
 * The /ops Discord surface.
 *
 * Discord is the approval interface only. Every command here maps to an allowlisted
 * action profile, every write needs an explicit confirmation bound to the requester, and
 * nothing is ever assembled from free-form text.
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { renderResultCard, summariseArgs } = require('./card.js');
const { dispatchJob } = require('./dispatch.js');
const { loadProtocol } = require('./protocol.js');

const DIAGNOSTIC_CHOICES = ['health', 'docker', 'disk', 'network', 'database', 'worker', 'traefik', 'ollama'];

/** Subcommand → profile plus how its options map onto the profile's arguments. */
const SUBCOMMANDS = {
  status: { profile: 'status', args: () => ({}) },
  services: { profile: 'services', args: () => ({}) },
  logs: { profile: 'logs', args: (i) => clean({ service: i.options.getString('service'), lines: optionalNumber(i.options.getInteger('lines')) }) },
  diagnose: { profile: 'diagnose', args: (i) => ({ profile: i.options.getString('profile') }) },
  restart: { profile: 'restart', args: (i) => ({ service: i.options.getString('service') }) },
  deploy: { profile: 'deploy', args: (i) => ({ app: i.options.getString('app'), releaseId: i.options.getString('release') }) },
  rollback: { profile: 'rollback', args: (i) => ({ app: i.options.getString('app'), releaseId: i.options.getString('release') }) },
  maintenance: { profile: 'maintenance', args: (i) => ({ state: i.options.getString('state') }) },
  'emergency-stop': { profile: 'emergency-stop', args: (i) => ({ service: i.options.getString('service') }) },
};

function clean(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function optionalNumber(value) {
  return value === null || value === undefined ? undefined : String(value);
}

const opsCommand = new SlashCommandBuilder()
  .setName('ops')
  .setDescription('WISE² infrastructure operations')
  .addSubcommand((s) => s.setName('status').setDescription('Host health, uptime, disk, memory, services, last deployment')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true)))
  .addSubcommand((s) => s.setName('services').setDescription('State of the approved WISE² services')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true)))
  .addSubcommand((s) => s.setName('logs').setDescription('Recent sanitized logs for one service')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('service').setDescription('Service name').setRequired(true))
    .addIntegerOption((o) => o.setName('lines').setDescription('Lines (max 500)').setMinValue(1).setMaxValue(500)))
  .addSubcommand((s) => s.setName('diagnose').setDescription('Run a predefined diagnostic profile')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('profile').setDescription('Diagnostic profile').setRequired(true)
      .addChoices(...DIAGNOSTIC_CHOICES.map((value) => ({ name: value, value })))))
  .addSubcommand((s) => s.setName('restart').setDescription('Restart one allowlisted service (confirmation required)')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('service').setDescription('Service name').setRequired(true)))
  .addSubcommand((s) => s.setName('deploy').setDescription('Deploy an approved release (confirmation required)')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('app').setDescription('Application').setRequired(true))
    .addStringOption((o) => o.setName('release').setDescription('Release id or commit').setRequired(true)))
  .addSubcommand((s) => s.setName('rollback').setDescription('Roll back to a verified prior release (confirmation required)')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('app').setDescription('Application').setRequired(true))
    .addStringOption((o) => o.setName('release').setDescription('Release id to roll back to').setRequired(true)))
  .addSubcommand((s) => s.setName('maintenance').setDescription('Enable or disable maintenance mode (confirmation required)')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('state').setDescription('on or off').setRequired(true)
      .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })))
  .addSubcommand((s) => s.setName('emergency-stop').setDescription('Stop a designated non-critical service (double confirmation)')
    .addStringOption((o) => o.setName('target').setDescription('Server alias').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('service').setDescription('Service name').setRequired(true)))
  .addSubcommand((s) => s.setName('targets').setDescription('List managed server aliases'))
  .addSubcommand((s) => s.setName('confirm').setDescription('Confirm a pending action')
    .addStringOption((o) => o.setName('job_id').setDescription('Job id, e.g. OPS-20260906-A1B2').setRequired(true)));

function refusal(message) {
  return { content: `⛔ ${message}`, ephemeral: true };
}

function confirmationComponents(jobId, remaining) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ops:confirm:${jobId}`).setLabel(remaining > 1 ? `Confirm (${remaining} required)` : 'Confirm').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`ops:cancel:${jobId}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary),
  )];
}

function productionModal(jobId, actionProfile) {
  return new ModalBuilder()
    .setCustomId(`ops:modal:${jobId}`)
    .setTitle(`Confirm ${actionProfile} in production`.slice(0, 45))
    .addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('environment')
        .setLabel('Type production to confirm')
        .setPlaceholder('production')
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
    ));
}

/** Target list from the relay: aliases only, never addresses. Cached briefly. */
async function resolveTarget(ctx, alias) {
  const now = Date.now();
  if (!ctx.targetCache || ctx.targetCache.expiresAt <= now) {
    const result = await ctx.relay.targets();
    if (!result.ok) return { ok: false, code: result.code, message: result.message };
    ctx.targetCache = { targets: result.body.data.targets, expiresAt: now + 30_000 };
  }
  const target = ctx.targetCache.targets.find((candidate) => candidate.alias === alias);
  if (!target) return { ok: false, code: 'TARGET_UNKNOWN', message: `Unknown target: ${alias}` };
  return { ok: true, target };
}

async function runJob(ctx, entry, interaction) {
  const dispatched = await dispatchJob({ entry, signingKey: ctx.signingKey, relay: ctx.relay, protocol: ctx.protocol });
  const finishedAt = new Date().toISOString();
  const base = {
    jobId: entry.jobId, actor: entry.actorName, target: entry.target, environment: entry.environment,
    actionProfile: entry.actionProfile, argsSummary: summariseArgs(entry.args),
    startedAt: new Date(entry.createdAt).toISOString(), finishedAt,
  };

  if (!dispatched.ok) {
    await ctx.audit({ event: 'ops.dispatch', ok: false, jobId: entry.jobId, actorId: entry.actorId, actor: entry.actorName, target: entry.target, profile: entry.actionProfile, code: dispatched.code });
    return { content: renderResultCard({ ...base, status: dispatched.code === 'RELAY_UNREACHABLE' ? 'failed' : 'blocked', error: { code: dispatched.code, message: dispatched.message } }), components: [] };
  }

  await ctx.audit({ event: 'ops.dispatch', ok: true, jobId: entry.jobId, actorId: entry.actorId, actor: entry.actorName, target: entry.target, profile: entry.actionProfile });
  return { content: renderResultCard({ ...base, status: 'complete', result: dispatched.result }), components: [] };
}

async function handleOpsCommand(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;
  const actorName = interaction.user.globalName || interaction.user.username;
  const role = ctx.roles.roleFor(userId);

  if (!ctx.roles.configured) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: 'OPS_NOT_CONFIGURED' });
    return interaction.reply(refusal('The ops surface is not configured. Set DISCORD_OPS_OWNER_IDS before using /ops.'));
  }
  if (!role) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: 'ROLE_DENIED' });
    return interaction.reply(refusal('You are not authorized to use /ops.'));
  }

  if (sub === 'targets') {
    const result = await ctx.relay.targets();
    if (!result.ok) return interaction.reply(refusal(result.message));
    const lines = result.body.data.targets.map((t) => `• \`${t.alias}\` — ${t.environment} (${t.allowedProfiles.join(', ')})`);
    return interaction.reply({ content: lines.join('\n') || 'No targets configured', ephemeral: true });
  }

  if (sub === 'confirm') {
    return applyConfirmation(interaction, ctx, interaction.options.getString('job_id'), undefined);
  }

  const mapping = SUBCOMMANDS[sub];
  if (!mapping) return interaction.reply(refusal(`Unknown subcommand: ${sub}`));

  const api = ctx.protocol || (await loadProtocol());
  const profile = api.findProfile(mapping.profile);
  if (!profile) return interaction.reply(refusal(`Unknown action profile: ${mapping.profile}`));

  if (!api.roleSatisfies(role, profile.minRole)) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: 'ROLE_DENIED', profile: profile.id });
    return interaction.reply(refusal(`\`${profile.id}\` requires the ${profile.minRole} role.`));
  }

  const alias = interaction.options.getString('target');
  const resolved = await resolveTarget(ctx, alias);
  if (!resolved.ok) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: resolved.code });
    return interaction.reply(refusal(resolved.message));
  }
  const target = resolved.target;

  if (!target.allowedProfiles.includes(profile.id)) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: 'PROFILE_NOT_ALLOWED_ON_TARGET', target: alias, profile: profile.id });
    return interaction.reply(refusal(`\`${target.alias}\` does not accept \`${profile.id}\`.`));
  }

  const args = mapping.args(interaction);
  const argCheck = api.validateArgs(profile, args);
  if (!argCheck.ok) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: userId, actor: actorName, command: sub, code: argCheck.code, target: alias, profile: profile.id });
    return interaction.reply(refusal(`${argCheck.message}${argCheck.detail ? ` (${argCheck.detail})` : ''}`));
  }

  const entry = ctx.pending.create({
    jobId: api.newJobId(),
    actorId: userId,
    actorName,
    role,
    target: target.alias,
    environment: target.environment,
    actionProfile: profile.id,
    args,
    requiredConfirmations: profile.requiresConfirmation ? (profile.requiresDoubleConfirmation ? 2 : 1) : 0,
  });

  await ctx.audit({ event: 'ops.requested', ok: true, jobId: entry.jobId, actorId: userId, actor: actorName, target: target.alias, profile: profile.id, environment: target.environment });

  // Reads execute immediately; writes wait for an explicit confirmation.
  if (profile.kind === 'read') {
    await interaction.deferReply({ ephemeral: ctx.ephemeralReads !== false });
    entry.status = 'ready';
    const card = await runJob(ctx, entry, interaction);
    ctx.pending.consume(entry.jobId);
    return interaction.editReply(card);
  }

  return interaction.reply({
    content: renderResultCard({
      jobId: entry.jobId, actor: actorName, target: target.alias, environment: target.environment,
      actionProfile: profile.id, argsSummary: summariseArgs(args), status: 'awaiting-confirmation',
      startedAt: new Date(entry.createdAt).toISOString(),
    }),
    components: confirmationComponents(entry.jobId, entry.requiredConfirmations),
    ephemeral: true,
  });
}

/** Shared by the Confirm button, the modal, and /ops confirm. */
async function applyConfirmation(interaction, ctx, jobId, environmentEcho) {
  const userId = interaction.user.id;
  const entry = ctx.pending.get(jobId);
  if (!entry) return interaction.reply(refusal('That job has expired or does not exist.'));

  if (entry.environment === 'production' && environmentEcho === undefined) {
    // Production writes must be typed back, so the modal is the only way through.
    if (typeof interaction.showModal === 'function' && interaction.isButton?.()) {
      return interaction.showModal(productionModal(jobId, entry.actionProfile));
    }
    return interaction.reply(refusal('Confirm production actions with the Confirm button, which requires typing `production`.'));
  }

  const confirmed = ctx.pending.confirm(jobId, { userId, environmentEcho });
  if (!confirmed.ok) {
    await ctx.audit({ event: 'ops.confirm', ok: false, jobId, actorId: userId, code: confirmed.code });
    return interaction.reply(refusal(confirmed.message));
  }

  await ctx.audit({ event: 'ops.confirm', ok: true, jobId, actorId: userId, sequence: confirmed.entry.confirmations.length });

  if (confirmed.remaining > 0) {
    return interaction.reply({
      content: renderResultCard({
        jobId, actor: entry.actorName, target: entry.target, environment: entry.environment,
        actionProfile: entry.actionProfile, argsSummary: summariseArgs(entry.args),
        status: 'awaiting-confirmation', startedAt: new Date(entry.createdAt).toISOString(),
      }) + `\n\n⚠️ ${confirmed.remaining} further confirmation required.`,
      components: confirmationComponents(jobId, confirmed.remaining),
      ephemeral: true,
    });
  }

  const ready = ctx.pending.consume(jobId);
  if (!ready) return interaction.reply(refusal('That job is no longer ready to run.'));

  await interaction.deferReply({ ephemeral: true });
  const card = await runJob(ctx, ready, interaction);
  return interaction.editReply(card);
}

async function handleOpsComponent(interaction, ctx) {
  const [, action, jobId] = interaction.customId.split(':');
  const role = ctx.roles.roleFor(interaction.user.id);
  if (!role) {
    await ctx.audit({ event: 'ops.refused', ok: false, actorId: interaction.user.id, code: 'ROLE_DENIED', component: action });
    return interaction.reply(refusal('You are not authorized to use /ops.'));
  }
  if (action === 'cancel') {
    const cancelled = ctx.pending.cancel(jobId, interaction.user.id);
    await ctx.audit({ event: 'ops.cancel', ok: cancelled.ok, jobId, actorId: interaction.user.id, code: cancelled.ok ? undefined : cancelled.code });
    return interaction.reply(cancelled.ok ? { content: `🚫 ${jobId} cancelled.`, ephemeral: true } : refusal(cancelled.message));
  }
  if (action === 'confirm') return applyConfirmation(interaction, ctx, jobId, undefined);
  return interaction.reply(refusal('Unknown ops control.'));
}

async function handleOpsModal(interaction, ctx) {
  const [, , jobId] = interaction.customId.split(':');
  const echo = interaction.fields.getTextInputValue('environment').trim();
  return applyConfirmation(interaction, ctx, jobId, echo);
}

module.exports = { opsCommand, handleOpsCommand, handleOpsComponent, handleOpsModal, SUBCOMMANDS, DIAGNOSTIC_CHOICES };
