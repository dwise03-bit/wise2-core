import assert from 'node:assert/strict';
import test from 'node:test';
import { conversationAge, formatCents, formatPhone, normalizePhone, rankLabel } from './format.ts';

test('phones store normalized and display formatted', () => {
  assert.equal(normalizePhone('(552) 014-0001'), '+15520140001');
  assert.equal(formatPhone('+15520140001'), '+1 (552) 014-0001');
});

test('currency and age stay deterministic', () => {
  assert.equal(formatCents(18900), '$189');
  assert.equal(conversationAge('2026-08-30T19:46:00.000Z', '2026-08-30T21:46:00.000Z'), '2h');
  assert.equal(rankLabel(1), '01');
});
