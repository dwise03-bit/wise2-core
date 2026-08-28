export function loadConfig(env = process.env) {
  const authToken = env.CONTROL_AUTH_TOKEN;
  if (!authToken || authToken.length < 24) throw new Error('CONTROL_AUTH_TOKEN must be at least 24 characters');
  return {
    authToken,
    port: Number(env.CONTROL_PORT ?? 8787),
    host: env.CONTROL_HOST ?? '0.0.0.0',
    repoPath: env.CONTROL_REPO_PATH ?? '/workspace',
    composeFile: env.CONTROL_COMPOSE_FILE ?? '/workspace/docker-compose.production.yml',
    auditFile: env.CONTROL_AUDIT_FILE ?? '/data/audit.jsonl',
    ollamaUrl: env.CONTROL_OLLAMA_URL ?? 'http://ollama:11434/api/tags',
    hermesUrl: env.CONTROL_HERMES_URL ?? 'http://host.docker.internal:8642/health',
    wise2Url: env.CONTROL_WISE2_URL ?? 'https://wise2.net',
    writeEnabled: env.CONTROL_WRITE_ENABLED === 'true',
    allowedServices: new Set((env.CONTROL_ALLOWED_SERVICES ?? 'api,website,dashboard,admin,studio,command-center,worker,ollama,open-webui').split(',').map(x => x.trim()).filter(Boolean))
  };
}
