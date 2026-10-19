import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRegistry, TaskEngine, TaskStatus } from '../src/companion-core.js';

test('project review executes real adapter steps and ends verified', async () => {
  const calls = [];
  const api = {
    findFiles: async () => { calls.push('find'); return { files: ['package.json'] }; },
    summarizeProject: async () => { calls.push('summary'); return { summary: 'One manifest' }; },
    saveTasks: async () => { calls.push('tasks'); return { saved: true }; },
    launchApprovedApp: async () => ({ launched: true })
  };
  const statuses = [];
  const engine = new TaskEngine({
    registry: createDefaultRegistry(api),
    permissions: { request: async () => true },
    onStatus: ({ status }) => statuses.push(status)
  });
  const output = await engine.run('project.review', { root: 'C:/approved/project' });
  assert.deepEqual(calls, ['find', 'summary', 'tasks']);
  assert.equal(output.task.status, TaskStatus.SUCCESS);
  assert.ok(statuses.includes(TaskStatus.VERIFYING));
});

test('denied permission performs no work', async () => {
  const engine = new TaskEngine({
    registry: createDefaultRegistry({ findFiles: async () => { throw new Error('must not run'); } }),
    permissions: { request: async () => false }
  });
  await assert.rejects(() => engine.run('project.find', { root: 'C:/approved' }), { code: 'PERMISSION_DENIED' });
});