import type { DiagnosticApiResult } from './imp-diagnostics.ts';
import type { FieldJob, JobStatus } from './field-data.ts';
import { hydrateFieldJobs, loadPersistedFieldJobs, updateFieldJob } from './field-data.ts';
import { mapApiJobToField, mapWebStatusToApi } from './fieldtech-mapper.ts';
import { hvacAppUrl, webBasePath, wise2PublicApiUrl } from './hvac-public.ts';
import type { Measurement } from './measurements.ts';
import { isFieldTechNative } from './native-google-signin.ts';
import { loadNativeAuth } from './native-session.ts';
import { buildStructuredDiagnosis, structuredToApiFields } from './imp-structured.ts';

export class FieldAuthError extends Error {
  constructor(message = 'Sign in required.') {
    super(message);
    this.name = 'FieldAuthError';
  }
}

function fieldUrl(path: string, native = isFieldTechNative()): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return native ? hvacAppUrl(`/api${suffix}`) : `${webBasePath()}/api${suffix}`;
}

async function nativeFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = loadNativeAuth()?.accessToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers, credentials: 'include', cache: 'no-store' });
}

async function fetchJobsFromWise2(): Promise<FieldJob[] | null> {
  const auth = loadNativeAuth();
  if (!auth?.accessToken) return null;
  const response = await nativeFetch(`${wise2PublicApiUrl()}/v1/fieldtech/jobs`);
  if (response.status === 401) return null;
  if (!response.ok) return null;
  const apiJobs = (await response.json()) as Parameters<typeof mapApiJobToField>[0][];
  return Promise.all(
    apiJobs.map(async (job) => {
      let equipment = null;
      if (job.equipmentId) {
        const equipmentRes = await nativeFetch(
          `${wise2PublicApiUrl()}/v1/fieldtech/equipment/${job.equipmentId}`,
        );
        if (equipmentRes.ok) equipment = await equipmentRes.json();
      }
      return mapApiJobToField(job, equipment);
    }),
  );
}

export async function fetchFieldJobs(): Promise<FieldJob[]> {
  if (isFieldTechNative()) {
    const direct = await fetchJobsFromWise2().catch(() => null);
    if (direct && direct.length > 0) return hydrateFieldJobs(direct);
  }

  try {
    const response = await nativeFetch(fieldUrl('/field/jobs'));
    if (response.ok) {
      const data = (await response.json()) as FieldJob[];
      if (Array.isArray(data) && data.length > 0) return hydrateFieldJobs(data);
    }
  } catch {
    /* fall through to the on-device queue */
  }

  return loadPersistedFieldJobs();
}

export async function patchFieldJob(
  id: string,
  updates: { status?: JobStatus; notes?: string },
): Promise<FieldJob> {
  try {
    if (isFieldTechNative() && loadNativeAuth()?.accessToken && updates.status) {
      const response = await nativeFetch(`${wise2PublicApiUrl()}/v1/fieldtech/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: updates.status ? mapWebStatusToApi(updates.status) : undefined,
          notes: updates.notes,
        }),
      });
      if (response.ok) {
        const apiJob = (await response.json()) as Parameters<typeof mapApiJobToField>[0];
        return mapApiJobToField(apiJob);
      }
    }

    const response = await nativeFetch(fieldUrl(`/field/jobs/${id}`), {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (response.ok) return response.json() as Promise<FieldJob>;
  } catch {
    /* keep the local work order current when the API is signed out */
  }

  loadPersistedFieldJobs();
  const local = updateFieldJob(id, updates);
  if (local) return local;
  throw new Error('Work order is not on this device.');
}

function localDiagnosis(input: {
  symptoms: string;
  complaint?: string;
  measurements: Measurement[];
  refrigerant?: string;
}): DiagnosticApiResult {
  const structured = buildStructuredDiagnosis({
    complaint: input.complaint,
    symptoms: input.symptoms,
    measurements: input.measurements,
    refrigerantKnown: Boolean(input.refrigerant),
  });
  return {
    ...structuredToApiFields(structured),
    generatedAt: new Date().toISOString(),
    aiProvider: 'on-device',
    disclaimer:
      'On-device IMP supports licensed technician judgment. Calculated and demo values are not live tool readings.',
    customerSummary: structured.recommendedAction || structured.primaryFinding,
    safety: structured.nextBestTest?.safety || 'Follow lockout/tagout and manufacturer procedures.',
    parts: ['No parts recommended until measurements are recorded'],
  };
}

export async function requestDiagnosis(input: {
  jobId: string;
  symptoms: string;
  complaint?: string;
  measurements: Measurement[];
  refrigerant?: string;
  unstable?: boolean;
}): Promise<DiagnosticApiResult> {
  try {
    const response = await nativeFetch(fieldUrl('/field/diagnose'), {
      method: 'POST',
      body: JSON.stringify({
        jobId: input.jobId,
        symptoms: input.symptoms,
        refrigerant: input.refrigerant,
        measurements: input.measurements,
        unstable: input.unstable,
      }),
    });
    if (response.ok) return response.json() as Promise<DiagnosticApiResult>;
    if (response.status === 401 && !isFieldTechNative()) throw new FieldAuthError();
  } catch (error) {
    if (error instanceof FieldAuthError) throw error;
    if (!isFieldTechNative()) throw error instanceof Error ? error : new Error('IMP unavailable.');
  }

  if (isFieldTechNative()) {
    return localDiagnosis({
      symptoms: input.symptoms,
      complaint: input.complaint,
      measurements: input.measurements,
      refrigerant: input.refrigerant,
    });
  }

  throw new Error('IMP unavailable.');
}

export { fieldUrl };
