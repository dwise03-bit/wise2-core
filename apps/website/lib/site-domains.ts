export const BLACKHAIL_HOSTS = new Set([
  'blackhail.store',
  'www.blackhail.store',
  'blakkhail.com',
  'www.blakkhail.com',
]);

export const BLACKHAIL_SITE_URL = 'https://blakkhail.com';
export const WISE2_SITE_URL = 'https://wise2.net';

export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.split(':')[0]?.toLowerCase() ?? null;
}

export function isBlackhailHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  return normalized ? BLACKHAIL_HOSTS.has(normalized) : false;
}

export function isBlackhailBrand(siteBrand: string | null | undefined): boolean {
  return siteBrand === 'blakkhail';
}

/** Product path for the active site (clean URLs on blackhail.store). */
export function productPath(slug: string, host: string | null | undefined): string {
  return isBlackhailHost(host) ? `/products/${slug}` : `/sencere/products/${slug}`;
}

export function checkoutPath(host: string | null | undefined): string {
  return isBlackhailHost(host) ? '/checkout' : '/sencere/checkout';
}

export function homePath(host: string | null | undefined): string {
  return isBlackhailHost(host) ? '/sencere' : '/sencere/blakkhail';
}
