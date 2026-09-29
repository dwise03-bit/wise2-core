const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function parseClock(value: string | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function phoneTail(value: string | null | undefined): string {
  const digits = digitsOnly(value);
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = phoneTail(a);
  const right = phoneTail(b);
  return Boolean(left) && left === right;
}

export function isWithinBusinessHours(
  hours: unknown,
  timezone: string,
  now = new Date(),
): boolean {
  if (!hours || typeof hours !== 'object') return true;

  let local: Date;
  try {
    local = new Date(now.toLocaleString('en-US', { timeZone: timezone || 'America/New_York' }));
  } catch {
    local = now;
  }

  const day = DAY_KEYS[local.getDay()];
  const config = (hours as Record<string, { open?: string; close?: string; closed?: boolean }>)[day]
    ?? (hours as Record<string, { open?: string; close?: string; closed?: boolean }>)[day.slice(0, 3)];

  if (!config) return true;
  if (config.closed) return false;

  const open = parseClock(config.open);
  const close = parseClock(config.close);
  if (open == null || close == null) return true;

  const current = local.getHours() * 60 + local.getMinutes();
  return current >= open && current < close;
}
