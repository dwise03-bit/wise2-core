import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AuditEntry } from '../types.js';
import { redactText } from './redact.js';

export async function appendAudit(file: string, entry: AuditEntry, secrets: string[] = []): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, `${redactText(JSON.stringify(entry), secrets)}\n`, 'utf8');
}

export async function readAudit(file: string, limit = 100): Promise<AuditEntry[]> {
  try {
    const text = await readFile(file, 'utf8');
    return text.trim().split('\n').filter(Boolean).slice(-Math.min(limit, 500)).map(line => JSON.parse(line) as AuditEntry).reverse();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}
