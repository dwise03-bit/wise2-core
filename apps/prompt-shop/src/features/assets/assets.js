export const ASSETS_STORAGE_KEY = "wt-assets";
export const ASSETS_VERSION = 1;

export function emptyAssetLibrary() {
  return { version: ASSETS_VERSION, items: [] };
}

export function assetFromVideoJob(job, context = {}) {
  if (!job?.id || job.status !== "completed" || !job.assetUrl) throw new Error("A completed video job with an asset URL is required.");
  return {
    id: `video:${job.id}`,
    type: "video",
    name: context.name || `${context.systemName || "WISE TOUCH"} Video`,
    assetUrl: job.assetUrl,
    providerId: job.providerId,
    providerJobId: job.providerJobId || null,
    prompt: job.prompt || context.prompt || "",
    systemId: context.systemId || null,
    systemName: context.systemName || null,
    subsystemId: context.subsystemId || null,
    subsystemName: context.subsystemName || null,
    aspectRatio: job.options?.aspectRatio || context.aspectRatio || null,
    duration: job.options?.duration || context.duration || null,
    createdAt: job.createdAt || new Date().toISOString(),
    completedAt: job.updatedAt || new Date().toISOString(),
  };
}

export function loadAssets(storage) {
  if (!storage) return emptyAssetLibrary();
  const raw = storage.getItem(ASSETS_STORAGE_KEY);
  if (!raw) return emptyAssetLibrary();
  try {
    const value = JSON.parse(raw);
    if (value?.version !== ASSETS_VERSION || !Array.isArray(value.items)) return emptyAssetLibrary();
    return { version: ASSETS_VERSION, items: value.items.filter((item) => item?.id && item?.assetUrl && item?.type) };
  } catch { return emptyAssetLibrary(); }
}

export function persistAssets(storage, library) {
  if (storage) storage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(library));
  return library;
}

export function upsertAsset(library, asset) {
  const items = library.items.filter((item) => item.id !== asset.id);
  return { version: ASSETS_VERSION, items: [asset, ...items] };
}

export function removeAsset(library, id) {
  return { version: ASSETS_VERSION, items: library.items.filter((item) => item.id !== id) };
}

export function filterAssets(library, { query = "", type = "all", providerId = "all" } = {}) {
  const needle = query.trim().toLowerCase();
  return library.items.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (providerId !== "all" && item.providerId !== providerId) return false;
    if (!needle) return true;
    return [item.name, item.prompt, item.systemName, item.subsystemName, item.providerId].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });
}
