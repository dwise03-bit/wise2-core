export type TransportState = 'playing' | 'paused' | 'stopped';

export interface StudioProject { name: string; path: string; }
export interface StudioTrack {
  id: number; name: string; muted: boolean; solo: boolean; armed: boolean;
  volume: number; pan: number;
}
export interface StudioStatus {
  bridge: 'online' | 'offline'; reaper: 'online' | 'offline';
  project: StudioProject | null; transport: TransportState; recording: boolean;
  tempo: number; timeSignature: string; positionSeconds: number;
  trackCount: number; markerCount: number; sessionDurationSeconds: number;
}
export interface StudioMarker { id: number; name: string; positionSeconds: number; }
export interface RenderRequest { format: 'mp3' | 'wav'; kind: 'preview' | 'master'; }
export interface RenderArtifact { id: string; filename: string; format: string; status: 'complete'; createdAt: string; url?: string; }

export interface ReaperAdapter {
  status(): Promise<StudioStatus>;
  project(): Promise<StudioProject | null>;
  tracks(): Promise<StudioTrack[]>;
  transport(action: 'play' | 'stop' | 'pause' | 'record'): Promise<StudioStatus>;
  marker(name: string): Promise<StudioMarker>;
  setTrack(id: number, action: 'mute' | 'unmute' | 'solo' | 'unsolo' | 'arm' | 'disarm'): Promise<StudioTrack>;
  render(request: RenderRequest): Promise<RenderArtifact>;
}

export class StudioService {
  public constructor(private readonly adapter: ReaperAdapter) {}
  status() { return this.adapter.status(); }
  project() { return this.adapter.project(); }
  tracks() { return this.adapter.tracks(); }
  transport(action: 'play' | 'stop' | 'pause' | 'record') { return this.adapter.transport(action); }
  async marker(name: string) { const clean = name.trim(); if (!clean || clean.length > 80) throw new Error('Marker name must be 1–80 characters'); return this.adapter.marker(clean); }
  async setTrack(id: number, action: 'mute' | 'unmute' | 'solo' | 'unsolo' | 'arm' | 'disarm') { if (!Number.isInteger(id) || id < 1) throw new Error('Track must be a positive number'); return this.adapter.setTrack(id, action); }
  render(request: RenderRequest) { return this.adapter.render(request); }
}

export class MockReaperAdapter implements ReaperAdapter {
  private state: StudioStatus = { bridge: 'online', reaper: 'online', project: { name: 'Mock Project', path: '/mock/project.rpp' }, transport: 'stopped', recording: false, tempo: 120, timeSignature: '4/4', positionSeconds: 0, trackCount: 2, markerCount: 0, sessionDurationSeconds: 0 };
  private readonly trackState: StudioTrack[] = [1, 2].map(id => ({ id, name: id === 1 ? 'Vocals' : 'Instrumental', muted: false, solo: false, armed: false, volume: 0, pan: 0 }));
  async status() { return { ...this.state }; }
  async project() { return this.state.project; }
  async tracks() { return this.trackState.map(track => ({ ...track })); }
  async transport(action: 'play' | 'stop' | 'pause' | 'record') { this.state.transport = action === 'record' || action === 'play' ? 'playing' : action === 'stop' ? 'stopped' : 'paused'; this.state.recording = action === 'record'; return this.status(); }
  async marker(name: string) { const marker = { id: ++this.state.markerCount, name, positionSeconds: this.state.positionSeconds }; return marker; }
  async setTrack(id: number, action: 'mute' | 'unmute' | 'solo' | 'unsolo' | 'arm' | 'disarm') { const track = this.trackState.find(item => item.id === id); if (!track) throw new Error(`Track ${id} was not found`); const enabled = !action.startsWith('un') && !action.startsWith('dis'); if (action === 'mute' || action === 'unmute') track.muted = enabled; else if (action === 'solo' || action === 'unsolo') track.solo = enabled; else track.armed = enabled; return { ...track }; }
  async render(request: RenderRequest) { return { id: `mock-${Date.now()}`, filename: `mock-project_v001_${request.kind}.${request.format}`, format: request.format, status: 'complete' as const, createdAt: new Date().toISOString() }; }
}

export class HttpReaperAdapter implements ReaperAdapter {
  public constructor(private readonly baseUrl: string, private readonly token: string) {}
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> { const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, { ...init, headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json', ...init.headers } }); if (!response.ok) throw new Error(`REAPER bridge returned ${response.status}`); return response.json() as Promise<T>; }
  status() { return this.request<StudioStatus>('/reaper/status'); }
  project() { return this.request<StudioProject | null>('/reaper/project'); }
  tracks() { return this.request<StudioTrack[]>('/reaper/tracks'); }
  transport(action: 'play' | 'stop' | 'pause' | 'record') { return this.request<StudioStatus>(`/reaper/${action}`, { method: 'POST' }); }
  marker(name: string) { return this.request<StudioMarker>('/reaper/marker', { method: 'POST', body: JSON.stringify({ name }) }); }
  setTrack(id: number, action: 'mute' | 'unmute' | 'solo' | 'unsolo' | 'arm' | 'disarm') { return this.request<StudioTrack>(`/reaper/tracks/${id}/${action}`, { method: 'POST' }); }
  render(request: RenderRequest) { return this.request<RenderArtifact>('/reaper/render', { method: 'POST', body: JSON.stringify(request) }); }
}
