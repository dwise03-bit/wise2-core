'use strict';
/**
 * Client for the MacBook control relay. The bot signs; the relay verifies; the bridge
 * verifies again. This module holds no policy of its own.
 */

const DEFAULT_TIMEOUT_MS = 30_000;

function createRelayClient(options) {
  const baseUrl = String(options.baseUrl || '').replace(/\/+$/, '');
  const token = options.token;
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  async function call(path, init = {}) {
    if (!baseUrl) return { ok: false, code: 'RELAY_NOT_CONFIGURED', message: 'WISE2_RELAY_URL is not set' };
    if (!token) return { ok: false, code: 'RELAY_NOT_CONFIGURED', message: 'WISE2_RELAY_TOKEN is not set' };
    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers || {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      // The relay is the only path to a host. If it is down, the action did not happen —
      // say so rather than leaving the operator guessing.
      return { ok: false, code: 'RELAY_UNREACHABLE', message: 'The control relay is not reachable; no action was taken', detail: error.name };
    }
    let body;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    if (!response.ok || !body || body.ok === false) {
      const error = (body && body.error) || {};
      return { ok: false, status: response.status, code: error.code || `RELAY_HTTP_${response.status}`, message: error.message || 'The relay rejected this job', detail: error.detail };
    }
    return { ok: true, status: response.status, body };
  }

  return {
    submit(payload) {
      return call('/v1/relay/jobs', { method: 'POST', body: JSON.stringify(payload) });
    },
    targets() {
      return call('/v1/relay/targets', { method: 'GET' });
    },
    health() {
      return call('/v1/relay/health', { method: 'GET' });
    },
  };
}

module.exports = { createRelayClient };
