/**
 * WISE² Discord Ecosystem - Type Definitions
 * Comprehensive types for all bots and services
 */

import { SlashCommandBuilder, CommandInteraction, ContextMenuCommandBuilder } from 'discord.js';

// ============================================================================
// BOT FRAMEWORK TYPES
// ============================================================================

export interface BotConfig {
  name: string;
  token: string;
  clientId: string;
  guildId?: string;
  intents: number[];
  permissions?: bigint;
  description: string;
  color: string;
}

export interface CommandHandler {
  data: SlashCommandBuilder | ContextMenuCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
  cooldown?: number; // in seconds
  requiredPermissions?: string[];
  requiresAdmin?: boolean;
}

export interface EventHandler {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void>;
}

export interface BotMessage {
  guildId: string;
  channelId: string;
  userId: string;
  content: string;
  embeds?: any[];
  components?: any[];
  ephemeral?: boolean;
}

export interface QueuedMessage extends BotMessage {
  timestamp: number;
  retries: number;
  maxRetries: number;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export type RateLimitType = 'user' | 'guild' | 'channel' | 'command';

// ============================================================================
// AUDIT LOGGING TYPES
// ============================================================================

export interface AuditLog {
  timestamp: number;
  userId: string;
  userName?: string;
  guildId: string;
  command: string;
  action: string;
  status: 'success' | 'failure';
  error?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogConfig {
  enabled: boolean;
  channels?: string[];
  logFile?: string;
  retentionDays?: number;
}

// ============================================================================
// DEPLOYMENT BOT TYPES
// ============================================================================

export interface DeploymentStatus {
  id: string;
  version: string;
  status: 'pending' | 'building' | 'testing' | 'deployed' | 'failed' | 'rolled-back';
  environment: 'staging' | 'production';
  startTime: number;
  endTime?: number;
  error?: string;
  changes?: string[];
  commits?: string[];
  triggeredBy: string;
  logs?: string;
}

export interface DeploymentConfig {
  autoNotify: boolean;
  channels: {
    notifications: string;
    logs: string;
    alerts: string;
  };
  environments: string[];
}

// ============================================================================
// STATUS BOT TYPES
// ============================================================================

export interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  responseTime?: number;
  lastCheck: number;
  uptime?: number;
  details?: string;
}

export interface SystemHealth {
  timestamp: number;
  services: ServiceStatus[];
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  metrics?: SystemMetrics;
}

export interface SystemMetrics {
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: number;
  errorRate?: number;
}

export interface RaspberryPiStatus {
  hostname: string;
  uptime: number;
  temperature: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  lastUpdate: number;
}

// ============================================================================
// ANALYTICS BOT TYPES
// ============================================================================

export interface AnalyticsEvent {
  timestamp: number;
  event: string;
  userId?: string;
  guildId?: string;
  metadata?: Record<string, any>;
}

export interface MetricsSnapshot {
  timestamp: number;
  metric: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

export interface AnalyticsReport {
  period: {
    start: number;
    end: number;
  };
  metrics: {
    [key: string]: number | string;
  };
  charts?: string[];
  summary: string;
}

// ============================================================================
// KNOWLEDGE BOT TYPES
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  url?: string;
  lastUpdated: number;
  author?: string;
}

export interface SearchResult {
  entries: KnowledgeEntry[];
  totalResults: number;
  query: string;
  executionTime: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight?: number;
}

// ============================================================================
// AUTOMATION BOT TYPES
// ============================================================================

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  action: string;
  params: Record<string, any>;
  onSuccess?: string; // next step id
  onFailure?: string; // fallback step id
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: 'running' | 'success' | 'failed' | 'paused';
  startTime: number;
  endTime?: number;
  steps: StepExecution[];
  error?: string;
}

export interface StepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: number;
  endTime?: number;
  output?: any;
  error?: string;
}

// ============================================================================
// NOTIFICATION BOT TYPES
// ============================================================================

export interface NotificationConfig {
  channels: Map<string, string[]>; // event type -> channel ids
  subscribers: Map<string, Set<string>>; // channel id -> user ids
  messageTemplates: Map<string, string>;
  enableMentions: boolean;
  batchEnabled: boolean;
  batchInterval: number; // ms
}

export interface NotificationEvent {
  type: string;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// ============================================================================
// VOICE BOT TYPES
// ============================================================================

export interface VoiceAssistant {
  name: string;
  model: string;
  capabilities: string[];
  provider: string;
  config: Record<string, any>;
}

export interface VoiceCommand {
  text: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
}

// ============================================================================
// EMERGENCY BOT TYPES
// ============================================================================

export interface IncidentReport {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  title: string;
  description: string;
  reportedAt: number;
  reportedBy: string;
  status: 'open' | 'acknowledged' | 'resolved';
  assignee?: string;
  escalations: EscalationEvent[];
  communications: CommunicationEvent[];
}

export interface EscalationEvent {
  timestamp: number;
  fromLevel: number;
  toLevel: number;
  reason: string;
  escalatedBy: string;
}

export interface CommunicationEvent {
  timestamp: number;
  type: 'alert' | 'update' | 'resolution';
  channels: string[];
  recipients: string[];
  message: string;
}

export interface OnCallSchedule {
  name: string;
  escalations: OnCallLevel[];
  currentLevel: number;
  lastRotation: number;
}

export interface OnCallLevel {
  level: number;
  name: string;
  timeoutMs: number;
  members: OnCallMember[];
}

export interface OnCallMember {
  userId: string;
  userName: string;
  contactMethod: 'discord' | 'email' | 'sms' | 'phone';
  contactValue: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export interface PermissionLevel {
  level: number;
  name: string;
  roles: string[];
  users: string[];
}

export interface PermissionContext {
  userId: string;
  guildId: string;
  roleIds: string[];
  isAdmin: boolean;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface BotError {
  code: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  timestamp: number;
  botName: string;
}

export interface ErrorHandler {
  handle: (error: BotError) => Promise<void>;
  shouldRetry: (error: BotError) => boolean;
  getRetryDelay: (attempt: number) => number;
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  botName: string;
  category: string;
  message: string;
  data?: Record<string, any>;
  error?: Error;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheConfig {
  ttl: number; // time to live in ms
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}
