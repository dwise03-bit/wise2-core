// Core types and interfaces
export * from './types';

// Phase 1: Core managers and orchestrators
export { CallSessionManager } from './call-session';
export { ToolRegistry } from './tool-registry';
export { VoiceOrchestrator } from './voice-orchestrator';

// Phase 1: Mock implementations for testing
export { CRMMock } from './crm-mock';
export { SchedulerMock } from './scheduler-mock';
export { VoiceModelMock } from './voice-model-mock';

// Phase 1: Test harness
export { TestHarness } from './test-harness';

// Phase 2: Real provider implementations
export { TwilioProvider } from './twilio-provider';
export { OpenAIRealtimeProvider } from './openai-realtime-provider';

// Phase 2: Media and recording
export { MediaStreamHandler } from './media-stream-handler';
export { CallRecordingService } from './call-recording-service';

// Phase 2: Orchestration layer
export { Phase2Orchestrator } from './phase2-orchestrator';
