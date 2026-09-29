import assert from 'node:assert/strict';
import test from 'node:test';
import { createSeedCatalog } from '../seed.ts';
import { buildReview, cancelDraft, confirmDraft, initialState, openDraft } from '../store.ts';
import { commandMetrics, emptyQueueMessage, queryQueue } from './queue.ts';

const NOW = '2026-08-30T21:46:00.000Z';

test('seed queue places the cooling emergency at priority 01', () => {
  const queue = queryQueue(createSeedCatalog(), 'all', '', NOW);
  assert.equal(queue[0].conversation.id, 'conv-harlow-nocoool');
  assert.equal(queue[0].rank, 1);
  assert.equal(queue[0].assessment.band, 'critical');
  assert.ok(queue[0].assessment.score >= 80);
  assert.ok(queue[0].assessment.factors.some((factor) => factor.code === 'immediate_safety'));
});

test('filters isolate emergency, action, scheduled, and completed records', () => {
  const catalog = createSeedCatalog();
  const emergency = queryQueue(catalog, 'emergency', '', NOW);
  assert.ok(emergency.every((item) => item.assessment.band === 'critical'));
  assert.ok(emergency.some((item) => item.conversation.id === 'conv-harlow-nocoool'));

  const needsAction = queryQueue(catalog, 'needs_action', '', NOW);
  assert.ok(needsAction.every((item) => ['new', 'needs_review', 'callback_due'].includes(item.conversation.status)));

  const scheduled = queryQueue(catalog, 'scheduled', '', NOW);
  assert.ok(scheduled.some((item) => item.conversation.id === 'conv-cho-scheduled'));

  const completed = queryQueue(catalog, 'completed', '', NOW);
  assert.ok(completed.some((item) => item.conversation.id === 'conv-bennett-done'));
});

test('search matches customer, phone, address, issue, and equipment', () => {
  const catalog = createSeedCatalog();
  assert.equal(queryQueue(catalog, 'all', 'Eleanor', NOW)[0].customer.name, 'Eleanor Harlow');
  assert.equal(queryQueue(catalog, 'all', '5520140003', NOW)[0].conversation.id, 'conv-okonkwo-electrical');
  assert.equal(queryQueue(catalog, 'all', 'Maple Court', NOW)[0].conversation.id, 'conv-harlow-nocoool');
  assert.equal(queryQueue(catalog, 'all', 'invoice', NOW)[0].conversation.id, 'conv-ross-invoice');
  assert.equal(queryQueue(catalog, 'all', 'Carrier', NOW)[0].conversation.id, 'conv-harlow-nocoool');
  assert.equal(queryQueue(catalog, 'all', 'zzzz-unknown', NOW).length, 0);
  assert.match(emptyQueueMessage('all', 'zzzz-unknown'), /zzzz-unknown/);
});

test('canceling a dispatch review makes no conversation mutation', async () => {
  const started = initialState();
  const item = queryQueue(started.catalog, 'all', '', started.clock)[0];
  const review = buildReview(item.conversation, item.customer.name, item.customer.phone, 'dispatch');
  const opened = openDraft(started, review, item.customer.phone);
  const canceled = cancelDraft(opened);
  const original = started.catalog.conversations.find((row) => row.id === item.conversation.id);
  const after = canceled.catalog.conversations.find((row) => row.id === item.conversation.id);
  assert.equal(after?.status, original?.status);
  assert.equal(canceled.review, null);
  assert.ok(canceled.catalog.actions.some((action) => action.status === 'canceled'));
});

test('confirming dispatch updates status, audit, metrics, and rerank without losing filter', async () => {
  let state = initialState();
  state = { ...state, filter: 'needs_action' };
  const top = queryQueue(state.catalog, state.filter, state.search, state.clock)[0];
  assert.equal(top.conversation.id, 'conv-harlow-nocoool');
  const review = buildReview(top.conversation, top.customer.name, top.customer.phone, 'dispatch');
  state = openDraft(state, review, top.customer.phone);
  state = await confirmDraft(state);

  const updated = state.catalog.conversations.find((row) => row.id === top.conversation.id);
  assert.equal(updated?.status, 'dispatched');
  assert.ok(state.catalog.audit.some((event) => event.action === 'action.dispatch.simulated_success'));
  assert.equal(state.filter, 'needs_action');
  assert.equal(state.selectedId, top.conversation.id);

  const remaining = queryQueue(state.catalog, state.filter, state.search, state.clock);
  assert.ok(!remaining.some((item) => item.conversation.id === top.conversation.id));
  assert.equal(remaining[0].conversation.id, 'conv-okonkwo-electrical');

  const all = queryQueue(state.catalog, 'all', '', state.clock);
  const metrics = commandMetrics(all);
  assert.equal(metrics.urgentItems, 1);
  assert.ok(metrics.scheduledValueCents >= 18900);
});
