export type ControllerMode = 'normal' | 'ai' | 'live' | 'wise2'

export interface MidiStatus {
  connected: boolean
  input_port?: string | null
  output_port?: string | null
  last_connection_time?: string | null
  reconnect_attempts: number
}

export interface ModeStatus {
  current_mode: ControllerMode
  available_modes: ControllerMode[]
  handlers_registered: number
}

export interface ReaperStatus {
  connected: boolean
  transport_state?: string
  project_name?: string
  bpm?: number
  current_track?: number
}

export interface AIStatus {
  ollama_url: string
  available_models: string[]
  active_jobs: number
  jobs: Record<string, any>
}

export interface StateSnapshot {
  state: {
    started_at: string
    midi_connected: boolean
    current_mode: ControllerMode
    reaper_connected: boolean
    ai_jobs_active: number
    last_action?: string | null
  }
  action_history_size: number
  recent_actions: any[]
  offline_queue_size: number
  pending_offline_count: number
}

export interface BridgeState {
  midi: MidiStatus
  mode: ModeStatus
  reaper: ReaperStatus | null
  ai: AIStatus
  state: StateSnapshot
}

export interface PadAction {
  note: number
  action: string
  description: string
  async?: boolean
}

export const MODE_COLORS: Record<ControllerMode, string> = {
  normal: 'var(--mode-normal)',  // Cyan
  ai: 'var(--mode-ai)',          // Green
  live: 'var(--mode-live)',      // Purple
  wise2: 'var(--mode-wise2)',    // Gold
}
