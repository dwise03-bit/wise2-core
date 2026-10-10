import test from "node:test";
import assert from "node:assert/strict";

import { ClaudeServiceError, enhanceWithClaude, validateEnhanceRequest } from "../server/services/claude.js";

test("Claude request validation rejects empty and oversized prompts", () => {
  assert.throws(() => validateEnhanceRequest({ prompt: "" }), /required/);
  assert.throws(() => validateEnhanceRequest({ prompt: "x".repeat(30001) }), /30,000/);
});

test("Claude integration fails safely when the server secret is missing", async () => {
  await assert.rejects(() => enhanceWithClaude({ prompt: "test" }, { apiKey: "" }), (error) => error instanceof ClaudeServiceError && error.status === 503);
});

test("Claude integration sends the prompt server-side and returns text content", async () => {
  let captured;
  const fetchImpl = async (url, request) => {
    captured = { url, request, body: JSON.parse(request.body) };
    return { ok: true, json: async () => ({ model: "test-model", content: [{ type: "text", text: "enhanced prompt" }], usage: { input_tokens: 10 } }) };
  };
  const result = await enhanceWithClaude({ prompt: "source prompt" }, { apiKey: "server-secret", model: "test-model", fetchImpl });
  assert.equal(captured.url, "https://api.anthropic.com/v1/messages");
  assert.equal(captured.request.headers["x-api-key"], "server-secret");
  assert.equal(captured.body.messages[0].content, "source prompt");
  assert.equal(result.enhancedPrompt, "enhanced prompt");
});
