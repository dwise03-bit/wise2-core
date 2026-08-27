export type JobStatus = 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';

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
  equipment: {
    manufacturer: string;
    model: string;
    serial: string;
    tonnage: number;
    installedAt: string;
    warranty: string;
  };
  serviceHistory: ServiceEvent[];
  updatedAt: string;
};

// Production starts empty. Work orders must arrive from an authenticated dispatch source.
const initialJobs: FieldJob[] = [];

declare global {
  // eslint-disable-next-line no-var
  var wiseHvacFieldJobs: FieldJob[] | undefined;
}

const jobs = globalThis.wiseHvacFieldJobs ?? structuredClone(initialJobs);
globalThis.wiseHvacFieldJobs = jobs;

export function listFieldJobs() {
  return jobs.map((job) => structuredClone(job));
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
    ...(updates.status ? { status: updates.status } : {}),
    ...(typeof updates.notes === 'string' ? { notes: updates.notes.trim() } : {}),
    updatedAt: new Date().toISOString(),
  };
  return structuredClone(jobs[index]);
}
