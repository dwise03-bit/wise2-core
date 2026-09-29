/**
 * Audio Recording System - Public API
 *
 * Exports all audio recording components for WISE² Sound Lab:
 * - RecordingEngine: Core recording with microphone capture
 * - OverdubbingSystem: Multi-track recording with undo
 * - ClickTrack: Professional metronome
 */

export { RecordingEngine, type RecordingOptions, type RecordingMetrics, type RecordedAudioBuffer } from './RecordingEngine';
export { OverdubbingSystem, type Track, type RecordingUndoState, type PunchInOutMarkers } from './Overdubbing';
export { ClickTrack, type ClickTrackConfig, type ClickTrackState } from './ClickTrack';
