import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sanitizeClientSlug, vaultRoot } from './paths.ts';

export interface ClientVault {
  client: string;
  dir: string;
  envPath: string;
  skippedPath: string;
  values: Record<string, string>;
  skipped: string[];
}

function parseEnv(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function serializeEnv(values: Record<string, string>): string {
  const lines = [
    '# WISE² client API keys. Gitignored. Do not copy this file into chat or git.',
    `# Updated: ${new Date().toISOString()}`,
    '',
  ];
  for (const key of Object.keys(values).sort()) {
    const escaped = values[key].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    lines.push(`${key}="${escaped}"`);
  }
  lines.push('');
  return lines.join('\n');
}

export function clientDir(client: string): string {
  return join(vaultRoot(), sanitizeClientSlug(client));
}

export function loadVault(client: string): ClientVault {
  const slug = sanitizeClientSlug(client);
  const dir = join(vaultRoot(), slug);
  const envPath = join(dir, 'keys.env');
  const skippedPath = join(dir, 'skipped.json');

  let values: Record<string, string> = {};
  let skipped: string[] = [];

  if (existsSync(envPath)) {
    values = parseEnv(readFileSync(envPath, 'utf8'));
  }
  if (existsSync(skippedPath)) {
    try {
      const parsed = JSON.parse(readFileSync(skippedPath, 'utf8'));
      if (Array.isArray(parsed)) {
        skipped = parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      skipped = [];
    }
  }

  return { client: slug, dir, envPath, skippedPath, values, skipped };
}

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    chmodSync(dir, 0o700);
  } catch {
    /* ignore on platforms that cannot chmod */
  }
}

function writePrivate(path: string, contents: string): void {
  writeFileSync(path, contents, { encoding: 'utf8', mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
    /* ignore */
  }
}

export function writeValue(client: string, envVariable: string, value: string): ClientVault {
  const vault = loadVault(client);
  ensureDir(vault.dir);
  vault.values[envVariable] = value.trim();
  vault.skipped = vault.skipped.filter((item) => item !== envVariable);
  writePrivate(vault.envPath, serializeEnv(vault.values));
  writePrivate(vault.skippedPath, `${JSON.stringify(vault.skipped, null, 2)}\n`);
  return vault;
}

export function skipValue(client: string, envVariable: string): ClientVault {
  const vault = loadVault(client);
  ensureDir(vault.dir);
  if (!vault.skipped.includes(envVariable)) {
    vault.skipped.push(envVariable);
  }
  writePrivate(vault.skippedPath, `${JSON.stringify(vault.skipped, null, 2)}\n`);
  if (!existsSync(vault.envPath)) {
    writePrivate(vault.envPath, serializeEnv(vault.values));
  }
  return vault;
}

export function removeValue(client: string, envVariable: string): ClientVault {
  const vault = loadVault(client);
  ensureDir(vault.dir);
  delete vault.values[envVariable];
  vault.skipped = vault.skipped.filter((item) => item !== envVariable);
  writePrivate(vault.envPath, serializeEnv(vault.values));
  writePrivate(vault.skippedPath, `${JSON.stringify(vault.skipped, null, 2)}\n`);
  return vault;
}
