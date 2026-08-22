/**
 * In-memory store bridging the studio's Suno-shaped API contract
 * (/api/suno/*) to the real MusicGen generation service. Shared across the
 * generate/status/export route handlers within this Next.js server process.
 *
 * Demo-grade only (resets on server restart) — matches the TODO-level mocks
 * it replaces, but now backed by real generation instead of fabricated data.
 */

export interface StoredGeneration {
  id: string; // gen_-prefixed, our public ID
  musicgenId?: string; // raw ID on the MusicGen service
  prompt: string;
  style?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  musicUrl?: string;
  duration?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const store = new Map<string, StoredGeneration>();

export function createGeneration(gen: StoredGeneration) {
  store.set(gen.id, gen);
  return gen;
}

export function updateGeneration(id: string, patch: Partial<StoredGeneration>) {
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  store.set(id, updated);
  return updated;
}

export function getGeneration(id: string) {
  return store.get(id);
}
