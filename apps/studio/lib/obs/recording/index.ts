/**
 * Recording System - Main Export
 *
 * Local Stream Recording System with:
 * - RecordingEngine: Core recording logic
 * - RecordingControl: UI component for controls
 * - RecordingsList: UI component for browsing
 * - API handlers: Server-side recording management
 */

export { RecordingEngine, getRecordingEngine, resetRecordingEngine } from './RecordingEngine';
export { RecordingControl } from './RecordingControl';
export { RecordingsList } from './RecordingsList';
export { useRecording } from './useRecording';

export type {
  RecordingConfig,
  RecordingMetadata,
  AudioTrackInfo,
  RecordingStatus,
  RecordingEvent,
  RecordingFile,
  RecordingsListProps,
  RecordingControlProps,
} from './types';

// API Handlers
export {
  handleUploadRecording,
  handleSaveMetadata,
  handleUpdateMetadata,
  handleListRecordings,
  handleGetRecording,
  handleDeleteRecording,
  handleDownloadRecording,
  handleArchiveRecording,
} from './api';

/**
 * Usage Example:
 *
 * import { RecordingEngine, RecordingControl, RecordingsList } from '@/lib/obs/recording';
 *
 * const recorder = getRecordingEngine({
 *   format: 'mp4',
 *   quality: 'high',
 *   bitrate: 5000,
 *   splitThreshold: 'small', // 1GB
 * });
 *
 * // Start recording
 * const metadata = await recorder.startRecording(stream, 'My Recording', {
 *   platform: 'twitch',
 *   streamTitle: 'Live Stream'
 * });
 *
 * // Listen to events
 * recorder.on('size-update', ({ size, parts }) => console.log(size, parts));
 * recorder.on('split', ({ part }) => console.log(`Split part ${part}`));
 * recorder.on('error', ({ message }) => console.error(message));
 *
 * // Pause/Resume
 * recorder.pauseRecording();
 * recorder.resumeRecording(); // Max 30s pause
 *
 * // Stop recording
 * const finalMetadata = await recorder.stopRecording();
 *
 * // UI Components
 * <RecordingControl
 *   status={recordingStatus}
 *   duration={duration}
 *   fileSize={fileSize}
 *   splitCount={splitCount}
 *   onStart={handleStart}
 *   onStop={handleStop}
 *   onPause={handlePause}
 *   onResume={handleResume}
 * />
 *
 * <RecordingsList
 *   recordings={recordings}
 *   onPlay={handlePlay}
 *   onDelete={handleDelete}
 *   onDownload={handleDownload}
 *   onMove={handleMove}
 * />
 */
