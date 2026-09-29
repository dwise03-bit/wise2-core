export class ClaudeServiceError extends Error {
  constructor(message, status = 500, code = "CLAUDE_ERROR") {
    super(message);
    this.name = "ClaudeServiceError";
    this.status = status;
    this.code = code;
  }
}

export function validateEnhanceRequest(body) {
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) throw new ClaudeServiceError("Prompt is required.", 400, "INVALID_PROMPT");
  if (prompt.length > 30000) throw new ClaudeServiceError("Prompt exceeds the 30,000 character limit.", 413, "PROMPT_TOO_LARGE");
  return { prompt };
}

export async function enhanceWithClaude({ prompt }, options = {}) {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = options.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
  const fetchImpl = options.fetchImpl || fetch;
  if (!apiKey) throw new ClaudeServiceError("Claude enhancement is not configured.", 503, "CLAUDE_NOT_CONFIGURED");

  let response;
  try {
    response = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature: 0.4,
        system: "You are the WISE TOUCH prompt enhancement layer. Preserve the supplied System and Subsystem DNA, subject identity, constraints, output type, and aspect ratio. Increase specificity, coherence, camera and lighting direction, material detail, and production usefulness. Return only the enhanced final prompt without commentary or markdown fences.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch {
    throw new ClaudeServiceError("Claude could not be reached.", 502, "CLAUDE_UNAVAILABLE");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ClaudeServiceError(
      response.status === 429 ? "Claude rate limit reached. Try again shortly." : "Claude enhancement failed.",
      response.status === 429 ? 429 : 502,
      "CLAUDE_UPSTREAM_ERROR",
    );
  }

  const data = await response.json();
  const enhancedPrompt = data.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n").trim();
  if (!enhancedPrompt) throw new ClaudeServiceError("Claude returned an empty response.", 502, "CLAUDE_EMPTY_RESPONSE");
  return { enhancedPrompt, model: data.model || model, usage: data.usage || null };
}
