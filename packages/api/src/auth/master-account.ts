export const MASTER_ACCOUNT_EMAIL = 'dwise03@gmail.com';

export function isMasterAccountEmail(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === MASTER_ACCOUNT_EMAIL;
}

export function roleForEmail(email: string | null | undefined): 'FOUNDER' | 'CUSTOMER' {
  return isMasterAccountEmail(email) ? 'FOUNDER' : 'CUSTOMER';
}
