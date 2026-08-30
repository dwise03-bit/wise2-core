'use client';

export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('sencere_token='))
    ?.split('=')[1];
  return token || null;
}

export function setTokenCookie(token: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `sencere_token=${token}; path=/; max-age=2592000; Secure; SameSite=Strict`;
}

export function clearTokenCookie() {
  if (typeof window === 'undefined') return;
  document.cookie = 'sencere_token=; path=/; max-age=0';
}
