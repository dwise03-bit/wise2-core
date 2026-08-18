async function readJson(response) { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error?.message || `Request failed (${response.status}).`); return payload; }
export const listImageProviders = async (fetchImpl = fetch) => (await readJson(await fetchImpl("/api/image/providers"))).providers;
export const getImageEntitlement = async (fetchImpl = fetch) => await readJson(await fetchImpl("/api/image/entitlement"));
export const startProCheckout = async (fetchImpl = fetch) => (await readJson(await fetchImpl("/api/billing/checkout", { method:"POST" }))).url;
export const openBillingPortal = async (fetchImpl = fetch) => (await readJson(await fetchImpl("/api/billing/portal", { method:"POST" }))).url;
export const generateImage = async (input, fetchImpl = fetch) => (await readJson(await fetchImpl("/api/image/generations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }))).generation;
export const transformImage = async (file, input, fetchImpl = fetch) => { const params = new URLSearchParams(input); return (await readJson(await fetchImpl(`/api/image/generations/from-image?${params}`, { method:"POST", headers:{ "Content-Type":file.type }, body:file }))).generation; };
