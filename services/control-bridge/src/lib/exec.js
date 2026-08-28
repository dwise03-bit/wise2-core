import { spawn } from 'node:child_process';

export function boundedText(input, maxBytes = 64000) {
  return Buffer.from(String(input)).subarray(0, Math.max(0, maxBytes)).toString();
}

export function redactText(input, secrets = []) {
  let value = String(input);
  for (const secret of secrets.filter(Boolean)) value = value.split(secret).join('[REDACTED]');
  return value;
}

export function runCommand(binary, args = [], options = {}) {
  const timeoutMs = options.timeoutMs ?? 10000;
  const maxOutputBytes = options.maxOutputBytes ?? 64000;
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: options.cwd, shell: false, env: options.env ?? process.env });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      const error = new Error(`Command timed out after ${timeoutMs}ms`);
      error.code = 'COMMAND_TIMEOUT';
      reject(error);
    }, timeoutMs);
    child.stdout?.on('data', chunk => { stdout = boundedText(stdout + chunk, maxOutputBytes); });
    child.stderr?.on('data', chunk => { stderr = boundedText(stderr + chunk, maxOutputBytes); });
    child.on('error', error => { if (!settled) { settled = true; clearTimeout(timer); reject(error); } });
    child.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}
