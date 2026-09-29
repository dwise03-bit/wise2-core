import { isFieldTechNative } from './native-google-signin.ts';

export function mapsHref(address: string): string {
  const query = encodeURIComponent(address);
  return isFieldTechNative()
    ? `https://maps.apple.com/?daddr=${query}&dirflg=d`
    : `https://maps.google.com/?q=${query}`;
}
