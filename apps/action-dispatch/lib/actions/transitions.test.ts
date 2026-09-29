import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canTransitionAction,
  canTransitionConversation,
  cannotSkipConfirmation,
  conversationStatusAfterAction,
  requiresConfirmation,
} from './transitions.ts';
import { ACTION_TYPES } from '../types.ts';

test('every side-effecting action requires confirmation', () => {
  for (const type of ACTION_TYPES) {
    assert.equal(requiresConfirmation(type), true);
  }
});

test('draft cannot jump to simulated success', () => {
  assert.equal(cannotSkipConfirmation('draft', 'simulated_success'), true);
  assert.equal(canTransitionAction('draft', 'simulated_success'), false);
  assert.equal(canTransitionAction('draft', 'awaiting_confirmation'), true);
  assert.equal(canTransitionAction('awaiting_confirmation', 'simulated_success'), true);
  assert.equal(canTransitionAction('awaiting_confirmation', 'canceled'), true);
  assert.equal(canTransitionAction('awaiting_confirmation', 'failed'), true);
  assert.equal(canTransitionAction('simulated_success', 'canceled'), false);
});

test('failed drafts can be retried without losing the conversation', () => {
  assert.equal(canTransitionAction('failed', 'awaiting_confirmation'), true);
  assert.equal(canTransitionAction('failed', 'draft'), true);
});

test('completed conversations do not reopen via action success', () => {
  assert.equal(conversationStatusAfterAction('dispatch', 'completed'), 'completed');
  assert.equal(canTransitionConversation('completed', 'dispatched'), false);
});

test('legal conversation transitions follow the dispatcher workflow', () => {
  assert.equal(canTransitionConversation('new', 'dispatched'), true);
  assert.equal(canTransitionConversation('new', 'deferred'), true);
  assert.equal(canTransitionConversation('deferred', 'needs_review'), true);
  assert.equal(canTransitionConversation('completed', 'new'), false);
  assert.equal(conversationStatusAfterAction('dispatch', 'new'), 'dispatched');
  assert.equal(conversationStatusAfterAction('book', 'needs_review'), 'scheduled');
  assert.equal(conversationStatusAfterAction('quote', 'new'), 'quoted');
});
