export const PREFERENCES_KEY = "wise-touch-preferences-v1";

export const DEFAULT_PREFERENCES = Object.freeze({
  density: "comfortable",
  motion: "system",
  promptAutosave: true,
  foremanTips: true,
});

export function normalizePreferences(value = {}) {
  return {
    density: ["comfortable", "compact"].includes(value.density) ? value.density : DEFAULT_PREFERENCES.density,
    motion: ["system", "reduced"].includes(value.motion) ? value.motion : DEFAULT_PREFERENCES.motion,
    promptAutosave: typeof value.promptAutosave === "boolean" ? value.promptAutosave : DEFAULT_PREFERENCES.promptAutosave,
    foremanTips: typeof value.foremanTips === "boolean" ? value.foremanTips : DEFAULT_PREFERENCES.foremanTips,
  };
}

export function applyPreferences(preferences, root) {
  const next = normalizePreferences(preferences);
  if (root) {
    root.dataset.wtDensity = next.density;
    root.dataset.wtMotion = next.motion;
  }
  return next;
}
