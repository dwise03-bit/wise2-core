import type { AgentEvent } from '../types/events';
import type { EventSource } from './adapter';

/**
 * Real Hermes gateway client.
 *
 * Reach (per ADR-0008): Cloudflare Tunnel exposes the production
 * `wise2-second-brain` as `wss://hermes.wise2.net/brain-stream`, protected by
 * a Cloudflare Access policy. The browser authenticates via the Cloudflare
 * Access session cookie, so **no Hermes token lives in the JS bundle**. If
 * the viewer isn't yet logged into Cloudflare Access they'll be bounced to
 * the Access login on first connection and can retry.
 *
 * Tailscale remains the private reach for host-to-host wire-up between the
 * VPS and Surface (used by the WISE² CLI tooling, not the browser).
 *
 * Status (2026-10-06): endpoint URL recorded; production connection still
 * depends on Daniel standing up the Cloudflare Tunnel + Access policy and
 * the VPS exposing `/brain-stream`. See
 * `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`.
 */
export const HERMES_WSS = 'wss://hermes.wise2.net/brain-stream';

export class WebSocketEventSource implements EventSource {
  readonly kind = 'websocket' as const;
  private socket: WebSocket | null = null;
  private readonly url: string;
  private onEventFn: ((event: AgentEvent) => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(url: string = HERMES_WSS) {
    this.url = url;
  }

  connect(onEvent: (event: AgentEvent) => void): void {
    this.stopped = false;
    this.onEventFn = onEvent;
    this.open();
  }

  private open(): void {
    try {
      // Browsers include the Cloudflare Access cookie automatically for the
      // same-origin WebSocket — no explicit credentials option exists on the
      // WebSocket API, and no token is passed in the URL.
      this.socket = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket.addEventListener('message', (frame) => {
      if (!this.onEventFn) return;
      try {
        const parsed = JSON.parse(frame.data) as AgentEvent;
        if (parsed && typeof parsed.event_type === 'string') this.onEventFn(parsed);
      } catch {
        // Malformed frame; swallow silently so one bad event doesn't poison the UI.
      }
    });
    this.socket.addEventListener('close', () => {
      if (!this.stopped) this.scheduleReconnect();
    });
    this.socket.addEventListener('error', () => {
      this.socket?.close();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.open(), 3000);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
    this.onEventFn = null;
  }
}
