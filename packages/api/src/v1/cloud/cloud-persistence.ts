import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data', 'cloud');

export function loadJsonFile<T>(filename: string, fallback: T): T {
  try {
    const path = join(DATA_DIR, filename);
    if (!existsSync(path)) {
      return fallback;
    }
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function saveJsonFile<T>(filename: string, value: T): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(value, null, 2), 'utf8');
}
