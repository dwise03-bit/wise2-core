import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 16; i++) {
    if (
      existsSync(join(dir, 'pnpm-workspace.yaml')) ||
      existsSync(join(dir, '.git'))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  try {
    const here = dirname(fileURLToPath(import.meta.url));
    return resolve(here, '../../..');
  } catch {
    return process.cwd();
  }
}

export function vaultRoot(): string {
  const fromEnv = process.env.WISE2_API_KEYS_DIR?.trim();
  if (fromEnv) return resolve(fromEnv);
  return join(findRepoRoot(), 'data', 'clients');
}

export function sanitizeClientSlug(raw: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) {
    throw new Error('Client slug must be lowercase letters, numbers, and hyphens');
  }
  return slug;
}
