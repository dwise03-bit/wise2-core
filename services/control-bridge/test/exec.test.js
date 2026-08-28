import test from 'node:test';
import assert from 'node:assert/strict';
import { runCommand, boundedText, redactText } from '../src/lib/exec.js';

test('runCommand passes arguments without shell expansion', async () => {
  const result = await runCommand('/usr/bin/printf', ['%s', '$(whoami)']);
  assert.equal(result.stdout, '$(whoami)');
  assert.equal(result.code, 0);
});

test('runCommand times out long commands', async () => {
  await assert.rejects(
    () => runCommand('/usr/bin/sleep', ['2'], { timeoutMs: 25 }),
    (error) => error?.code === 'COMMAND_TIMEOUT'
  );
});

test('redactText removes configured secrets', () => {
  assert.equal(redactText('token=abc123', ['abc123']), 'token=[REDACTED]');
});

test('boundedText caps returned output', () => {
  assert.equal(boundedText('1234567890', 5), '12345');
});
