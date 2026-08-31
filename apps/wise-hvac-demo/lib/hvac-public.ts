const DEFAULT_HVAC_URL = 'https://hvac.wise2.net';
const DEFAULT_API_URL = 'https://wise2.net/api';

export const HVAC_BASE_PATH = '/wise-hvac-demo';

export function hvacPublicUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HVAC_URL ||
    process.env.NEXTAUTH_URL ||
    DEFAULT_HVAC_URL
  ).replace(/\/$/, '');
}

export function wise2PublicApiUrl(): string {
  const publicApi = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.WISE2_API_URL ||
    process.env.API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, '');
  return publicApi.endsWith('/api') ? publicApi : `${publicApi}/api`;
}

export function hvacAppUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(HVAC_BASE_PATH)) {
    return `${hvacPublicUrl()}${normalized}`;
  }
  return `${hvacPublicUrl()}${HVAC_BASE_PATH}${normalized}`;
}

export function webBasePath(): string {
  if (process.env.CAPACITOR_BUILD === '1') return '';
  return process.env.NEXT_PUBLIC_BASE_PATH || HVAC_BASE_PATH;
}
