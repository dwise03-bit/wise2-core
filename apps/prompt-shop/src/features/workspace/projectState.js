/**
 * Unified creative workspace: pure project state.
 *
 * Holds everything the single-screen create flow needs (source reference,
 * system/subsystem selection, weighted blend, DNA controls, prompt draft,
 * generation settings, result history) without touching React or the DOM.
 * Every transition is a pure function so the rules can be tested with
 * `node --test` and reused by any UI.
 *
 * Rules enforced here (see UI_SPEC.md, "State contract"):
 * - Blends must total exactly 100 before generation. Rebalancing is an
 *   explicit action (rebalanceBlend), never automatic.
 * - A manual prompt edit is never overwritten by generated text unless the
 *   caller passes { force: true }.
 * - Subsystems are scoped to their parent system. Changing the parent clears
 *   a subsystem that no longer belongs to it.
 * - A new generation is added to history; earlier results stay selectable.
 * - Stored project data never holds File/Blob objects or secrets.
 */

export const PROJECT_VERSION = 1;
export const HISTORY_LIMIT = 24;
export const ASPECT_RATIOS = Object.freeze(["1:1", "16:9", "9:16"]);
export const STEPS_RANGE = Object.freeze({ min: 8, max: 30 });
export const STRENGTH_RANGE = Object.freeze({ min: 0.15, max: 0.9 });
export const BLEND_TOTAL = 100;

export const DEFAULT_DNA = Object.freeze({
  lineStyle: "Bold Ink / Cel",
  palette: "Neon Orange + Teal",
  lighting: "High Contrast",
  texture: "Gritty / Detailed",
  composition: "Dynamic Angle",
  mood: "Dark / Epic",
  detail: "Deep Layers",
  blendStrength: 70,
});

const DEFAULT_NEGATIVE = "blurry, low quality, malformed anatomy, watermark";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const requireString = (value, name) => {
  if (typeof value !== "string") throw new TypeError(`${name} must be a string.`);
  return value;
};
const requireWeight = (weight) => {
  if (!Number.isInteger(weight) || weight < 0 || weight > BLEND_TOTAL) {
    throw new RangeError("Blend weights must be whole numbers from 0 to 100.");
  }
  return weight;
};

/** Create a fresh project. `seed` may carry an initial system/subsystem/blend. */
export function createProject(seed = {}) {
  const base = {
    version: PROJECT_VERSION,
    id: seed.id || `project-${Date.now().toString(36)}`,
    name: seed.name || "Untitled build",
    source: null,
    systemId: seed.systemId || null,
    subsystem: null,
    blendSlots: Array.isArray(seed.blendSlots) ? seed.blendSlots.map(normalizeSlot) : [],
    dna: { ...DEFAULT_DNA },
    prompt: { draft: "", manualOverride: false },
    settings: { aspectRatio: "1:1", negativePrompt: DEFAULT_NEGATIVE, steps: 18, strength: 0.62 },
    generation: { status: "idle", message: "" },
    history: [],
    selectedResultId: null,
    saveState: "saved",
  };
  return base;
}

function normalizeSlot(slot) {
  return {
    sourceId: requireString(slot.sourceId, "sourceId"),
    sourceType: slot.sourceType === "subsystem" ? "subsystem" : "system",
    parentId: slot.parentId ?? null,
    weight: requireWeight(slot.weight),
  };
}

/** Mark the project dirty. Every user edit goes through this. */
const dirty = (project, patch) => ({ ...project, ...patch, saveState: "unsaved" });

/* ------------------------------------------------------------------ source */

export function setSource(project, source) {
  if (source === null) return dirty(project, { source: null });
  if (!isObject(source)) throw new TypeError("Source must be an object or null.");
  return dirty(project, {
    source: {
      name: requireString(source.name, "source.name"),
      type: requireString(source.type, "source.type"),
      size: Number.isFinite(source.size) ? source.size : 0,
    },
  });
}

/* ------------------------------------------------- system / subsystem scope */

export function selectSystem(project, systemId) {
  requireString(systemId, "systemId");
  const keepSubsystem = project.subsystem && project.subsystem.parentId === systemId;
  return dirty(project, { systemId, subsystem: keepSubsystem ? project.subsystem : null });
}

export function selectSubsystem(project, { id, parentId }) {
  requireString(id, "subsystem id");
  requireString(parentId, "subsystem parentId");
  if (project.systemId !== parentId) {
    throw new Error("Select the parent system before choosing one of its subsystems.");
  }
  return dirty(project, { subsystem: { id, parentId } });
}

/* ------------------------------------------------------------------ blend */

/**
 * Report blend status without changing anything.
 * An empty blend is valid (single-source generation). Otherwise active weights
 * must total exactly 100; `remaining` tells the UI what is still unassigned.
 */
export function blendStatus(slots) {
  const active = slots.filter((slot) => slot.weight > 0);
  const total = active.reduce((sum, slot) => sum + slot.weight, 0);
  if (active.length === 0) return { valid: true, total: 0, remaining: BLEND_TOTAL, reason: "" };
  if (total === BLEND_TOTAL) return { valid: true, total, remaining: 0, reason: "" };
  const remaining = BLEND_TOTAL - total;
  const reason = remaining > 0
    ? `${remaining}% still unassigned. Blend must total exactly 100%.`
    : `${-remaining}% over. Blend must total exactly 100%.`;
  return { valid: false, total, remaining, reason };
}

export function setBlendSlots(project, slots) {
  if (!Array.isArray(slots)) throw new TypeError("Blend slots must be an array.");
  return dirty(project, { blendSlots: slots.map(normalizeSlot) });
}

export function setBlendWeight(project, index, weight) {
  const slots = project.blendSlots.map((slot, position) => (position === index ? { ...slot, weight: requireWeight(weight) } : slot));
  if (!slots[index]) throw new RangeError(`No blend slot at index ${index}.`);
  return dirty(project, { blendSlots: slots });
}

/**
 * Explicit, user-requested rebalance. Scales active weights so they total 100
 * using largest-remainder rounding, so the result is always whole numbers that
 * sum exactly. Zero-weight slots stay zero. Returns the project unchanged when
 * there is nothing to scale.
 */
export function rebalanceBlend(project) {
  const slots = project.blendSlots;
  const active = slots.map((slot, index) => ({ index, weight: slot.weight })).filter((item) => item.weight > 0);
  const total = active.reduce((sum, item) => sum + item.weight, 0);
  if (active.length === 0 || total === 0 || total === BLEND_TOTAL) return project;

  const exact = active.map((item) => ({ index: item.index, raw: (item.weight * BLEND_TOTAL) / total }));
  const floors = exact.map((item) => ({ index: item.index, value: Math.floor(item.raw), frac: item.raw - Math.floor(item.raw) }));
  let leftover = BLEND_TOTAL - floors.reduce((sum, item) => sum + item.value, 0);
  [...floors].sort((a, b) => b.frac - a.frac || a.index - b.index).forEach((item) => {
    if (leftover > 0) { item.value += 1; leftover -= 1; }
  });

  const next = slots.map((slot) => ({ ...slot }));
  floors.forEach((item) => { next[item.index].weight = item.value; });
  return dirty(project, { blendSlots: next });
}

/* ------------------------------------------------------------- DNA / prompt */

export function setDna(project, key, value) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_DNA, key)) throw new RangeError(`Unknown DNA control: ${key}`);
  return dirty(project, { dna: { ...project.dna, [key]: value } });
}

/** Typed edits by the person. These lock the draft against generated overwrites. */
export function editPrompt(project, text) {
  return dirty(project, { prompt: { draft: requireString(text, "prompt"), manualOverride: true } });
}

/**
 * Apply prompt text produced by the prompt engine. Respects manual edits:
 * if the person has edited the draft, the text is ignored unless forced.
 */
export function applyGeneratedPrompt(project, text, { force = false } = {}) {
  requireString(text, "generated prompt");
  if (project.prompt.manualOverride && !force) return project;
  return dirty(project, { prompt: { draft: text, manualOverride: force ? false : project.prompt.manualOverride } });
}

/** Explicit "use generated text again" action after a manual edit. */
export function resetPromptOverride(project, generatedText) {
  return applyGeneratedPrompt(project, generatedText, { force: true });
}

/* ---------------------------------------------------------------- settings */

export function updateSettings(project, patch) {
  const next = { ...project.settings };
  if ("aspectRatio" in patch) {
    if (!ASPECT_RATIOS.includes(patch.aspectRatio)) throw new RangeError("Unsupported aspect ratio.");
    next.aspectRatio = patch.aspectRatio;
  }
  if ("negativePrompt" in patch) next.negativePrompt = requireString(patch.negativePrompt, "negativePrompt").slice(0, 4000);
  if ("steps" in patch) next.steps = clamp(Math.round(Number(patch.steps)) || 18, STEPS_RANGE.min, STEPS_RANGE.max);
  if ("strength" in patch) next.strength = clamp(Number(patch.strength) || 0.62, STRENGTH_RANGE.min, STRENGTH_RANGE.max);
  return dirty(project, { settings: next });
}

/* -------------------------------------------------------------- generation */

/** Gate for the Generate button. Returns { allowed, reasons[] }. */
export function canGenerate(project) {
  const reasons = [];
  if (project.generation.status === "loading") reasons.push("A build is already running.");
  if (!project.prompt.draft.trim()) reasons.push("Write or generate a prompt first.");
  const blend = blendStatus(project.blendSlots);
  if (!blend.valid) reasons.push(blend.reason);
  return { allowed: reasons.length === 0, reasons };
}

export function startGeneration(project) {
  const gate = canGenerate(project);
  if (!gate.allowed) throw new Error(gate.reasons[0]);
  return { ...project, generation: { status: "loading", message: "Building on the local engine…" } };
}

/**
 * Record a finished build. Earlier results stay in history, the new one is
 * selected, and settings, blend, and DNA are left exactly as they were.
 */
export function completeGeneration(project, result) {
  if (!isObject(result) || typeof result.id !== "string" || typeof result.assetUrl !== "string") {
    throw new TypeError("A completed generation needs an id and an assetUrl from the server.");
  }
  const entry = {
    id: result.id,
    assetUrl: result.assetUrl,
    watermarked: Boolean(result.watermarked),
    width: Number(result.width) || null,
    height: Number(result.height) || null,
    prompt: project.prompt.draft,
    createdAt: result.createdAt || null,
  };
  const history = [entry, ...project.history.filter((item) => item.id !== entry.id)].slice(0, HISTORY_LIMIT);
  return dirty(project, {
    history,
    selectedResultId: entry.id,
    generation: { status: "success", message: entry.watermarked ? "Built free with the official W² watermark." : "Built with your paid clean-download entitlement." },
  });
}

export function failGeneration(project, message) {
  return { ...project, generation: { status: "error", message: String(message || "Generation failed.") } };
}

export function selectResult(project, id) {
  if (!project.history.some((item) => item.id === id)) throw new RangeError("That result is not in this project's history.");
  return dirty(project, { selectedResultId: id });
}

export function markSaved(project) {
  return { ...project, saveState: "saved" };
}

/* ------------------------------------------------------- save and restore */

/** Plain-data snapshot safe to store (no File objects, no transient loading state). */
export function serializeProject(project) {
  return JSON.parse(JSON.stringify({
    ...project,
    generation: { status: "idle", message: "" },
    saveState: "saved",
  }));
}

/**
 * Restore a stored snapshot. Unknown or malformed fields fall back to safe
 * defaults rather than throwing, so a damaged save cannot block the workspace.
 */
export function restoreProject(raw) {
  if (!isObject(raw) || raw.version !== PROJECT_VERSION) return createProject();
  const base = createProject({ id: raw.id, name: raw.name, systemId: raw.systemId });
  const slots = Array.isArray(raw.blendSlots) ? raw.blendSlots.flatMap((slot) => {
    try { return [normalizeSlot(slot)]; } catch { return []; }
  }) : [];
  const history = Array.isArray(raw.history) ? raw.history.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.assetUrl === "string").slice(0, HISTORY_LIMIT) : [];
  const subsystem = isObject(raw.subsystem) && typeof raw.subsystem.id === "string" && typeof raw.subsystem.parentId === "string" && raw.subsystem.parentId === base.systemId ? { id: raw.subsystem.id, parentId: raw.subsystem.parentId } : null;
  return {
    ...base,
    source: isObject(raw.source) && typeof raw.source.name === "string" ? { name: raw.source.name, type: String(raw.source.type || ""), size: Number(raw.source.size) || 0 } : null,
    subsystem,
    blendSlots: slots,
    dna: { ...DEFAULT_DNA, ...(isObject(raw.dna) ? pick(raw.dna, Object.keys(DEFAULT_DNA)) : {}) },
    prompt: {
      draft: typeof raw.prompt?.draft === "string" ? raw.prompt.draft : "",
      manualOverride: raw.prompt?.manualOverride === true,
    },
    settings: restoreSettings(raw.settings),
    history,
    selectedResultId: history.some((item) => item.id === raw.selectedResultId) ? raw.selectedResultId : history[0]?.id || null,
    saveState: "saved",
  };
}

function restoreSettings(settings) {
  let next = createProject().settings;
  if (!isObject(settings)) return next;
  // Validate one field at a time so a single bad value keeps the rest.
  for (const key of Object.keys(next)) {
    if (!(key in settings)) continue;
    try { next = updateSettings({ settings: next }, { [key]: settings[key] }).settings; } catch { /* keep default for this field */ }
  }
  return next;
}

function pick(object, keys) {
  return Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));
}
