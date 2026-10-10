export const FAVORITES_STORAGE_KEY = "wt-favorites";
export const FAVORITES_VERSION = 2;

export function emptyFavorites() {
  return { version: FAVORITES_VERSION, items: [] };
}

export function parseFavorites(raw, systems = []) {
  if (!raw) return emptyFavorites();

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version === FAVORITES_VERSION && Array.isArray(parsed.items)) {
      return {
        version: FAVORITES_VERSION,
        items: parsed.items.filter((item) => item?.type && item?.id && item?.name),
      };
    }

    // Migrate the recovered string-array format in place.
    if (Array.isArray(parsed)) {
      return {
        version: FAVORITES_VERSION,
        items: parsed.flatMap((name) => {
          const system = systems.find((record) => record.name === name);
          return system ? [{ type: "system", id: system.id, name: system.name }] : [];
        }),
      };
    }
  } catch {}

  return emptyFavorites();
}

export function loadFavorites(storage, systems = []) {
  if (!storage) return emptyFavorites();
  return parseFavorites(storage.getItem(FAVORITES_STORAGE_KEY), systems);
}

export function persistFavorites(storage, favorites) {
  if (!storage) return;
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function hasFavorite(favorites, type, id) {
  return favorites.items.some((item) => item.type === type && item.id === id);
}

export function toggleFavorite(favorites, item) {
  const exists = hasFavorite(favorites, item.type, item.id);
  return {
    version: FAVORITES_VERSION,
    items: exists
      ? favorites.items.filter((favorite) => !(favorite.type === item.type && favorite.id === item.id))
      : [...favorites.items, item],
  };
}

export function promptFavorite(text, sourceId, name) {
  return { type: "prompt", id: `prompt:${sourceId}`, name, payload: { text, sourceId } };
}

export function hybridFavorite(hybrid, prompt) {
  return {
    type: "hybrid",
    id: hybrid.id,
    name: hybrid.name,
    payload: {
      prompt,
      description: hybrid.description,
      hybridDNA: hybrid.hybridDNA,
      compatibility: hybrid.compatibility,
      sources: hybrid.parents,
    },
  };
}
