const axios = require("axios");

const XAI_BASE_URL = (process.env.XAI_BASE_URL || "https://api.x.ai/v1").replace(/\/+$/, "");
const XAI_MODEL = process.env.XAI_MODEL || "grok-4-1-fast-reasoning";
const XAI_TIMEOUT_MS = Number(process.env.XAI_TIMEOUT_MS || 60000);

const WISE2_GROK_SYSTEM_PROMPT = process.env.WISE2_GROK_SYSTEM_PROMPT || `You are WISE² Grok, an AI operator inside the WISE² United Business OS.
Be concise, practical, and execution-focused. Help with WISE² operations, sales, customer support, development, HVAC workflows, research, and business analysis.
Never claim an external action was completed unless a connected tool actually completed it. Protect credentials and private customer data. When information is uncertain, say so.`;

function configured() {
  return Boolean(process.env.XAI_API_KEY);
}

async function askGrok(prompt, options = {}) {
  if (!configured()) {
    const error = new Error("XAI_API_KEY is not configured");
    error.code = "XAI_NOT_CONFIGURED";
    throw error;
  }

  const messages = [
    { role: "system", content: options.systemPrompt || WISE2_GROK_SYSTEM_PROMPT },
    ...(Array.isArray(options.history) ? options.history : []),
    { role: "user", content: prompt },
  ];

  const response = await axios.post(
    `${XAI_BASE_URL}/chat/completions`,
    {
      model: options.model || XAI_MODEL,
      messages,
      temperature: options.temperature ?? 0.4,
    },
    {
      timeout: XAI_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("xAI returned no message content");

  return {
    content,
    model: response.data?.model || options.model || XAI_MODEL,
    usage: response.data?.usage || null,
    id: response.data?.id || null,
  };
}

module.exports = { askGrok, configured, XAI_MODEL };
