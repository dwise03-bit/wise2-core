export enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  CREATE_ENTRY = 'create_entry',
  UPDATE_METRICS = 'update_metrics',
  NOTIFY_USER = 'notify_user',
  LOG_EVENT = 'log_event',
  WEBHOOK = 'webhook',
  CONDITIONAL = 'conditional',
  DELAY = 'delay',
}

export enum WorkflowTriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
  EVENT = 'event',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export interface SendEmailActionConfig {
  to: string;
  subject: string;
  body?: string;
  template?: string;
}

export interface CreateEntryActionConfig {
  title: string;
  content: string;
  type?: string;
  tags?: string[];
}

export interface UpdateMetricsActionConfig {
  metricType: string;
  value: number | string;
  operation?: 'set' | 'increment' | 'decrement';
}

export interface NotifyUserActionConfig {
  userId: string;
  message: string;
  channel?: 'email' | 'in_app' | 'sms';
}

export interface LogEventActionConfig {
  event: string;
  properties?: Record<string, any>;
}

export interface WebhookActionConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

export interface ConditionalActionConfig {
  condition: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
    value: any;
  };
}

export interface DelayActionConfig {
  delayMs: number;
}

export type ActionConfig =
  | SendEmailActionConfig
  | CreateEntryActionConfig
  | UpdateMetricsActionConfig
  | NotifyUserActionConfig
  | LogEventActionConfig
  | WebhookActionConfig
  | ConditionalActionConfig
  | DelayActionConfig;

export interface WorkflowExecutionContext {
  triggerData: Record<string, any>;
  results: Record<string, any>;
  variables: Record<string, any>;
}
