/**
 * LiveStudio Component Exports
 * Main entry point for all OBS and streaming components
 */

// Chat Overlay
export { OBSChatOverlay } from './OBSChatOverlay';
export type {
  ChatPlatform,
  AlertType,
  CornerPosition,
  ChatMessage,
  ChatAlert,
  ChatOverlayConfig,
} from './OBSChatOverlay';

// Chat Types
export {
  createDefaultChatConfig,
  POSITION_LABELS,
  PLATFORM_LABELS,
  ALERT_TYPE_LABELS,
} from './types/chat';
export type {
  ChatMessage as ChatMessageType,
  ChatAlert as ChatAlertType,
  ChatOverlayConfig as ChatOverlayConfigType,
} from './types/chat';

// OBS Components
export { OBSSourceManager } from './OBSSourceManager';
export type { Source } from './OBSSourceManager';

export { OBSSourceProperties } from './OBSSourceProperties';
export { OBSStreamControl } from './OBSStreamControl';
export { OBSStreamStats } from './OBSStreamStats';
export { OBSPreviewCanvas } from './OBSPreviewCanvas';
export { OBSSceneManager } from './OBSSceneManager';

// Scene & Source Management
export { SceneManager } from './SceneManager';
export type {
  Scene,
  SceneSource,
  TransitionType,
  SceneTemplate,
  SceneManagerProps,
} from './SceneManager';

export { SourceManager } from './SourceManager';
export type { Source as SourceManagerSource, SourceManagerProps } from './SourceManager';

export { PreviewCanvas } from './PreviewCanvas';
export { StreamControl } from './StreamControl';
export { default as StreamStats } from './StreamStats';

// Unified OBS Interface
export { PreviewUI } from './PreviewUI';
export type { PreviewUIProps } from './PreviewUI';

export { AddSourceModal } from './AddSourceModal';
export type { AddSourceModalProps } from './AddSourceModal';

// Integration
export { LiveStudioIntegration } from './LiveStudioIntegration';

// Streaming Control System
export { default as StreamingControl } from './StreamingControl';
export { default as PlatformSettings } from './PlatformSettings';
export { default as StreamTransport } from './StreamTransport';
export { useStreamingState } from './useStreamingState';

// Streaming Types & Constants
export type {
  StreamingPlatform,
  Resolution,
  FPS,
  Encoder,
  Preset,
  StreamStatus,
  HealthStatus,
  BitrateSettings,
  EncoderSettings,
  StreamSettings,
  PlatformCredentials,
  StreamState,
  PlatformConfig,
  EncoderCapability,
  StreamingControlContextType,
} from './streamingTypes';

export {
  PLATFORM_CONFIGS,
  RESOLUTION_PRESETS,
  FPS_OPTIONS,
  BITRATE_PRESETS,
  ENCODER_PRESETS,
  PRESET_DESCRIPTIONS,
  ENCODER_OPTIONS,
  ENCODER_CAPABILITIES,
  DEFAULT_STREAM_SETTINGS,
  STATS_GRAPH_CONFIG,
  HEALTH_THRESHOLDS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
} from './streamingConstants';
