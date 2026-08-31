import { MixerState, SoundLabsProject } from './types';

/** Browser calls use the Command Center `/api` proxy; SSR uses the configured API URL. */
export function getSoundLabApiBase() {
  if (typeof window !== 'undefined') return '/api';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
}

export function getSoundLabToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';
}

async function slFetch(path: string, init: RequestInit = {}) {
  const token = getSoundLabToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${getSoundLabApiBase()}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || data.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data;
}

export async function listProjects(): Promise<SoundLabsProject[]> {
  const data = await slFetch('/v1/sound-labs/me/projects');
  return data.projects || [];
}

export async function createProject(name: string, description?: string): Promise<SoundLabsProject> {
  const data = await slFetch('/v1/sound-labs/me/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  return data.project;
}

export async function getProject(id: string): Promise<SoundLabsProject> {
  return slFetch(`/v1/sound-labs/me/projects/${id}`);
}

export async function updateProject(
  id: string,
  patch: { name?: string; description?: string; mixerState?: MixerState; lyrics?: string },
) {
  const data = await slFetch(`/v1/sound-labs/me/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data.project as SoundLabsProject;
}

export async function deleteProject(id: string) {
  return slFetch(`/v1/sound-labs/me/projects/${id}`, { method: 'DELETE' });
}

export async function saveMixerState(id: string, mixerState: MixerState) {
  return updateProject(id, { mixerState });
}

export async function uploadRecording(projectId: string, blob: Blob, name: string) {
  const form = new FormData();
  const ext = blob.type.includes('wav') ? 'wav' : blob.type.includes('mpeg') ? 'mp3' : 'webm';
  form.append('file', blob, name.endsWith(`.${ext}`) ? name : `${name}.${ext}`);
  form.append('name', name);
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/recordings`, {
    method: 'POST',
    body: form,
  });
}

export async function attachGalleryAsset(projectId: string, galleryAssetId: string, name?: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/assets`, {
    method: 'POST',
    body: JSON.stringify({ galleryAssetId, name }),
  });
}

export async function listGalleryAudio(userId: string, sourceModule?: string) {
  const token = getSoundLabToken();
  const params = new URLSearchParams({ userId, assetType: 'AUDIO', limit: '80' });
  if (sourceModule) params.set('sourceModule', sourceModule);
  const res = await fetch(`${getSoundLabApiBase()}/v1/gallery?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { assets: [] as any[] };
  return res.json();
}

export async function createReviewLink(projectId: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/review-link`, { method: 'POST' });
}

export async function getReviewProject(token: string) {
  const res = await fetch(`${getSoundLabApiBase()}/v1/sound-labs/review/${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || data.error || `Review link unavailable (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data.project as SoundLabsProject;
}

export async function listReviewComments(token: string) {
  const res = await fetch(`${getSoundLabApiBase()}/v1/sound-labs/review/${encodeURIComponent(token)}/comments`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];
  return data.comments || [];
}

export async function addReviewComment(
  token: string,
  content: string,
  authorName?: string,
  timestamp?: number,
) {
  const res = await fetch(`${getSoundLabApiBase()}/v1/sound-labs/review/${encodeURIComponent(token)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, authorName, timestamp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || data.error || 'Comment failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data.comment;
}

export async function setReviewApproval(
  token: string,
  status: 'approved' | 'revision',
  note?: string,
  authorName?: string,
) {
  const res = await fetch(`${getSoundLabApiBase()}/v1/sound-labs/review/${encodeURIComponent(token)}/approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, authorName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || data.error || 'Approval failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data;
}

export async function generateMusic(
  projectId: string,
  body: { prompt: string; duration?: number; genre?: string; mood?: string; tempo?: number },
) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function canGenerate() {
  try {
    return await slFetch('/v1/sound-labs/me/can-generate');
  } catch {
    return { allowed: false, reason: 'Could not check generation eligibility' };
  }
}

export async function listVersions(projectId: string) {
  const data = await slFetch(`/v1/sound-labs/me/projects/${projectId}/versions`);
  return data.versions || [];
}

export async function createVersion(projectId: string, label: string, changeLog?: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/versions`, {
    method: 'POST',
    body: JSON.stringify({ label, changeLog }),
  });
}

export async function restoreVersion(projectId: string, versionId: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
}

export async function listComments(projectId: string) {
  const data = await slFetch(`/v1/sound-labs/me/projects/${projectId}/comments`);
  return data.comments || [];
}

export async function addComment(projectId: string, content: string, timestamp?: number, trackId?: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, timestamp, trackId }),
  });
}

export async function setApproval(projectId: string, status: 'pending' | 'approved' | 'revision', note?: string) {
  return slFetch(`/v1/sound-labs/me/projects/${projectId}/approval`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  });
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/')) {
    if (typeof window !== 'undefined') return url;
    const base = getSoundLabApiBase().replace(/\/api\/?$/, '');
    return `${base}${url}`;
  }
  return url;
}

export function reviewRecordingUrl(shareToken: string, recordingId: string) {
  return `/api/v1/sound-labs/review/${encodeURIComponent(shareToken)}/recordings/${encodeURIComponent(recordingId)}/audio`;
}

export async function fetchAudioArrayBuffer(url: string): Promise<ArrayBuffer> {
  const token = getSoundLabToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(resolveMediaUrl(url), { headers });
  if (!res.ok) throw new Error(`Audio fetch failed (${res.status})`);
  return res.arrayBuffer();
}
