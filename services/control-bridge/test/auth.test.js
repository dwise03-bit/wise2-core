import test from 'node:test';
import assert from 'node:assert/strict';
import { authorize } from '../src/auth.js';

test('authorize rejects a missing bearer token', () => {
  assert.equal(authorize(undefined, 'secret-token'), false);
});

test('authorize accepts the exact bearer token', () => {
  assert.equal(authorize('Bearer secret-token', 'secret-token'), true);
});

test('authorize rejects a different token', () => {
  assert.equal(authorize('Bearer secret-tokeN', 'secret-token'), false);
});
