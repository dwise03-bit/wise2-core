import type { AgentEvent } from '../types/events';

/**
 * The one interface every event source implements. Keeps the UI unaware
 * of whether events come from a mock, a WebSocket, or an SSE stream.
 */
export interface EventSource {
  readonly kind: 'simulated' | 'websocket' | 'sse';
  connect(onEvent: (event: AgentEvent) => void): void;
  disconnect(): void;
}
