import { fieldsForProfile, getField, getProfile, getService, isRequired } from './catalog.ts';
import type { ClientStatus, FieldStatusRow, NextPrompt, ProfileId, StoreResult } from './types.ts';
import { maskSecret, validateFieldValue } from './validate.ts';
import { loadVault, removeValue, skipValue, writeValue } from './vault.ts';

export function getStatus(client: string, profile: ProfileId): ClientStatus {
  getProfile(profile);
  const vault = loadVault(client);
  const fields = fieldsForProfile(profile);
  const rows: FieldStatusRow[] = fields.map((field) => {
    const required = isRequired(field, profile);
    const configured = Boolean(vault.values[field.envVariable]);
    const skipped = vault.skipped.includes(field.envVariable);
    return {
      envVariable: field.envVariable,
      name: field.name,
      serviceId: field.serviceId,
      serviceName: getService(field.serviceId)?.name ?? field.serviceId,
      required,
      status: configured ? 'configured' : skipped ? 'skipped' : 'missing',
      masked: configured ? maskSecret(vault.values[field.envVariable]) : undefined,
    };
  });

  const requiredRows = rows.filter((row) => row.required);
  const optionalRows = rows.filter((row) => !row.required);

  return {
    client: vault.client,
    profile,
    vaultPath: vault.envPath,
    requiredTotal: requiredRows.length,
    requiredConfigured: requiredRows.filter((row) => row.status === 'configured').length,
    optionalTotal: optionalRows.length,
    optionalConfigured: optionalRows.filter((row) => row.status === 'configured').length,
    skipped: rows.filter((row) => row.status === 'skipped').length,
    complete: requiredRows.every((row) => row.status === 'configured' || row.status === 'skipped'),
    fields: rows,
  };
}

export function getNextPrompt(client: string, profile: ProfileId): NextPrompt {
  const status = getStatus(client, profile);
  const next =
    status.fields.find((row) => row.required && row.status === 'missing') ??
    status.fields.find((row) => !row.required && row.status === 'missing');

  const remainingRequired = status.fields.filter(
    (row) => row.required && row.status === 'missing',
  ).length;
  const remainingOptional = status.fields.filter(
    (row) => !row.required && row.status === 'missing',
  ).length;

  if (!next) {
    return {
      done: true,
      client: status.client,
      profile,
      remainingRequired,
      remainingOptional,
    };
  }

  const field = getField(next.envVariable);
  if (!field) {
    return { done: true, client: status.client, profile, remainingRequired, remainingOptional };
  }

  return {
    done: false,
    client: status.client,
    profile,
    remainingRequired,
    remainingOptional,
    field,
    serviceName: next.serviceName,
    required: next.required,
  };
}

export function storeKey(
  client: string,
  envVariable: string,
  value: string,
  options: { force?: boolean } = {},
): StoreResult {
  const field = getField(envVariable);
  if (!field) {
    return { ok: false, envVariable, error: `Unknown key: ${envVariable}` };
  }
  if (!options.force) {
    const error = validateFieldValue(field, value);
    if (error) return { ok: false, envVariable, error };
  }
  writeValue(client, envVariable, value);
  return { ok: true, envVariable, masked: maskSecret(value) };
}

export function skipKey(client: string, envVariable: string): StoreResult {
  const field = getField(envVariable);
  if (!field) {
    return { ok: false, envVariable, error: `Unknown key: ${envVariable}` };
  }
  skipValue(client, envVariable);
  return { ok: true, envVariable };
}

export function deleteKey(client: string, envVariable: string): StoreResult {
  const field = getField(envVariable);
  if (!field) {
    return { ok: false, envVariable, error: `Unknown key: ${envVariable}` };
  }
  removeValue(client, envVariable);
  return { ok: true, envVariable };
}
