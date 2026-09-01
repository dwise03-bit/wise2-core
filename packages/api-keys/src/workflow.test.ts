import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fieldsForProfile, getField } from './catalog.ts';
import { sanitizeClientSlug } from './paths.ts';
import { maskSecret, validateFieldValue } from './validate.ts';
import { getNextPrompt, getStatus, skipKey, storeKey } from './workflow.ts';

test('maskSecret never returns the full value', () => {
  const value = 'sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const masked = maskSecret(value);
  assert.equal(masked.includes('sk_live_abcdef'), false);
  assert.equal(masked.endsWith('xxxx'), true);
});

test('validateFieldValue checks prefix and emptiness', () => {
  const field = getField('STRIPE_SECRET_KEY');
  assert.ok(field);
  assert.ok(validateFieldValue(field, ''));
  assert.ok(validateFieldValue(field, 'pk_live_not_a_secret'));
  assert.equal(validateFieldValue(field, 'sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX'), undefined);
});

test('sanitizeClientSlug rejects empty and odd input', () => {
  assert.equal(sanitizeClientSlug('Get Down'), 'get-down');
  assert.throws(() => sanitizeClientSlug('***'));
});

test('gather workflow stores, masks, skips, and advances', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wise2-api-keys-'));
  process.env.WISE2_API_KEYS_DIR = dir;
  try {
    const client = 'getdown';
    const first = getNextPrompt(client, 'core');
    assert.equal(first.done, false);
    assert.equal(first.field?.envVariable, 'STRIPE_SECRET_KEY');

    const bad = storeKey(client, 'STRIPE_SECRET_KEY', 'nope');
    assert.equal(bad.ok, false);
    assert.ok(bad.error);

    const good = storeKey(client, 'STRIPE_SECRET_KEY', 'sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    assert.equal(good.ok, true);
    assert.equal(good.masked?.includes('sk_live_abcdef'), false);

    const status = getStatus(client, 'core');
    const stripe = status.fields.find((row) => row.envVariable === 'STRIPE_SECRET_KEY');
    assert.equal(stripe?.status, 'configured');
    assert.equal(JSON.stringify(status).includes('sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX'), false);

    skipKey(client, 'STRIPE_PUBLISHABLE_KEY');
    const next = getNextPrompt(client, 'core');
    assert.notEqual(next.field?.envVariable, 'STRIPE_PUBLISHABLE_KEY');
  } finally {
    delete process.env.WISE2_API_KEYS_DIR;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('field-service profile includes Jobber required keys', () => {
  const names = fieldsForProfile('field-service').map((field) => field.envVariable);
  assert.ok(names.includes('JOBBER_ACCESS_TOKEN'));
  assert.ok(names.includes('TWILIO_ACCOUNT_SID'));
});
