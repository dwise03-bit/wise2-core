import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIVERSAL_SKILLS, resolveUniversalSkill, planUniversalSkill } from './universal-skills.js';

test('ships six distinct universal skill definitions', () => {
  assert.equal(UNIVERSAL_SKILLS.length, 6);
  assert.equal(new Set(UNIVERSAL_SKILLS.map(s => s.id)).size, 6);
});
test('routes common commands to their intended skill', () => {
  assert.equal(resolveUniversalSkill('Remember that my client prefers cyan').id, 'imp.remember');
  assert.equal(resolveUniversalSkill('Add to list milk').id, 'imp.list');
  assert.equal(resolveUniversalSkill('Draft a message').id, 'imp.write');
});
test('never claims an unavailable capability is ready', () => {
  assert.deepEqual(planUniversalSkill('find laptops'), {
    status: 'needs-setup', skillId: 'imp.find', capability: 'web.search'
  });
});
test('write commands request confirmation', () => {
  const p = planUniversalSkill('save a note about the meeting', { 'memory.write': true });
  assert.equal(p.status, 'ready');
  assert.equal(p.confirmation, 'write');
});
test('disabled skills cannot be routed', () => {
  assert.equal(resolveUniversalSkill('find laptops', ['imp.write']), null);
});
