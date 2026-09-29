export type JobStatus =
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED';

export const JOB_STATUSES: JobStatus[] = [
  'DISPATCHED',
  'EN_ROUTE',
  'ON_SITE',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'COMPLETED',
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DISPATCHED: 'Scheduled',
  EN_ROUTE: 'En route',
  ON_SITE: 'On site',
  IN_PROGRESS: 'Diagnosing',
  AWAITING_APPROVAL: 'Awaiting approval',
  COMPLETED: 'Completed',
};

export type ServiceEvent = {
  date: string;
  type: string;
  summary: string;
  amount?: number;
};

export type FieldJob = {
  id: string;
  technicianId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  appointmentAt: string;
  complaint: string;
  status: JobStatus;
  priority: 'NORMAL' | 'HIGH';
  notes: string;
  accessNotes: string;
  dispatchNotes?: string;
  equipment: {
    manufacturer: string;
    model: string;
    serial: string;
    tonnage: number;
    installedAt: string;
    warranty: string;
    equipmentType?: string;
    refrigerant?: string;
    voltage?: string;
    phase?: string;
    location?: string;
    assetId?: string;
    nominalCapacity?: string;
  };
  serviceHistory: ServiceEvent[];
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var wiseHvacFieldJobs: FieldJob[] | undefined;
}

const jobs = globalThis.wiseHvacFieldJobs ?? [];
globalThis.wiseHvacFieldJobs = jobs;

/** Explicit demo mode only — production uses WISE² Fieldtech API. */
export function listFieldJobs() {
  return jobs.map((job) => structuredClone(job));
}

const PERSISTED_JOBS_KEY = 'wise2_hvac_field_jobs';

export function hydrateFieldJobs(nextJobs: FieldJob[]): FieldJob[] {
  jobs.splice(0, jobs.length, ...nextJobs.map((job) => structuredClone(job)));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PERSISTED_JOBS_KEY, JSON.stringify(jobs));
  }
  return listFieldJobs();
}

export function loadPersistedFieldJobs(): FieldJob[] {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(PERSISTED_JOBS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FieldJob[];
        if (Array.isArray(parsed)) jobs.splice(0, jobs.length, ...parsed);
      } catch {
        window.localStorage.removeItem(PERSISTED_JOBS_KEY);
      }
    }
  }
  return listFieldJobs();
}

export function getFieldJob(id: string) {
  const job = jobs.find((item) => item.id === id);
  return job ? structuredClone(job) : null;
}

export function updateFieldJob(id: string, updates: { status?: JobStatus; notes?: string }) {
  const index = jobs.findIndex((item) => item.id === id);
  if (index === -1) return null;

  jobs[index] = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return structuredClone(jobs[index]);
}
