/**
 * Pure helpers for the unified workspace. No React, no DOM, no network, so the
 * rules that decide what gets sent to the image engine can be tested with
 * `node --test`.
 */
import { buildHybridPrompt } from "../hybrid/hybrid.js";
import { blendStatus } from "./projectState.js";

/**
 * Prompt text for the current selection.
 * - Two or more active blend sources (valid total) use the hybrid prompt.
 * - Otherwise the selected system (and subsystem) describe the look.
 * - Returns "" when nothing is selected, so callers can skip the update.
 */
export function promptForSelection(project, systemById, subsystemById) {
  const system = systemById.get(project.systemId);
  const active = project.blendSlots.filter((slot) => slot.weight > 0);
  if (active.length >= 2 && blendStatus(project.blendSlots).valid) {
    const slots = active
      .map((slot) => ({
        sourceType: slot.sourceType,
        weight: slot.weight,
        source: slot.sourceType === "subsystem" ? subsystemById.get(slot.sourceId) : systemById.get(slot.sourceId),
      }))
      .filter((slot) => slot.source);
    if (slots.length >= 2) return buildHybridPrompt(slots);
  }
  if (!system) return "";
  const sub = project.subsystem ? subsystemById.get(project.subsystem.id) : null;
  const core = sub?.description || system.coreDNA || system.vibe || system.description || "";
  return [
    `WISE TOUCH ${system.name}${sub ? ` — ${sub.name}` : ""}`,
    core,
    "Preserve the subject's identity, pose, and key details. Apply the selected art direction.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Options for the blend source picker: every system, then every subsystem scoped to its parent. */
export function blendSourceOptions(systems, subsystemById, systemById) {
  return [
    ...systems.map((system) => ({ id: system.id, type: "system", parentId: null, label: system.name })),
    ...[...subsystemById.values()].map((sub) => ({
      id: sub.id,
      type: "subsystem",
      parentId: sub.parentSystemId,
      label: `${systemById.get(sub.parentSystemId)?.name || "System"} — ${sub.name}`,
    })),
  ];
}

/** Exact request body sent to the image endpoints. Only plain settings, never entitlement or owner data. */
export function generationInput(project) {
  return {
    prompt: project.prompt.draft.trim(),
    negativePrompt: project.settings.negativePrompt,
    aspectRatio: project.settings.aspectRatio,
    steps: project.settings.steps,
    strength: project.settings.strength,
  };
}
