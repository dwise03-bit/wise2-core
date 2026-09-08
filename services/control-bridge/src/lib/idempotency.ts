import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type IdempotencyEntry = {
  key: string;
  jobId: string;
  action: string;
  target: string;
  recordedAt: string;
  requestId: string;
};

export type IdempotencyLedger = {
  lookup(key: string): IdempotencyEntry | undefined;
  record(entry: IdempotencyEntry): Promise<void>;
};

/**
 * File-backed so a bridge restart cannot turn a retried confirmation into a second
 * execution. The ledger is loaded once at boot and appended to on every executed write.
 */
export async function loadIdempotencyLedger(file: string): Promise<IdempotencyLedger> {
  const entries = new Map<string, IdempotencyEntry>();
  try {
    const text = await readFile(file, 'utf8');
    for (const line of text.trim().split('\n').filter(Boolean)) {
      const entry = JSON.parse(line) as IdempotencyEntry;
      if (entry?.key) entries.set(entry.key, entry);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  return {
    lookup(key) {
      return entries.get(key);
    },
    async record(entry) {
      entries.set(entry.key, entry);
      await mkdir(dirname(file), { recursive: true });
      await appendFile(file, `${JSON.stringify(entry)}\n`, 'utf8');
    },
  };
}
