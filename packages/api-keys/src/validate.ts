import type { ApiField } from './types.ts';

export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '••••';
  return `…${trimmed.slice(-4)}`;
}

export function validateFieldValue(field: ApiField, raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return `${field.name} is empty`;
  if (value.includes('\n') || value.includes('\r')) {
    return `${field.name} cannot contain line breaks`;
  }
  if (/\s/.test(value) && field.envVariable !== 'TWILIO_PHONE_NUMBER') {
    return `${field.name} cannot contain spaces`;
  }
  if (field.minLength && value.length < field.minLength) {
    return `${field.name} looks too short`;
  }
  if (field.prefix) {
    const prefixes = Array.isArray(field.prefix) ? field.prefix : [field.prefix];
    if (!prefixes.some((prefix) => value.startsWith(prefix))) {
      return `${field.name} should start with ${prefixes.join(' or ')}`;
    }
  }
  return undefined;
}
