const VALID_NAME = /^[a-z0-9][a-z0-9_.-]*$/;

export function validateName(name: string, allowlist: string[]): string {
  if (!VALID_NAME.test(name) || !allowlist.includes(name)) {
    throw Object.assign(new Error('Target is not allowlisted'), { code: 'TARGET_NOT_ALLOWED' });
  }
  return name;
}

export function clampLines(value: unknown, fallback = 200, max = 500): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}
