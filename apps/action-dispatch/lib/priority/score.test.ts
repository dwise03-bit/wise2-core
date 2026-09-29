import assert from 'node:assert/strict';
import test from 'node:test';
import type { Conversation } from '../types.ts';
import {
  assessConversation,
  bandForScore,
  clampOpportunity,
  clampScore,
  compareQueueItems,
  emptySignals,
} from './score.ts';

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-a',
    channel: 'phone',
    direction: 'inbound',
    receivedAt: '2026-08-30T12:00:00.000Z',
    transcript: [],
    summary: 'test',
    customerStatement: 'test',
    status: 'new',
    priorityOverride: null,
    customerId: 'cust-a',
    issue: 'test',
    detectedSignals: emptySignals(),
    ...overrides,
  };
}

test('each scoring factor applies its documented points', () => {
  const cases = [
    ['immediateSafety', 35],
    ['completeLossEssential', 22],
    ['vulnerableOccupant', 15],
    ['activePropertyDamage', 20],
    ['existingCustomer', 5],
    ['repeatFailure', 8],
    ['sameDayAvailability', 5],
  ] as const;

  for (const [flag, points] of cases) {
    const result = assessConversation(conversation({ detectedSignals: emptySignals({ [flag]: true }) }));
    assert.equal(result.score, points, flag);
    assert.equal(result.factors.length, 1);
    assert.equal(result.factors[0].points, points);
  }
});

test('high opportunity is clamped to 10 and ignored when zero', () => {
  assert.equal(clampOpportunity(12), 10);
  assert.equal(clampOpportunity(-3), 0);
  assert.equal(assessConversation(conversation({ detectedSignals: emptySignals({ highOpportunityPoints: 7 }) })).score, 7);
  assert.equal(assessConversation(conversation({ detectedSignals: emptySignals({ highOpportunityPoints: 0 }) })).factors.length, 0);
});

test('routine admin and already handled subtract and clamp at zero', () => {
  const admin = assessConversation(conversation({ detectedSignals: emptySignals({ routineAdministrative: true }) }));
  assert.equal(admin.score, 0);
  assert.equal(admin.factors[0].points, -25);

  const handled = assessConversation(
    conversation({
      status: 'completed',
      detectedSignals: emptySignals({ existingCustomer: true }),
    }),
  );
  assert.equal(handled.score, 0);
  assert.ok(handled.factors.some((factor) => factor.code === 'already_handled'));
});

test('combined cooling emergency clamps at 100 and stays critical', () => {
  const result = assessConversation(
    conversation({
      detectedSignals: emptySignals({
        immediateSafety: true,
        completeLossEssential: true,
        vulnerableOccupant: true,
        existingCustomer: true,
        repeatFailure: true,
        sameDayAvailability: true,
        highOpportunityPoints: 8,
      }),
    }),
  );
  assert.equal(result.score, 98);
  assert.equal(result.band, 'critical');
  assert.equal(result.rulesVersion, 'priority-rules-v1');
});

test('bands and clamp behave at the documented edges', () => {
  assert.equal(bandForScore(80), 'critical');
  assert.equal(bandForScore(79), 'high');
  assert.equal(bandForScore(60), 'high');
  assert.equal(bandForScore(59), 'medium');
  assert.equal(bandForScore(35), 'medium');
  assert.equal(bandForScore(34), 'low');
  assert.equal(clampScore(140), 100);
  assert.equal(clampScore(-12), 0);
});

test('manual override replaces rule factors', () => {
  const result = assessConversation(conversation({ priorityOverride: 91 }));
  assert.equal(result.score, 91);
  assert.equal(result.band, 'critical');
  assert.deepEqual(result.factors.map((factor) => factor.code), ['manual_override']);
});

test('ties break by oldest unhandled conversation then stable id', () => {
  const older = {
    conversation: conversation({ id: 'b', receivedAt: '2026-08-30T10:00:00.000Z' }),
    assessment: assessConversation(conversation()),
  };
  const newer = {
    conversation: conversation({ id: 'a', receivedAt: '2026-08-30T11:00:00.000Z' }),
    assessment: assessConversation(conversation()),
  };
  assert.ok(compareQueueItems(older, newer) < 0);

  const first = {
    conversation: conversation({ id: 'conv-a', receivedAt: '2026-08-30T10:00:00.000Z' }),
    assessment: assessConversation(conversation()),
  };
  const second = {
    conversation: conversation({ id: 'conv-b', receivedAt: '2026-08-30T10:00:00.000Z' }),
    assessment: assessConversation(conversation()),
  };
  assert.ok(compareQueueItems(first, second) < 0);
});
