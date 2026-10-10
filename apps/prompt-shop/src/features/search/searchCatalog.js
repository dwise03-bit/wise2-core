function searchableText(values) {
  return values
    .flat(Infinity)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesQuery(record, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return searchableText([
    record.name,
    record.category,
    record.description,
    record.coreDNA,
    record.visualDNA,
    record.useCases,
    record.tags,
    record.subsystems,
  ]).includes(normalizedQuery);
}

function matchesCommonFilters(record, filters) {
  if (filters.category && filters.category !== "ALL" && record.category !== filters.category) return false;
  if (filters.fullyDocumented && record.documentationStatus !== "complete") return false;
  if (filters.hybridReady && !record.hybridReady) return false;
  if (filters.promptReady && !record.promptReady) return false;
  return true;
}

export function searchCatalog({ systems, subsystems, query = "", filters = {}, favoriteIds = [] }) {
  const favoriteSet = new Set(favoriteIds);
  const systemResults = systems
    .filter((system) => matchesQuery(system, query))
    .filter((system) => matchesCommonFilters(system, filters))
    .filter((system) => !filters.flagship || system.flagship)
    .filter((system) => !filters.favorites || favoriteSet.has(system.id))
    .map((system) => ({ type: "system", id: system.id, record: system }));

  const subsystemResults = subsystems
    .filter((subsystem) => matchesQuery(subsystem, query))
    .filter((subsystem) => matchesCommonFilters(subsystem, filters))
    .filter((subsystem) => !filters.flagship)
    .filter((subsystem) => !filters.favorites || favoriteSet.has(subsystem.id))
    .map((subsystem) => ({ type: "subsystem", id: subsystem.id, record: subsystem }));

  return [...systemResults, ...subsystemResults].sort((a, b) => a.record.name.localeCompare(b.record.name));
}

export function hasAdvancedSearch(filters) {
  return Boolean(
    filters.flagship ||
    filters.fullyDocumented ||
    filters.favorites ||
    filters.hybridReady ||
    filters.promptReady
  );
}
