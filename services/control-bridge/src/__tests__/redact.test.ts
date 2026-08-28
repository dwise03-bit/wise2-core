import { expect, it } from 'vitest';
import { boundedText, redactText } from '../lib/redact.js';

it('redacts configured secrets', () => {
  expect(redactText('token=abc123', ['abc123'])).toBe('token=[REDACTED]');
});

it('redacts bearer tokens and secret-like assignments', () => {
  const input = 'Authorization: Bearer super-secret\nAPI_KEY=abc123\nPASSWORD=hunter2';
  expect(redactText(input)).toBe('Authorization: Bearer [REDACTED]\nAPI_KEY=[REDACTED]\nPASSWORD=[REDACTED]');
});

it('bounds returned output by bytes', () => {
  expect(boundedText('1234567890', 5)).toBe('12345');
});
