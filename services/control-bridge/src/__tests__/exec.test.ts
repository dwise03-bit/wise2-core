import { describe, expect, it } from 'vitest';
import { runCommand } from '../lib/exec.js';

describe('runCommand', () => {
  it('passes arguments without shell expansion', async () => {
    const result = await runCommand('/usr/bin/printf', ['%s', '$(whoami)']);
    expect(result.stdout).toBe('$(whoami)');
    expect(result.code).toBe(0);
  });

  it('times out long commands', async () => {
    await expect(
      runCommand('/bin/sleep', ['2'], { timeoutMs: 50 }),
    ).rejects.toMatchObject({ code: 'COMMAND_TIMEOUT' });
  });
});
