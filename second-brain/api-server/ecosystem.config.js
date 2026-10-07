'use strict';

const fs = require('fs');
const path = require('path');

// Load HERMES_EVENTS_* from the user config file, if present. Reversible: the
// file is 0600 and lives in ~/.config/wise2/, outside this repo. If the file
// is missing we fall back to the current process env (publisher stays disabled).
function loadDotEnv(file) {
  const out = {};
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch { /* file missing is fine */ }
  return out;
}

const hermesEnv = loadDotEnv(path.join(process.env.HOME || '/home/dwise', '.config', 'wise2', 'hermes-events.env'));

module.exports = {
  apps: [{
    name: 'wise2-second-brain',
    script: 'server.js',
    cwd: __dirname,
    env: {
      PORT: 3012,
      OLLAMA_MODEL: 'qwen2.5-coder:7b',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:admin-dev-password@127.0.0.1:27017/wise2-brain?authSource=admin',
      COMMAND_CENTER_URL: 'http://127.0.0.1:3002',
      JWT_SECRET: process.env.JWT_SECRET,
      HERMES_EVENTS_URL: process.env.HERMES_EVENTS_URL || 'http://127.0.0.1:3017',
      HERMES_EVENTS_SECRET: process.env.HERMES_EVENTS_SECRET || hermesEnv.HERMES_EVENTS_SECRET || '',
    },
  }],
};
