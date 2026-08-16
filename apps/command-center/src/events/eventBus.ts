import { EventEmitter } from 'events';

export type EventSeverity = 'info' | 'success' | 'warning' | 'error';
export type EventType =
  | 'system.health'
  | 'edge.online'
  | 'edge.offline'
  | 'edge.alert'
  | 'brain.query'
  | 'brain.knowledge'
  | 'revenue.subscription'
  | 'revenue.payment_failed'
  | 'deployment.success'
  | 'deployment.failure'
  | 'discord.command'
  | 'security.alert'
  | 'stream.connected'
  | 'stream.heartbeat'
  | 'big-byte.online'
  | 'big-byte.offline'
  | 'big-byte.alert';

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: EventType;
  severity: EventSeverity;
  source: string;
  title: string;
  message: string;
  deviceId?: string;
  businessId?: string;
  meta?: Record<string, string | number | boolean>;
}

// Module singleton — persists for the lifetime of the Next.js server process.
// In production (standalone mode) this is the single Node.js process.
function getEventBus(): EventEmitter {
  const g = globalThis as typeof globalThis & { __wise2EventBus?: EventEmitter };
  if (!g.__wise2EventBus) {
    const bus = new EventEmitter();
    bus.setMaxListeners(200);
    g.__wise2EventBus = bus;
  }
  return g.__wise2EventBus;
}

export const eventBus = getEventBus();

export function publishEvent(event: Omit<LiveEvent, 'id' | 'timestamp'>): LiveEvent {
  const full: LiveEvent = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    ...event,
  };
  eventBus.emit('live-event', full);
  return full;
}
