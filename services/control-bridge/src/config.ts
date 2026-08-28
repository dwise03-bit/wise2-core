import type { ControlConfig } from './types.js';

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ControlConfig {
  const token = env.WISE2_CONTROL_TOKEN?.trim();
  if (!token) throw new Error('WISE2_CONTROL_TOKEN is required');
  return {
    host: env.WISE2_CONTROL_HOST ?? '127.0.0.1',
    port: Number(env.WISE2_CONTROL_PORT ?? 3099),
    token,
    repoDir: env.WISE2_REPO_DIR ?? '/home/dwise/wise2-core',
    composeFile: env.WISE2_COMPOSE_FILE ?? '/home/dwise/wise2-core/docker-compose.production.yml',
    auditFile: env.WISE2_AUDIT_FILE ?? '/data/control-audit.jsonl',
    allowedServices: (env.WISE2_ALLOWED_SERVICES ?? 'api,website,dashboard,admin,studio,command-center,worker,ollama,open-webui').split(',').map(v => v.trim()).filter(Boolean),
  };
}
