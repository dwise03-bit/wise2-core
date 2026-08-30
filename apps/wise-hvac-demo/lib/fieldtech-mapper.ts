import type { FieldJob, JobStatus } from './field-data';

type ApiJob = {
  id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  appointmentAtEpochMillis: number;
  technicianId: string;
  complaint: string;
  equipmentId?: string | null;
  status: string;
  priority?: string;
  notes?: string;
  updatedAtEpochMillis?: number;
};

type ApiEquipment = {
  id: string;
  manufacturer: string;
  model: string;
  serial: string;
  tonnage?: number | null;
  refrigerant?: string;
  voltage?: string;
  phase?: string;
  location?: string;
  equipmentType?: string;
  installationDateEpochMillis?: number | null;
};

const API_TO_WEB_STATUS: Record<string, JobStatus> = {
  SCHEDULED: 'DISPATCHED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ON_SITE',
  DIAGNOSING: 'IN_PROGRESS',
  REPAIRING: 'IN_PROGRESS',
  WAITING: 'AWAITING_APPROVAL',
  COMPLETE: 'COMPLETED',
};

const WEB_TO_API_STATUS: Record<JobStatus, string> = {
  DISPATCHED: 'SCHEDULED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SITE: 'ARRIVED',
  IN_PROGRESS: 'DIAGNOSING',
  AWAITING_APPROVAL: 'WAITING',
  COMPLETED: 'COMPLETE',
};

function unknownEquipment(serial = 'Unknown'): FieldJob['equipment'] {
  return {
    manufacturer: 'Unknown',
    model: 'Unknown',
    serial,
    tonnage: 0,
    installedAt: '',
    warranty: '',
    equipmentType: 'Unknown',
    refrigerant: 'Unknown',
    voltage: 'Unknown',
    phase: 'Unknown',
    location: 'Unknown',
  };
}

export function mapApiStatusToWeb(status: string): JobStatus {
  return API_TO_WEB_STATUS[status] ?? 'DISPATCHED';
}

export function mapWebStatusToApi(status: JobStatus): string {
  return WEB_TO_API_STATUS[status] ?? 'SCHEDULED';
}

export function mapEquipmentToField(equipment?: ApiEquipment | null): FieldJob['equipment'] {
  if (!equipment) return unknownEquipment();
  return {
    manufacturer: equipment.manufacturer || 'Unknown',
    model: equipment.model || 'Unknown',
    serial: equipment.serial || 'Unknown',
    tonnage: equipment.tonnage ?? 0,
    installedAt: equipment.installationDateEpochMillis
      ? new Date(equipment.installationDateEpochMillis).toISOString()
      : '',
    warranty: '',
    equipmentType: equipment.equipmentType || 'Unknown',
    refrigerant: equipment.refrigerant || 'Unknown',
    voltage: equipment.voltage || 'Unknown',
    phase: equipment.phase || 'Unknown',
    location: equipment.location || 'Unknown',
    assetId: equipment.id,
  };
}

export function mapApiJobToField(job: ApiJob, equipment?: ApiEquipment | null): FieldJob {
  return {
    id: job.id,
    technicianId: job.technicianId,
    customerName: job.customerName,
    customerPhone: job.customerPhone || '',
    customerEmail: '',
    address: job.address,
    appointmentAt: new Date(job.appointmentAtEpochMillis).toISOString(),
    complaint: job.complaint || '',
    status: mapApiStatusToWeb(job.status),
    priority: job.priority === 'HIGH' || job.priority === 'EMERGENCY' ? 'HIGH' : 'NORMAL',
    notes: job.notes || '',
    accessNotes: '',
    equipment: mapEquipmentToField(equipment),
    serviceHistory: [],
    updatedAt: job.updatedAtEpochMillis
      ? new Date(job.updatedAtEpochMillis).toISOString()
      : new Date().toISOString(),
  };
}
