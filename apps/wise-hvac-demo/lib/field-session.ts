import type { Measurement, MeasurementSample } from './measurements.ts';
import type { GuidedTestRecord } from './guided-tests.ts';
import type { ImpDiagnosticResult } from './imp-structured.ts';

export type RepairKind =
  | 'part_replaced'
  | 'adjustment'
  | 'cleaning'
  | 'wiring'
  | 'refrigerant'
  | 'airflow'
  | 'other';

export type RepairVerification = 'REPAIR VERIFIED' | 'PARTIALLY VERIFIED' | 'NOT VERIFIED' | '';

export type SyncState = 'SAVED LOCALLY' | 'SYNCED';

export interface RepairEntryRecord {
  kind: RepairKind;
  summary: string;
  notes: string;
  savedAt: string | null;
}

export interface AttachmentRecord {
  id: string;
  kind: 'photo' | 'voice';
  name: string;
  associatedWith: 'work_order' | 'equipment' | 'diagnostic' | 'repair';
  dataUrl?: string;
  transcript?: string;
  createdAt: string;
  syncState: SyncState;
}

export interface ServiceNoteDraft {
  text: string;
  accepted: boolean;
  updatedAt: string | null;
}

export interface ReportDraft {
  text: string;
  reviewed: boolean;
  finalized: boolean;
  updatedAt: string | null;
}

export interface FieldSessionState {
  jobId: string;
  startedAt: string | null;
  equipmentDraft: Record<string, string>;
  measurements: Record<string, Measurement>;
  history: MeasurementSample[];
  testIn: Record<string, Measurement> | null;
  testOut: Record<string, Measurement> | null;
  repair: RepairEntryRecord | null;
  verification: RepairVerification;
  guidedTests: GuidedTestRecord[];
  attachments: AttachmentRecord[];
  notes: ServiceNoteDraft;
  report: ReportDraft;
  diagnosis: ImpDiagnosticResult | null;
  syncState: SyncState;
}

const KEY = 'wise2.fieldtech.session.v1';
const memoryStore = new Map<string, string>();

function readAll(): Record<string, FieldSessionState> {
  try {
    const raw =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(KEY)
        : memoryStore.get(KEY) ?? null;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, FieldSessionState>;
  } catch {
    return {};
  }
}

function writeAll(value: Record<string, FieldSessionState>) {
  const serialized = JSON.stringify(value);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(KEY, serialized);
  }
  memoryStore.set(KEY, serialized);
}

export function emptySession(jobId: string): FieldSessionState {
  return {
    jobId,
    startedAt: null,
    equipmentDraft: {},
    measurements: {},
    history: [],
    testIn: null,
    testOut: null,
    repair: null,
    verification: '',
    guidedTests: [],
    attachments: [],
    notes: { text: '', accepted: false, updatedAt: null },
    report: { text: '', reviewed: false, finalized: false, updatedAt: null },
    diagnosis: null,
    syncState: 'SAVED LOCALLY',
  };
}

export function loadSession(jobId: string): FieldSessionState {
  if (!jobId) return emptySession('');
  return readAll()[jobId] || emptySession(jobId);
}

export function saveSession(session: FieldSessionState): FieldSessionState {
  const all = readAll();
  const next = { ...session, syncState: 'SAVED LOCALLY' as const };
  all[session.jobId] = next;
  writeAll(all);
  return next;
}

export function resetFieldSessions() {
  memoryStore.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(KEY);
  }
}

export function captureSnapshot(measurements: Record<string, Measurement>): Record<string, Measurement> {
  return JSON.parse(JSON.stringify(measurements)) as Record<string, Measurement>;
}
