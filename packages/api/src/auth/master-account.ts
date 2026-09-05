export const MASTER_ACCOUNT_EMAILS = [
  'dwise03@gmail.com',
  'darrinwisejr@gmail.com',
] as const;

/** Primary master account. Kept for callers that need a single canonical owner. */
export const MASTER_ACCOUNT_EMAIL = MASTER_ACCOUNT_EMAILS[0];

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function isMasterAccountEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  return MASTER_ACCOUNT_EMAILS.some((master) => master === normalized);
}

export function roleForEmail(email: string | null | undefined): 'FOUNDER' | 'CUSTOMER' {
  return isMasterAccountEmail(email) ? 'FOUNDER' : 'CUSTOMER';
}
