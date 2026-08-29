export type ControlConfig = {
  host: string;
  port: number;
  nodeEnv: string;
  token: string;
  actor: string;
  repoDir: string;
  composeFile: string;
  composeProjectName: string;
  auditFile: string;
  deploymentFile: string;
  dockerBinary: string;
  gitBinary: string;
  nvidiaSmiBinary: string;
  allowedApps: string[];
  allowedServices: string[];
  ollamaUrl: string;
  hermesUrl: string;
  wise2Url: string;
  apiHealthUrl: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
};

export type Envelope<T> = {
  ok: boolean;
  requestId: string;
  action: string;
  target?: string;
  timestamp: string;
  data?: T;
  error?: { code: string; message: string; detail?: string };
};

export type AuditEntry = {
  requestId: string;
  actor: string;
  action: string;
  target?: string;
  source?: string;
  startedAt: string;
  endedAt: string;
  ok: boolean;
  exitCode?: number;
  errorCode?: string;
};

export type ComponentState<T = unknown> = {
  status: 'healthy' | 'degraded' | 'down' | 'unavailable';
  data?: T;
  error?: string;
};

export type DeploymentRecord = {
  id: string;
  app: string;
  previousRevision: string;
  targetRevision: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'rolled_back';
  createdAt: string;
  completedAt?: string;
  health?: unknown;
};
