'use strict';
/**
 * Local audit of every /ops interaction, including refusals. The relay and the bridge
 * keep their own records; this one answers "what did Discord ask for, and who asked".
 */
const { appendFile, mkdir } = require('node:fs/promises');
const { dirname } = require('node:path');

const SECRET_PATTERNS = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]'],
  [/([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|SIGNING_KEY)[A-Z0-9_]*=)[^\s"']+/gi, '$1[REDACTED]'],
];

function redact(text, secrets = []) {
  let output = secrets.filter(Boolean).reduce((current, secret) => current.split(secret).join('[REDACTED]'), text);
  for (const [pattern, replacement] of SECRET_PATTERNS) output = output.replace(pattern, replacement);
  return output;
}

function createOpsAuditor(options = {}) {
  const file = options.file;
  const secrets = options.secrets || [];
  const sink = options.sink;
  return async function audit(entry) {
    const line = redact(JSON.stringify({ at: new Date().toISOString(), ...entry }), secrets);
    if (sink) return sink(line);
    if (!file) return undefined;
    await mkdir(dirname(file), { recursive: true });
    return appendFile(file, `${line}\n`, 'utf8');
  };
}

module.exports = { createOpsAuditor, redact };
