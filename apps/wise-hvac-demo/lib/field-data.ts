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

// Production stays empty unless demo mode is on. Work orders otherwise arrive from dispatch.
const demoJob: FieldJob = {
  id: 'job-rtu-1a',
  technicianId: 'tech-daniel',
  customerName: 'Riverside Medical Plaza',
  customerPhone: '3365550148',
  customerEmail: 'facilities@riverside-demo.example',
  address: '1840 West Market Street, Greensboro, NC',
  appointmentAt: new Date().toISOString(),
  complaint:
    'Rooftop unit not cooling. HIGH HEAD PRESSURE 248.7 PSIG, low subcooling 8.6°F, normal superheat 11.2°F, ΔT 17°F. Frosting on the liquid line drier.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  notes: '',
  accessNotes: 'Roof hatch on the east stairwell. Badge required after 6pm.',
  equipment: {
    manufacturer: 'Carrier',
    model: '48TCED16A2A5',
    serial: 'RTU-1A',
    tonnage: 15,
    installedAt: '2019-04-12T00:00:00.000Z',
    warranty: 'Parts warranty expired. Labor warranty not in force.',
  },
  serviceHistory: [
    { date: '2025-08-14T00:00:00.000Z', type: 'Maintenance', summary: 'Filter change and condenser wash.' },
  ],
  updatedAt: new Date().toISOString(),
};

const initialJobs: FieldJob[] = process.env.WISE_HVAC_DEMO_MODE === 'false' ? [] : [demoJob];

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
