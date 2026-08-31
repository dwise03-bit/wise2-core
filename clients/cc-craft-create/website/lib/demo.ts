/** Demo mode helpers — no database or Stripe required for client presentations. */

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function useDemoData(): boolean {
  return isDemoMode() || !hasDatabase();
}
