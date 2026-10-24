#!/usr/bin/env node
import { readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync(new URL("./tenants.json", import.meta.url), "utf8"));
const errors = [];
const claimedDomains = new Set(registry.platform.controlDomains);
const reservedPaths = new Set(registry.platform.reservedPaths);

for (const tenant of registry.tenants) {
  if (!/^[a-z0-9-]+$/.test(tenant.id)) errors.push(`${tenant.name}: tenant id must be lowercase kebab-case`);
  if (claimedDomains.has(tenant.dashboardDomain)) errors.push(`${tenant.name}: dashboard domain collides with the platform`);
  for (const domain of [...tenant.domains, tenant.dashboardDomain]) {
    if (claimedDomains.has(domain)) errors.push(`${tenant.name}: ${domain} is claimed more than once`);
    claimedDomains.add(domain);
    if (domain.endsWith(".wise2.net") || domain === "wise2.net") errors.push(`${tenant.name}: client traffic cannot use a WISE² domain`);
  }
  if (!tenant.deployment?.network?.startsWith("tenant-")) errors.push(`${tenant.name}: deployment must use a tenant-scoped network`);
  if (!tenant.deployment?.storagePrefix?.startsWith(`tenants/${tenant.id}`)) errors.push(`${tenant.name}: storage must be tenant-scoped`);
}

if (!reservedPaths.has("/email")) errors.push("Platform email route must remain reserved");
if (errors.length) {
  console.error("Tenant registry validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`Tenant registry valid: ${registry.tenants.length} client tenant(s), ${registry.platform.controlDomains.length} WISE² control domains.`);
