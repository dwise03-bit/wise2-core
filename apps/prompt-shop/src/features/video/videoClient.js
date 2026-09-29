async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) throw new Error(payload.error?.message || `Video API request failed (${response.status}).`);
  return payload;
}

export async function listVideoProviders(fetchImpl = fetch, duration = 5) {
  return await readJson(await fetchImpl(`/api/video/providers?duration=${encodeURIComponent(duration)}`));
}

export async function createVideoJob(request, fetchImpl = fetch) {
  return (await readJson(await fetchImpl("/api/video/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }))).job;
}

export async function getVideoJob(id, fetchImpl = fetch) {
  return (await readJson(await fetchImpl(`/api/video/jobs/${encodeURIComponent(id)}`))).job;
}
