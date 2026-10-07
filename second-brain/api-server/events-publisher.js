'use strict';

const URL = process.env.HERMES_EVENTS_URL || '';
const SECRET = process.env.HERMES_EVENTS_SECRET || '';
const ENABLED = Boolean(URL && SECRET);

if (!ENABLED) {
  console.log('[brain-stream] disabled (HERMES_EVENTS_URL or HERMES_EVENTS_SECRET missing)');
} else {
  console.log(`[brain-stream] publishing to ${URL}/ingest`);
}

async function publishBrainStream(event_type, payload = {}, extras = {}) {
  if (!ENABLED) return;
  const body = {
    event_type,
    source: 'second-brain',
    ts: new Date().toISOString(),
    payload,
    ...extras,
  };
  try {
    await fetch(`${URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-events-key': SECRET },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(2000),
    });
  } catch { /* non-fatal: never break an API call because of telemetry */ }
}

module.exports = { publishBrainStream };
