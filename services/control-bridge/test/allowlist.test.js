import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLogLines, validateService } from '../src/adapters/docker.js';

test('normalizeLogLines caps requests at 500 lines', () => {
  assert.equal(normalizeLogLines(9999), 500);
  assert.equal(normalizeLogLines(0), 1);
});

test('validateService rejects services outside the allowlist', () => {
  assert.throws(() => validateService('postgres;rm -rf /', new Set(['api', 'website'])), /SERVICE_NOT_ALLOWED/);
});

test('validateService accepts an allowlisted service', () => {
  assert.equal(validateService('api', new Set(['api', 'website'])), 'api');
});
