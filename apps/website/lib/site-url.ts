import { headers } from 'next/headers';
import {
  BLACKHAIL_SITE_URL,
  isBlackhailHost,
  normalizeHost,
  WISE2_SITE_URL,
} from './site-domains';

/** Resolve the public site origin from the incoming request host. */
export function getRequestSiteUrl(): string {
  const headerList = headers();
  const host = normalizeHost(headerList.get('x-forwarded-host') ?? headerList.get('host'));

  if (isBlackhailHost(host)) {
    return BLACKHAIL_SITE_URL;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? WISE2_SITE_URL;
}
