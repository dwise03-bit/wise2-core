import {
  DEFAULT_SYSTEMS as LEGACY_SYSTEMS,
  VISUAL_DNA_TAGS,
} from "./legacyCatalog.js";

export const CATALOG_SCHEMA_VERSION = 1;

const SUBSYSTEM_DESCRIPTION_OVERRIDES = {
  "MICHELANGELO FORM™": "Renaissance anatomy mastery with sculptural human forms, divine proportions, marble realism, and dramatic ceiling-painting energy.",
  "BASQUIAT CHAOS™": "Raw neo-expressionist graffiti emotion with frantic linework, symbolic crowns, rough paint textures, and rebellious gallery energy.",
  "PICASSO FRACTURE™": "Cubist distortion using fragmented perspectives, abstract facial structure, geometric breakdowns, and layered visual tension.",
  "DALI DREAMSCAPE™": "Melting surrealist dream imagery with impossible landscapes, subconscious symbolism, floating objects, and distorted reality.",
};

export function slugify(value) {
  return value
    .replace(/[™®©]/g, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function visualDNAFor(tags) {
  return tags.map((tag) => VISUAL_DNA_TAGS[tag] || tag);
}

function subsystemDescription(name, parent) {
  return SUBSYSTEM_DESCRIPTION_OVERRIDES[name] || `${name.replace("™", "")} — ${parent.vibe}`;
}

export const SUBSYSTEMS = Object.freeze(
  LEGACY_SYSTEMS.flatMap((parent) => {
    const parentSlug = slugify(parent.name);

    return parent.subsystems.map((name) => {
      const slug = slugify(name);
      return Object.freeze({
        id: `subsystem:${parentSlug}:${slug}`,
        name,
        slug,
        parentSystemId: `system:${parentSlug}`,
        category: parent.category,
        description: subsystemDescription(name, parent),
        visualDNA: visualDNAFor(parent.tags),
        useCases: [],
        relatedSystemIds: [],
        relatedSubsystemIds: [],
        hybridReady: true,
        promptReady: true,
        documentationStatus: "baseline",
        createdAt: null,
        updatedAt: null,
      });
    });
  }),
);

const subsystemIdsByParent = SUBSYSTEMS.reduce((index, subsystem) => {
  if (!index[subsystem.parentSystemId]) index[subsystem.parentSystemId] = [];
  index[subsystem.parentSystemId].push(subsystem.id);
  return index;
}, {});

export const SYSTEMS = Object.freeze(
  LEGACY_SYSTEMS.map((system) => {
    const slug = slugify(system.name);
    const id = `system:${slug}`;

    return Object.freeze({
      ...system,
      id,
      slug,
      description: system.vibe,
      coreDNA: system.vibe,
      visualDNA: visualDNAFor(system.tags),
      useCases: [],
      subsystemIds: Object.freeze(subsystemIdsByParent[id] || []),
      relatedSystemIds: [],
      flagship: false,
      hybridReady: true,
      promptReady: true,
      documentationStatus: "baseline",
      createdAt: null,
      updatedAt: null,
    });
  }),
);

// Compatibility alias for the recovered UI. Every legacy field remains present.
export const DEFAULT_SYSTEMS = SYSTEMS;

export const SYSTEM_BY_ID = new Map(SYSTEMS.map((system) => [system.id, system]));
export const SYSTEM_BY_SLUG = new Map(SYSTEMS.map((system) => [system.slug, system]));
export const SUBSYSTEM_BY_ID = new Map(SUBSYSTEMS.map((subsystem) => [subsystem.id, subsystem]));

export function getSubsystemsForSystem(systemId) {
  return (subsystemIdsByParent[systemId] || []).map((id) => SUBSYSTEM_BY_ID.get(id));
}

export function getSubsystemForSystem(systemId, name) {
  return getSubsystemsForSystem(systemId).find((subsystem) => subsystem.name === name);
}

export function validateCatalog(systems = SYSTEMS, subsystems = SUBSYSTEMS) {
  const errors = [];
  const systemIds = new Set();
  const subsystemIds = new Set();

  for (const system of systems) {
    if (!system.id || !system.name || !system.slug || !system.category || !system.description) {
      errors.push(`System is missing required fields: ${system.name || "unknown"}`);
    }
    if (systemIds.has(system.id)) errors.push(`Duplicate System id: ${system.id}`);
    systemIds.add(system.id);
  }

  for (const subsystem of subsystems) {
    if (!subsystem.id || !subsystem.name || !subsystem.slug || !subsystem.description) {
      errors.push(`Subsystem is missing required fields: ${subsystem.name || "unknown"}`);
    }
    if (!systemIds.has(subsystem.parentSystemId)) {
      errors.push(`Subsystem has missing parent: ${subsystem.id}`);
    }
    if (subsystemIds.has(subsystem.id)) errors.push(`Duplicate Subsystem id: ${subsystem.id}`);
    subsystemIds.add(subsystem.id);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      systems: systems.length,
      subsystems: subsystems.length,
      categories: new Set(systems.map((system) => system.category)).size,
    },
  };
}
