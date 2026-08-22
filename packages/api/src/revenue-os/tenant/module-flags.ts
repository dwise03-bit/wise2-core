/**
 * Contractor OS module flags (CLAUDE.md spec §52/§35).
 *
 * `Tenant.enabledModules` overrides the platform default set for its
 * vertical. An empty array means "use the default set below" rather than
 * "no modules enabled" — a freshly provisioned tenant should not appear
 * broken before anyone has touched its settings.
 */

export const CORE_MODULES = [
  'crm',
  'jobs',
  'estimates',
  'invoices',
  'calendar',
] as const;

/** Modules that make sense for some verticals but not others by default. */
const OPTIONAL_MODULES_BY_VERTICAL: Record<string, readonly string[]> = {
  roofing: ['storm', 'suppliers'],
  hvac: ['suppliers'],
};

export function defaultModulesForVertical(vertical: string): string[] {
  const optional = OPTIONAL_MODULES_BY_VERTICAL[vertical] ?? [];
  return [...CORE_MODULES, ...optional];
}

export function resolveEnabledModules(
  vertical: string,
  enabledModules: string[],
): string[] {
  return enabledModules.length > 0
    ? enabledModules
    : defaultModulesForVertical(vertical);
}

export function hasModule(
  vertical: string,
  enabledModules: string[],
  module: string,
): boolean {
  return resolveEnabledModules(vertical, enabledModules).includes(module);
}
