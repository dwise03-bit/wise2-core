// Revenue OS — display formatting.
//
// Every formatter renders an em dash for null/undefined. That is the visible
// contract: a dash means "the API did not give us this", and it must never be
// silently replaced with a zero or a plausible-looking figure.

export const NO_VALUE = '—';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NO_VALUE;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NO_VALUE;
  return value.toLocaleString('en-US');
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NO_VALUE;
  // Accepts either 0.42 or 42 and renders 42%.
  const pct = value > 0 && value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export function formatRoas(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NO_VALUE;
  return `${value.toFixed(2)}x`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return NO_VALUE;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return NO_VALUE;

  const diffSec = Math.round((Date.now() - then) / 1000);
  const abs = Math.abs(diffSec);
  const suffix = diffSec >= 0 ? 'ago' : 'from now';

  if (abs < 60) return `${abs}s ${suffix}`;
  if (abs < 3600) return `${Math.round(abs / 60)}m ${suffix}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${suffix}`;
  return `${Math.round(abs / 86400)}d ${suffix}`;
}

/** Turns NEEDS_CONFIG / lead_created into "Needs config" / "Lead created". */
export function humanize(value: string | null | undefined): string {
  if (!value) return NO_VALUE;
  const words = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
