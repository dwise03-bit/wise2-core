import { OrchestratorMetrics, SystemMetrics, SecondBrainMetrics, DiscordMetrics, HealthStatus, ActivityEvent } from './metrics';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface MetricsResponse extends APIResponse<{
  orchestrator: OrchestratorMetrics;
  system: SystemMetrics;
  secondBrain: SecondBrainMetrics;
  discord: DiscordMetrics;
}> {}

export interface HealthResponse extends APIResponse<HealthStatus> {}

export interface ActivityResponse extends APIResponse<{
  events: ActivityEvent[];
  total: number;
  since: number;
}> {}

export interface WebSocketMessage {
  type: 'metric-update' | 'status-change' | 'activity' | 'alert';
  widgetId?: string;
  data: any;
  timestamp: number;
}

export interface MetricUpdateMessage extends WebSocketMessage {
  type: 'metric-update';
  widgetId: string;
  metric: string;
  value: any;
}

export interface StatusChangeMessage extends WebSocketMessage {
  type: 'status-change';
  system: string;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface ActivityEventMessage extends WebSocketMessage {
  type: 'activity';
  event: ActivityEvent;
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert';
  alert: {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    system: string;
  };
}
