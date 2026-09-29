import { getWise2AccessToken } from './session';
import type { FieldJob, JobStatus } from './field-data';
import { listFieldJobs, updateFieldJob } from './field-data';
import {
  mapApiJobToField,
  mapApiStatusToWeb,
  mapEquipmentToField,
  mapWebStatusToApi,
} from './fieldtech-mapper';
import { wise2Fetch } from './wise2-api';

function isDemoMode(): boolean {
  return process.env.WISE_HVAC_DEMO_MODE === 'true';
}

async function requireWise2AccessToken(): Promise<string | null> {
  return getWise2AccessToken();
}

type ApiJob = Parameters<typeof mapApiJobToField>[0];
type ApiEquipment = Parameters<typeof mapEquipmentToField>[0];

async function fetchEquipment(accessToken: string, equipmentId?: string | null) {
  if (!equipmentId) return null;
  const response = await wise2Fetch(`v1/fieldtech/equipment/${equipmentId}`, accessToken);
  if (!response.ok) return null;
  return (await response.json()) as ApiEquipment;
}

export async function getJobForSession(id: string): Promise<{ job: FieldJob | null; status: number; error?: string }> {
  if (isDemoMode()) {
    const job = listFieldJobs().find((item) => item.id === id) ?? null;
    return job
      ? { job, status: 200 }
      : { job: null, status: 404, error: 'Job not found' };
  }

  const accessToken = await requireWise2AccessToken();
  if (!accessToken) {
    return { job: null, status: 401, error: 'Unauthorized' };
  }

  const response = await wise2Fetch(`v1/fieldtech/jobs/${id}`, accessToken);
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return {
      job: null,
      status: response.status,
      error: detail || 'Job not found',
    };
  }

  const apiJob = (await response.json()) as ApiJob;
  const equipment = await fetchEquipment(accessToken, apiJob.equipmentId);
  return { job: mapApiJobToField(apiJob, equipment), status: 200 };
}

export async function listJobsForSession(): Promise<{ jobs: FieldJob[]; status: number; error?: string }> {
  if (isDemoMode()) {
    return { jobs: listFieldJobs(), status: 200 };
  }

  const accessToken = await requireWise2AccessToken();
  if (!accessToken) {
    return { jobs: [], status: 401, error: 'Unauthorized' };
  }

  const response = await wise2Fetch('v1/fieldtech/jobs', accessToken);
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return {
      jobs: [],
      status: response.status,
      error: detail || 'Could not load assigned jobs from WISE².',
    };
  }

  const apiJobs = (await response.json()) as ApiJob[];
  const jobs = await Promise.all(
    apiJobs.map(async (job) => {
      const equipment = await fetchEquipment(accessToken, job.equipmentId);
      return mapApiJobToField(job, equipment);
    }),
  );
  return { jobs, status: 200 };
}

export async function patchJobForSession(
  id: string,
  updates: { status?: JobStatus; notes?: string },
): Promise<{ job: FieldJob | null; status: number; error?: string }> {
  if (isDemoMode()) {
    const job = updateFieldJob(id, updates);
    return job
      ? { job, status: 200 }
      : { job: null, status: 404, error: 'Job not found' };
  }

  const accessToken = await requireWise2AccessToken();
  if (!accessToken) {
    return { job: null, status: 401, error: 'Unauthorized' };
  }

  const body: { status?: string; notes?: string } = {};
  if (updates.status) body.status = mapWebStatusToApi(updates.status);
  if (typeof updates.notes === 'string') body.notes = updates.notes;

  const response = await wise2Fetch(`v1/fieldtech/jobs/${id}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return {
      job: null,
      status: response.status,
      error: detail || 'Update could not be saved.',
    };
  }

  const apiJob = (await response.json()) as ApiJob;
  const equipment = await fetchEquipment(accessToken, apiJob.equipmentId);
  return { job: mapApiJobToField(apiJob, equipment), status: 200 };
}

export function mapApiJobStatus(status: string): JobStatus {
  return mapApiStatusToWeb(status);
}
