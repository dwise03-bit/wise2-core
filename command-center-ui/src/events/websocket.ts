import type { AgentEvent, NodeStatus, PacketKind } from '../types/events';
import type { EventSource } from './adapter';

export const HERMES_WSS = 'ws://127.0.0.1:3100/brain-stream';

type RawEvent = Record<string, unknown>;

const statusMap = (v: unknown): NodeStatus => {
  const s = String(v ?? '').toUpperCase();
  const allowed: NodeStatus[] = ['ONLINE','IDLE','THINKING','EXECUTING','WAITING','APPROVAL','PAUSED','WARNING','FAILED','OFFLINE'];
  return allowed.includes(s as NodeStatus) ? (s as NodeStatus) : 'ONLINE';
};

function normalize(raw: RawEvent): AgentEvent | null {
  const rawType = String(raw.event_type ?? '');
  const payload = (raw.payload && typeof raw.payload === 'object' ? raw.payload : {}) as Record<string, unknown>;
  const ts = raw.timestamp ?? raw.ts;
  const timestamp = typeof ts === 'number' ? ts : Date.parse(String(ts ?? '')) || Date.now();
  const event_id = String(raw.event_id ?? `evt-${timestamp}-${Math.random().toString(36).slice(2,8)}`);
  const execution_id = raw.execution_id ? String(raw.execution_id) : undefined;

  if (rawType === 'system.heartbeat') {
    return { event_id, timestamp, event_type: 'node.status', source_node: 'hermes', status: statusMap(raw.status) };
  }
  if (rawType === 'hermes.query.started') {
    return { event_id, timestamp, event_type: 'execution.start', execution_id: execution_id ?? event_id, source_node: 'hermes', message: 'Hermes query started' };
  }
  if (rawType === 'hermes.query.completed') {
    return { event_id, timestamp, event_type: 'execution.complete', execution_id: execution_id ?? event_id, source_node: 'hermes', message: 'Hermes query completed', metadata: { model: String(payload.model ?? '') } };
  }
  if (rawType === 'hermes.error') {
    return { event_id, timestamp, event_type: 'node.status', source_node: 'hermes', status: 'FAILED', message: String(payload.detail ?? 'Hermes error') };
  }
  if (rawType === 'knowledge.created' || rawType === 'knowledge.deleted' || rawType === 'chat.completed') {
    return { event_id, timestamp, event_type: 'packet.send', source_node: 'hermes', target_node: 'planner', packet_kind: (rawType.startsWith('knowledge') ? 'MEMORY' : 'RESULT') as PacketKind, message: rawType };
  }
  const supported = ['node.status','edge.activate','edge.deactivate','packet.send','execution.start','execution.step','execution.complete','execution.fail','approval.request','approval.resolve'];
  if (supported.includes(rawType)) {
    return { ...(raw as unknown as AgentEvent), event_id, timestamp };
  }
  return null;
}

export class WebSocketEventSource implements EventSource {
  readonly kind = 'websocket' as const;
  private socket: WebSocket | null = null;
  private readonly url: string;
  private onEventFn: ((event: AgentEvent) => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(url: string = HERMES_WSS) { this.url = url; }

  connect(onEvent: (event: AgentEvent) => void): void {
    this.stopped = false; this.onEventFn = onEvent; this.open();
  }

  private open(): void {
    try { this.socket = new WebSocket(this.url); }
    catch { this.scheduleReconnect(); return; }
    this.socket.addEventListener('message', (frame) => {
      if (!this.onEventFn) return;
      try {
        const event = normalize(JSON.parse(String(frame.data)) as RawEvent);
        if (event) this.onEventFn(event);
      } catch { /* ignore malformed frames */ }
    });
    this.socket.addEventListener('close', () => { if (!this.stopped) this.scheduleReconnect(); });
    this.socket.addEventListener('error', () => this.socket?.close());
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.open(), 3000);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null; this.socket?.close(); this.socket = null; this.onEventFn = null;
  }
}
