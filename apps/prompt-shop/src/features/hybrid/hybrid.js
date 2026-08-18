function cleanName(name) {
  return name.replace("WISE TOUCH ", "").replace(/[™®©]/g, "");
}

export function slotSource(slot) {
  return slot.source || slot.system || null;
}

export function activeHybridSlots(slots) {
  return slots.filter((slot) => slotSource(slot) && slot.weight > 0);
}

export function validateHybrid(slots) {
  const active = activeHybridSlots(slots);
  const totalWeight = active.reduce((sum, slot) => sum + slot.weight, 0);
  const errors = [];
  if (active.length < 2) errors.push("Choose at least two weighted sources.");
  if (totalWeight !== 100) errors.push("Hybrid influence must total exactly 100%.");
  return { valid: errors.length === 0, errors, active, totalWeight };
}

function compatibilityFor(active) {
  const categories = new Set(active.map((slot) => slotSource(slot).category));
  const dnaSets = active.map((slot) => new Set(slotSource(slot).visualDNA || []));
  const sharedDNA = dnaSets.length < 2 ? [] : [...dnaSets[0]].filter((item) => dnaSets.slice(1).some((set) => set.has(item)));
  if (categories.size === 1) return { level: "High", reason: "All sources share a category foundation.", sharedDNA };
  if (sharedDNA.length > 0) return { level: "Balanced", reason: "Sources cross categories but share Visual DNA.", sharedDNA };
  return { level: "Experimental", reason: "Sources introduce a high-contrast cross-category blend.", sharedDNA };
}

export function buildHybrid(slots) {
  const validation = validateHybrid(slots);
  const parents = validation.active.map((slot) => {
    const source = slotSource(slot);
    return {
      type: slot.sourceType || (source.id.startsWith("subsystem:") ? "subsystem" : "system"),
      id: source.id,
      name: source.name,
      weight: slot.weight,
      category: source.category,
      description: source.coreDNA || source.description,
      visualDNA: source.visualDNA || [],
    };
  });
  const name = parents.map((parent) => cleanName(parent.name)).join(" × ");
  const hybridDNA = [...new Set(parents.flatMap((parent) => parent.visualDNA))];
  const compatibility = compatibilityFor(validation.active);
  const description = parents.map((parent) => `${parent.weight}% ${cleanName(parent.name)}`).join(" + ");
  const promptFoundation = parents.map((parent) => `${parent.name} (${parent.weight}%): ${parent.description}`).join("\n");
  const signature = parents.map((parent) => `${parent.id}@${parent.weight}`).join("+");

  return {
    id: `hybrid:${signature}`,
    name,
    parents,
    description: `A weighted WISE TOUCH hybrid combining ${description}.`,
    hybridDNA,
    promptFoundation,
    compatibility,
    totalWeight: validation.totalWeight,
    valid: validation.valid,
    errors: validation.errors,
  };
}

export function buildHybridPrompt(slots) {
  const hybrid = buildHybrid(slots);
  return [
    "HYBRID WISE TOUCH SYSTEM™",
    "",
    `HYBRID NAME: ${hybrid.name}`,
    `TOTAL INFLUENCE: ${hybrid.totalWeight}%`,
    `COMPATIBILITY: ${hybrid.compatibility.level} — ${hybrid.compatibility.reason}`,
    "",
    "PARENT SOURCES:",
    hybrid.parents.map((parent, index) => `${index + 1}. [${parent.type.toUpperCase()}] ${parent.name} (${parent.weight}% influence)\nVISUAL DNA: ${parent.description}`).join("\n\n"),
    "",
    "HYBRID DNA:",
    hybrid.hybridDNA.join("; "),
    "",
    "STYLE INSTRUCTIONS:",
    "Blend all selected WISE TOUCH sources into one cinematic direction. The highest percentage source dominates atmosphere, lighting, composition, texture, and emotional tone. Lower-percentage sources act as supporting DNA layers.",
    "",
    "TEXTURE RULES:",
    "35mm film grain, halftone print texture, analog wear, dust, scratches, film burn edges, subtle chromatic aberration, distressed realism, cinematic contrast.",
    "",
    "OUTPUT GOAL:",
    "Create a fully realized WISE TOUCH hybrid visual using every selected source at its specified influence.",
  ].join("\n");
}
