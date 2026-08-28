import { runCommand } from '../lib/exec.js';

export function normalizeLogLines(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 200;
  return Math.min(500, Math.max(1, parsed));
}

export function validateService(service, allowlist) {
  if (!allowlist.has(service)) {
    const error = new Error('SERVICE_NOT_ALLOWED');
    error.code = 'SERVICE_NOT_ALLOWED';
    throw error;
  }
  return service;
}

export async function listServices(config) {
  const result = await runCommand('/usr/bin/docker', ['compose', '-f', config.composeFile, 'ps', '--format', 'json'], { timeoutMs: 10000 });
  if (result.code !== 0) throw new Error(result.stderr || 'docker compose ps failed');
  return result.stdout.trim().split('\n').filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return { raw: line }; } });
}

export async function getServiceLogs(config, service, lines = 200) {
  validateService(service, config.allowedServices);
  const result = await runCommand('/usr/bin/docker', ['compose', '-f', config.composeFile, 'logs', '--no-color', '--tail', String(normalizeLogLines(lines)), service], { timeoutMs: 10000 });
  if (result.code !== 0) throw new Error(result.stderr || 'docker compose logs failed');
  return result.stdout;
}

export async function restartService(config, service) {
  validateService(service, config.allowedServices);
  if (!config.writeEnabled) {
    const error = new Error('WRITE_DISABLED');
    error.code = 'WRITE_DISABLED';
    throw error;
  }
  const result = await runCommand('/usr/bin/docker', ['compose', '-f', config.composeFile, 'restart', service], { timeoutMs: 60000 });
  if (result.code !== 0) throw new Error(result.stderr || 'docker compose restart failed');
  return { service, restarted: true };
}
