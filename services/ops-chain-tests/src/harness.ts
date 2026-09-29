import { createRequire } from 'node:module';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildServer as buildBridge } from '../../control-bridge/src/server.js';
import { buildServer as buildRelay } from '../../control-relay/src/server.js';
import type { ControlConfig } from '../../control-bridge/src/types.js';
import type { RelayConfig } from '../../control-relay/src/types.js';
import type { TargetRecord } from '../../../packages/ops-protocol/src/index.js';

const require = createRequire(import.meta.url);
const opsModule = require('../../wise-discord/ops/index.js');
const relayClientModule = require('../../wise-discord/ops/relay.js');

export const SIGNING_KEY = { keyId: 'chain-test', secret: 'chain-test-signing-secret-0123456789abcdef' };
export const BRIDGE_TOKEN = 'bridge-bearer-token-for-the-chain-test';
export const RELAY_TOKEN = 'relay-bearer-token-for-the-chain-test-01';

export const OWNER_ID = '111111111111111111';
export const OPERATOR_ID = '222222222222222222';
export const STRANGER_ID = '333333333333333333';

/**
 * Turns a Fastify instance into a `fetch`, so one hop can call the next in-process. The
 * bytes crossing each boundary are the real ones — no hop is stubbed out.
 */
export function injectFetch(app: FastifyInstance): typeof globalThis.fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const response = await app.inject({
      method: (init?.method ?? 'GET') as 'GET' | 'POST',
      url: `${url.pathname}${url.search}`,
      headers: (init?.headers ?? {}) as Record<string, string>,
      payload: typeof init?.body === 'string' ? init.body : undefined,
    });
    return new Response(response.body, {
      status: response.statusCode,
      headers: { 'content-type': response.headers['content-type']?.toString() ?? 'application/json' },
    });
  }) as unknown as typeof globalThis.fetch;
}

export type Chain = {
  bridge: FastifyInstance;
  relay: FastifyInstance;
  /** The Discord-side context: role resolution, pending confirmations, signing. */
  ops: Record<string, unknown> & { pending: any; roles: any; relay: any };
  /** Every argv the bridge would have handed to a binary. Empty means nothing executed. */
  commands: string[][];
  /** Health transitions the relay reported to #fable5-activity. */
  alerts: any[];
  /** Runs one health sweep. */
  sweep: () => Promise<unknown>;
  bridgeConfig: ControlConfig;
  relayConfig: RelayConfig;
  dir: string;
};

export type ChainOptions = {
  targets?: TargetRecord[];
  bridgeConfig?: Partial<ControlConfig>;
  /** Simulates the relay being down: the bot's client cannot reach it. */
  relayOffline?: boolean;
  /** Makes the host emit this text from every command, to test sanitizing. */
  leakyOutput?: string;
  /** Simulates the host being unreachable from the relay, for health alerting. */
  bridgeOffline?: boolean;
  ownerIds?: string;
  operatorIds?: string;
};

const DEFAULT_TARGET: TargetRecord = {
  alias: 'wise2-core',
  address: '100.64.0.10',
  transport: 'control-bridge',
  controlPort: 3099,
  environment: 'production',
  allowedProfiles: ['status', 'services', 'logs', 'diagnose', 'deploy-status', 'restart', 'deploy', 'rollback', 'maintenance', 'emergency-stop'],
  healthCheckProfile: 'status',
  bridgeTokenRef: 'WISE2_BRIDGE_TOKEN_CORE',
};

/** Builds the full chain: Discord ops context → relay → control bridge. */
export async function buildChain(options: ChainOptions = {}): Promise<Chain> {
  const dir = await mkdtemp(join(tmpdir(), 'ops-chain-'));
  const commands: string[][] = [];

  const bridgeConfig: ControlConfig = {
    host: '127.0.0.1', port: 3099, nodeEnv: 'test', token: BRIDGE_TOKEN, actor: 'chain',
    repoDir: '/repo', composeFile: '/repo/docker-compose.production.yml', composeProjectName: 'wise2-core',
    auditFile: join(dir, 'bridge-audit.jsonl'), deploymentFile: join(dir, 'deployments.jsonl'),
    idempotencyFile: join(dir, 'idempotency.jsonl'), maintenanceFile: join(dir, 'maintenance.json'),
    dockerBinary: '/usr/bin/docker', gitBinary: '/usr/bin/git', nvidiaSmiBinary: '/usr/bin/nvidia-smi',
    allowedApps: ['website', 'api'], allowedServices: ['api', 'website', 'worker', 'studio', 'postgres'],
    allowedStoppable: ['studio'], databaseService: 'postgres', workerService: 'worker', proxyService: 'traefik',
    ollamaUrl: 'http://ollama.test/api/tags', hermesUrl: 'http://hermes.test/health',
    wise2Url: 'https://wise2.net', apiHealthUrl: 'http://api.test/health',
    rateLimitMax: 500, rateLimitWindowMs: 60_000,
    targetAlias: 'wise2-core', targetEnvironment: 'production',
    allowedProfiles: ['status', 'services', 'logs', 'diagnose', 'deploy-status', 'restart', 'deploy', 'rollback', 'maintenance', 'emergency-stop'],
    signingKeys: [SIGNING_KEY], requireSignedWrites: true,
    ...options.bridgeConfig,
  };

  const bridge = await buildBridge(bridgeConfig, {
    run: async (_binary, args) => {
      commands.push(args);
      if (args.includes('HEAD')) return { code: 0, stdout: 'abc1234567890\n', stderr: '' };
      if (args.includes('--abbrev-ref')) return { code: 0, stdout: 'main\n', stderr: '' };
      return { code: 0, stdout: options.leakyOutput ?? 'ok', stderr: '' };
    },
    fetch: (async () => new Response(JSON.stringify({ models: [] }), { status: 200 })) as unknown as typeof globalThis.fetch,
  });

  const relayConfig: RelayConfig = {
    host: '127.0.0.1', port: 4600, nodeEnv: 'test', token: RELAY_TOKEN,
    targetsFile: join(dir, 'targets.json'), auditFile: join(dir, 'relay-audit.jsonl'),
    signingKeys: [SIGNING_KEY], requestTimeoutMs: 5_000,
    rateLimitMax: 500, rateLimitWindowMs: 60_000, jobRetentionMs: 600_000,
  };

  const alerts: any[] = [];
  const relay = await buildRelay(relayConfig, {
    registry: { targets: options.targets ?? [DEFAULT_TARGET], tokens: new Map([['wise2-core', BRIDGE_TOKEN]]) },
    fetchImpl: options.bridgeOffline
      ? ((async () => { throw Object.assign(new Error('down'), { name: 'TimeoutError' }); }) as unknown as typeof globalThis.fetch)
      : injectFetch(bridge),
    notifier: async (event: unknown) => { alerts.push(event); },
  });

  const relayFetch = options.relayOffline
    ? ((async () => { throw new Error('connect ECONNREFUSED'); }) as unknown as typeof globalThis.fetch)
    : injectFetch(relay);

  const ops = opsModule.createOpsContext(
    {
      DISCORD_OPS_OWNER_IDS: options.ownerIds ?? OWNER_ID,
      DISCORD_OPS_OPERATOR_IDS: options.operatorIds ?? OPERATOR_ID,
      WISE2_OPS_SIGNING_KEY: `${SIGNING_KEY.keyId}:${SIGNING_KEY.secret}`,
      WISE2_RELAY_TOKEN: RELAY_TOKEN,
      WISE2_RELAY_URL: 'http://127.0.0.1:4600',
      WISE2_OPS_AUDIT_FILE: join(dir, 'discord-audit.jsonl'),
    },
    {
      relay: relayClientModule.createRelayClient({
        baseUrl: 'http://127.0.0.1:4600',
        token: RELAY_TOKEN,
        fetchImpl: relayFetch,
      }),
    },
  );

  return {
    bridge, relay, ops, commands, bridgeConfig, relayConfig, dir, alerts,
    sweep: () => (relay as unknown as { health: { sweep: () => Promise<unknown> } }).health.sweep(),
  };
}

export const handleOpsCommand = opsModule.handleOpsCommand;
export const handleOpsComponent = opsModule.handleOpsComponent;
export const handleOpsModal = opsModule.handleOpsModal;

/** Minimal Discord interaction stand-in; records what the bot replied. */
export function interaction(options: { subcommand?: string; userId?: string; values?: Record<string, unknown>; customId?: string; fields?: Record<string, string>; button?: boolean } = {}) {
  const state = { replies: [] as any[], edits: [] as any[], modals: [] as any[] };
  return {
    state,
    user: { id: options.userId ?? OWNER_ID, username: 'daniel', globalName: 'Daniel' },
    customId: options.customId,
    options: {
      getSubcommand: () => options.subcommand,
      getString: (name: string) => (options.values ?? {})[name] ?? null,
      getInteger: (name: string) => (options.values ?? {})[name] ?? null,
    },
    fields: { getTextInputValue: (name: string) => (options.fields ?? {})[name] },
    isButton: () => Boolean(options.button),
    async reply(payload: unknown) { state.replies.push(payload); return payload; },
    async editReply(payload: unknown) { state.edits.push(payload); return payload; },
    async deferReply() { /* no-op */ },
    async showModal(modal: unknown) { state.modals.push(modal); },
  };
}

/** Drives a full write: request → production modal confirmation → dispatch. */
export async function runWrite(chain: Chain, subcommand: string, values: Record<string, unknown>, userId = OWNER_ID, confirmations = 1) {
  const request = interaction({ subcommand, userId, values });
  await handleOpsCommand(request, chain.ops);
  const match = String(request.state.replies[0]?.content ?? '').match(/OPS-\d{8}-[A-Z0-9]{4}/);
  if (!match) return { request, jobId: undefined, confirms: [] as ReturnType<typeof interaction>[] };
  const jobId = match[0];
  const confirms = [];
  for (let index = 0; index < confirmations; index += 1) {
    const modal = interaction({ userId, customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(modal, chain.ops);
    confirms.push(modal);
  }
  return { request, jobId, confirms };
}
