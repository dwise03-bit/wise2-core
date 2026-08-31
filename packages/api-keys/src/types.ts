export const PROFILE_IDS = [
  'core',
  'phone',
  'field-service',
  'hvac',
  'studio',
  'full',
] as const;

export type ProfileId = (typeof PROFILE_IDS)[number];

export interface ApiField {
  envVariable: string;
  name: string;
  serviceId: string;
  requiredIn: ProfileId[];
  optionalIn: ProfileId[];
  prefix?: string | string[];
  minLength?: number;
  docsUrl: string;
  clientSteps: string[];
}

export interface ApiService {
  id: string;
  name: string;
  category: string;
  summary: string;
}

export interface Profile {
  id: ProfileId;
  name: string;
  summary: string;
}

export type FieldStatus = 'missing' | 'configured' | 'skipped';

export interface FieldStatusRow {
  envVariable: string;
  name: string;
  serviceId: string;
  serviceName: string;
  required: boolean;
  status: FieldStatus;
  masked?: string;
}

export interface ClientStatus {
  client: string;
  profile: ProfileId;
  vaultPath: string;
  requiredTotal: number;
  requiredConfigured: number;
  optionalTotal: number;
  optionalConfigured: number;
  skipped: number;
  complete: boolean;
  fields: FieldStatusRow[];
}

export interface NextPrompt {
  done: boolean;
  client: string;
  profile: ProfileId;
  remainingRequired: number;
  remainingOptional: number;
  field?: ApiField;
  serviceName?: string;
  required?: boolean;
}

export interface StoreResult {
  ok: boolean;
  envVariable: string;
  masked?: string;
  error?: string;
}
