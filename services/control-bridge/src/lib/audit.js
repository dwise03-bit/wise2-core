import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function appendAudit(file, entry) {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(entry)}\n`, { encoding: 'utf8', mode: 0o600 });
}

export async function readAudit(file, limit = 100) {
  try {
    const text = await readFile(file, 'utf8');
    return text.trim().split('\n').filter(Boolean).slice(-Math.min(500, Math.max(1, limit))).map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}
