import type { AgentEvent } from '../types/events';
import type { EventSource } from './adapter';

/**
 * Real Hermes gateway client.
 *
 * Daniel-supplied endpoint: hermes.wise2.net
 * Status (2026-10-06): endpoint known, connection still requires Daniel to
 * confirm the production port/path and supply the scoped device credential.
 * See hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md.
 *
 * This source is NOT auto-wired. App.tsx picks the simulated source until an
 * explicit `?source=ws` opt-in or a build-time flag is set. The browser never
 * holds a token: Hermes credentials live in the owner-only device file and
 * are proxied by the local Python command-center on 127.0.0.1:3010 when
 * enabled. The frontend connects to a same-origin loopback path, not the
 * public hostname directly.
 */
export const DEFAULT_HERMES_HOST = 'hermes.wise2.net';
export const DEFAULT_LOOPBACK_PATH = 'ws://127.0.0.1:3010/brain-stream';

export class WebSocketEventSource implements EventSource {
  readonly kind = 'websocket' as const;
  private socket: WebSocket | null = null;
  private readonly url: string;

  constructor(url: string = DEFAULT_LOOPBACK_PATH) {
    this.url = url;
  }

  connect(onEvent: (event: AgentEvent) => void): void {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener('message', (frame) => {
      try {
        const parsed = JSON.parse(frame.data) as AgentEvent;
        if (parsed && typeof parsed.event_type === 'string') onEvent(parsed);
      } catch {
        // Malformed frame; swallow silently so one bad event doesn't poison the UI.
      }
    });
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }
}
