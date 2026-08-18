export async function enhancePromptWithClaude(prompt, fetchImpl = fetch) {
  const response = await fetchImpl("/api/claude/enhance", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error(data?.error?.message || "Claude enhancement failed.");
  return data;
}
