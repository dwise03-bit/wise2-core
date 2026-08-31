import { spawn } from 'node:child_process';

export type CommandResult = { code: number; stdout: string; stderr: string };
export type RunOptions = { timeoutMs?: number; maxOutputBytes?: number; cwd?: string };

export class CommandTimeoutError extends Error {
  code = 'COMMAND_TIMEOUT' as const;
}

export function runCommand(binary: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const max = options.maxOutputBytes ?? 64_000;
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: options.cwd, shell: false, env: process.env });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const append = (current: string, chunk: Buffer) => Buffer.from(current + chunk.toString()).subarray(0, max).toString();
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(new CommandTimeoutError(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => { stdout = append(stdout, chunk); });
    child.stderr.on('data', (chunk: Buffer) => { stderr = append(stderr, chunk); });
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}
