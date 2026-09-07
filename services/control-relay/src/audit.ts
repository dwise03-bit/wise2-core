import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { redactText } from '../../../packages/ops-protocol/src/index.js';
import type { RelayAuditEntry } from './types.js';

export async function appendAudit(file: string, entry: RelayAuditEntry, secrets: string[] = []): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, `${redactText(JSON.stringify(entry), secrets)}\n`, 'utf8');
}

export async function readAudit(file: string, limit = 100): Promise<RelayAuditEntry[]> {
  try {
    const text = await readFile(file, 'utf8');
    return text.trim().split('\n').filter(Boolean).slice(-Math.min(limit, 500)).map(line => JSON.parse(line) as RelayAuditEntry).reverse();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}
