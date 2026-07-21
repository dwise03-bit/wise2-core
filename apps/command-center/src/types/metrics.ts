export interface Metrics {
  timestamp: number;
  [key: string]: any;
}

export interface OrchestratorMetrics extends Metrics {
  intentsPerSecond: number;
  intentDistribution: Record<string, number>;
  modelPerformance: Record<string, ModelStats>;
  cacheHitRate: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface ModelStats {
  name: string;
  successRate: number;
  averageLatency: number;
  totalRequests: number;
  failedRequests: number;
  costPerRequest: number;
}

export interface SystemMetrics extends Metrics {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  diskUsage: number;
  diskTotal: number;
  networkIn: number;
  networkOut: number;
  processCount: number;
}

export interface SecondBrainMetrics extends Metrics {
  documentCount: number;
  syncLatency: number;
  lastSyncTime: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  conflictCount: number;
  recentlyModifiedCount: number;
}

export interface DiscordMetrics extends Metrics {
  activeUsers: number;
  messageRate: number;
  botStatus: 'online' | 'idle' | 'dnd' | 'offline';
  serverCount: number;
  channelActivityMap: Record<string, number>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  lastCheckTime: number;
  checkedSystems: Record<string, boolean>;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  system: string;
  timestamp: number;
  resolved: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'orchestration' | 'sync' | 'deployment' | 'error' | 'alert';
  system: string;
  description: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}
