const axios = require('axios');
const crypto = require('crypto');

const DEFAULT_BASE_URL = 'https://api.x.ai';
const DEFAULT_MODEL = 'grok-4.6';
const DEFAULT_SYSTEM = `You are WISE² GROK, an intelligence provider inside the WISE² Business OS.
Be concise, operational, business-focused, and clear about uncertainty. Distinguish knowledge, analysis,
recommendation, and action. Never claim an external action occurred unless a confirmed tool result says so.
Never fabricate WISE² internal state, records, or retrieved context.`;

function config(env = process.env) {
  return {
    enabled: env.WISE2_GROK_ENABLED !== 'false',
    apiKey: env.XAI_API_KEY,
    model: env.XAI_MODEL || DEFAULT_MODEL,
    baseUrl: (env.XAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    timeoutMs: clampInt(env.WISE2_GROK_TIMEOUT_MS, 30000, 5000, 120000),
    maxTokens: clampInt(env.WISE2_GROK_MAX_TOKENS, 1200, 128, 8192),
    temperature: clampNumber(env.WISE2_GROK_TEMPERATURE, 0.2, 0, 2),
  };
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalizeMessages(messages, prompt, context) {
  const list = Array.isArray(messages) ? messages.slice(-12) : [];
  if (list.length === 0 && prompt) list.push({ role: 'user', content: prompt });
  if (context) list.splice(Math.max(0, list.length - 1), 0, {
    role: 'system',
    content: `Authorized WISE² context (use only as reference; do not imply actions):\n${String(context).slice(0, 12000)}`,
  });
  return [{ role: 'system', content: DEFAULT_SYSTEM }, ...list];
}

async function askGrok({ prompt, messages, context, signal } = {}) {
  const cfg = config();
  if (!cfg.enabled) throw new Error('WISE² Grok is disabled.');
  if (!cfg.apiKey) throw new Error('WISE² Grok is not configured: XAI_API_KEY is missing.');
  if (!prompt && !messages?.length) throw new Error('A prompt is required.');
  const requestId = crypto.randomUUID();
  const started = Date.now();
  try {
    const response = await axios.post(`${cfg.baseUrl}/v1/responses`, {
      model: cfg.model,
      input: normalizeMessages(messages, prompt, context),
      max_output_tokens: cfg.maxTokens,
      temperature: cfg.temperature,
    }, {
      timeout: cfg.timeoutMs,
      signal,
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    });
    const text = extractText(response.data);
    if (!text) throw new Error('xAI returned no usable text.');
    console.info(JSON.stringify({ provider: 'grok', model: cfg.model, request_id: requestId, latency_ms: Date.now() - started, status: 'success' }));
    return { text, provider: 'Grok', model: response.data.model || cfg.model, requestId, usage: response.data.usage || null };
  } catch (error) {
    const status = error.response?.status;
    console.error(JSON.stringify({ provider: 'grok', model: cfg.model, request_id: requestId, latency_ms: Date.now() - started, status: 'failure', http_status: status || null, error: classify(error) }));
    if (status === 401 || status === 403) throw new Error('WISE² Grok authentication failed.');
    if (status === 429) throw new Error('WISE² Grok is rate-limited. Please try again shortly.');
    if (error.code === 'ECONNABORTED' || error.name === 'CanceledError') throw new Error('WISE² Grok timed out.');
    if (error.message === 'xAI returned no usable text.') throw error;
    throw new Error('WISE² Grok is temporarily unavailable.');
  }
}

function extractText(data) {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  const parts = (data?.output || []).flatMap((item) => item.content || []);
  return parts.map((part) => part.text || '').join('').trim();
}
function classify(error) { return error.response?.status ? `http_${error.response.status}` : error.code || 'request_error'; }

function grokHealth() {
  const cfg = config();
  return { configured: Boolean(cfg.apiKey), enabled: cfg.enabled, model: cfg.model, baseUrl: cfg.baseUrl, timeoutMs: cfg.timeoutMs };
}

module.exports = { askGrok, grokHealth, config, extractText, normalizeMessages };
