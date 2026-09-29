import { readFile, stat } from 'node:fs/promises';
import { parseTargets } from '../../../packages/ops-protocol/src/index.js';
import type { TargetRecord } from '../../../packages/ops-protocol/src/index.js';

export type TargetRegistry = {
  targets: TargetRecord[];
  /** Bridge bearer tokens resolved from the environment, keyed by alias. */
  tokens: Map<string, string>;
};

export class RegistryError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'RegistryError';
  }
}

/**
 * The registry holds the only mapping from an alias to a real address, so a readable file
 * is a disclosure of the whole fleet. Anything group- or world-readable is refused rather
 * than warned about.
 */
export async function assertPrivateFile(file: string): Promise<void> {
  const info = await stat(file).catch(() => {
    throw new RegistryError('REGISTRY_MISSING', `Target registry not found at ${file}`);
  });
  if ((info.mode & 0o077) !== 0) {
    throw new RegistryError('REGISTRY_PERMISSIONS', `Target registry must not be group- or world-readable: chmod 600 ${file}`);
  }
}

export async function loadRegistry(file: string, env: NodeJS.ProcessEnv = process.env): Promise<TargetRegistry> {
  await assertPrivateFile(file);
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(await readFile(file, 'utf8'));
  } catch {
    throw new RegistryError('REGISTRY_MALFORMED', 'Target registry is not valid JSON');
  }
  const result = parseTargets(parsedJson);
  if (!result.ok) throw new RegistryError(result.code, `${result.message}${result.detail ? ` (${result.detail})` : ''}`);

  const tokens = new Map<string, string>();
  for (const target of result.value) {
    if (!target.bridgeTokenRef) continue;
    const token = env[target.bridgeTokenRef]?.trim();
    // A target whose token is missing would fail at dispatch time, in the middle of an
    // incident. Fail at load instead.
    if (!token) throw new RegistryError('BRIDGE_TOKEN_MISSING', `${target.bridgeTokenRef} is not set for target ${target.alias}`);
    tokens.set(target.alias, token);
  }
  return { targets: result.value, tokens };
}
