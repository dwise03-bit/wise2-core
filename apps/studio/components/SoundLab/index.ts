/**
 * Sound Lab DAW Components
 * Professional audio production UI suite for WISE² Studio
 *
 * Core DAW:
 * - Timeline: Canvas-based timeline with playhead and zoom
 * - Track: Individual track with controls and clips
 * - ClipEditor: Enhanced clip editing with pitch/stretch
 * - TransportControl: Playback control and tempo management
 * - Mixer: Professional multi-track mixer
 *
 * Recording & Monitoring:
 * - RecordingControl: Record/Stop UI with clipping detection
 * - InputMonitor: Real-time level metering
 * - MetronomeControl: BPM and time signature controls
 *
 * Suno Integration:
 * - SunoPromptBuilder: AI music generation prompt builder
 * - SunoGenerationQueue: Batch generation management
 * - SunoLibrary: Generated music library
 * - SunoTrackPreview: Track preview player
 */

// DAW Core Components
export { Timeline } from './Timeline';
export type { TimelineProps } from './Timeline';

export { Track } from './Track';
export type { TrackProps } from './Track';

export { ClipEditor } from './ClipEditor';
export type { ClipEditorProps, ClipType } from './ClipEditor';

export { TransportControl } from './TransportControl';
export type { TransportControlProps } from './TransportControl';

export { Mixer } from './Mixer';
export type { MixerProps, ChannelStrip } from './Mixer';

// DAW Integration Example
export { DAWExample } from './DAWExample';

// Recording & Monitoring Components
export { RecordingControl } from './RecordingControl';
export type { RecordingControlProps } from './RecordingControl';

export { InputMonitor } from './InputMonitor';
export type { InputMonitorProps } from './InputMonitor';

export { MetronomeControl } from './MetronomeControl';
export type { MetronomeControlProps } from './MetronomeControl';

// Suno Integration Components
export { SunoPromptBuilder } from './SunoPromptBuilder';
export { SunoGenerationQueue } from './SunoGenerationQueue';
export { SunoLibrary } from './SunoLibrary';
export { SunoTrackPreview } from './SunoTrackPreview';
