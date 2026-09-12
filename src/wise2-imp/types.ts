/**
 * WISE² IMP - Intent Management Platform Types
 *
 * Defines the core types for WISE² intelligent routing,
 * risk classification, and multi-executor orchestration.
 */

// ─────────────────────────────────────────────────────────────────────
// INTENT CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────

export enum Intent {
  // Information & Reporting
  CHAT = 'CHAT',
  STATUS = 'STATUS',
  HEALTH = 'HEALTH',
  SEARCH = 'SEARCH',
  MEMORY = 'MEMORY',
  REPORT = 'REPORT',

  // Customer & Business
  CUSTOMER = 'CUSTOMER',
  LEAD = 'LEAD',
  CRM = 'CRM',
  DEMO = 'DEMO',
  CONTENT = 'CONTENT',

  // Development & Coding
  CODE = 'CODE',
  REVIEW = 'REVIEW',
  DEBUG = 'DEBUG',
  BUILD = 'BUILD',
  TEST = 'TEST',

  // AI & Models
  LOCAL_AI = 'LOCAL_AI',
  REMOTE_AI = 'REMOTE_AI',
  REASONING = 'REASONING',

  // Operations
  DEVOPS = 'DEVOPS',
  DEPLOY = 'DEPLOY',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  DATABASE = 'DATABASE',
  MONITORING = 'MONITORING',

  // Business Modules
  HVAC = 'HVAC',
  DEFENSE = 'DEFENSE',
  TRADING = 'TRADING',
  SOUND_LAB = 'SOUND_LAB',
  JINGLE_LAB = 'JINGLE_LAB',
  LIVE_STUDIO = 'LIVE_STUDIO',

  // System
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  HELP = 'HELP',
}

// ─────────────────────────────────────────────────────────────────────
// RISK LEVELS & AUTHORIZATION
// ─────────────────────────────────────────────────────────────────────

export enum RiskLevel {
  LEVEL_0 = 0, // Read-only (execute immediately)
  LEVEL_1 = 1, // Reversible (auto-execute if safe)
  LEVEL_2 = 2, // Mutating (require confirmation)
  LEVEL_3 = 3, // Destructive (require explicit confirmation + expiring token)
}

export interface AuthorizedSender {
  id: string;
  e164_number: string; // Phone number E.164 format
  name: string;
  role: 'owner' | 'operator' | 'viewer'; // Role-based permissions
  created_at: string;
  last_seen: string;
}

// ─────────────────────────────────────────────────────────────────────
// EXECUTION NODES
// ─────────────────────────────────────────────────────────────────────

export enum ExecutionNode {
  MAC_HERMES = 'mac', // Interactive, local, Claude/Codex
  VPS_HERMES = 'vps', // Always-on, production, servers
  GPU_NODE = 'gpu', // Heavy inference, Ollama models
  EDGE_NODE = 'edge', // Raspberry Pi, local automation
  AUTO = 'auto', // Capability-based selection
}

export interface NodeCapability {
  node: ExecutionNode;
  capabilities: string[];
  available: boolean;
  last_heartbeat: string;
  role: 'interactive-primary' | 'always-on-remote' | 'heavy-inference' | 'edge-device';
}

// ─────────────────────────────────────────────────────────────────────
// JOB SYSTEM
// ─────────────────────────────────────────────────────────────────────

export enum JobStatus {
  QUEUED = 'queued',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Job {
  id: string;
  source: 'imessage' | 'discord' | 'web' | 'cli';
  sender: string; // Redacted identity (not raw phone number)
  sender_role: 'owner' | 'operator' | 'viewer';
  intent: Intent;
  executor_node: ExecutionNode;
  executor_type: 'hermes' | 'claude-code' | 'codex' | 'ollama' | 'local-ai';
  risk_level: RiskLevel;
  status: JobStatus;
  title: string;
  description?: string;
  payload: Record<string, unknown>;
  context?: Record<string, unknown>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: unknown;
  error?: string;
  confirmation_token?: string;
  confirmation_expires_at?: string;
  audit_log: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user?: string;
  details?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────
// ROUTING DECISION
// ─────────────────────────────────────────────────────────────────────

export interface RoutingDecision {
  intent: Intent;
  executor_node: ExecutionNode;
  executor_type: string;
  risk_level: RiskLevel;
  requires_confirmation: boolean;
  confirmation_text?: string;
  estimated_duration?: string;
  fallback_node?: ExecutionNode;
  policies_applied: string[];
}

export interface ImpRequest {
  id: string;
  text: string;
  sender_e164: string;
  timestamp: string;
  source: 'imessage' | 'discord' | 'web' | 'cli';
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'audio' | 'document' | 'video';
  url?: string;
  data?: Buffer;
  mime_type?: string;
  transcription?: string; // For audio
}

export interface ImpResponse {
  job_id: string;
  text: string;
  status: 'queued' | 'executed' | 'pending_confirmation';
  confirmation_code?: string;
  result?: unknown;
  next_steps?: string[];
}

// ─────────────────────────────────────────────────────────────────────
// STATE & MEMORY
// ─────────────────────────────────────────────────────────────────────

export interface WISEMemory {
  architecture: Record<string, unknown>;
  customers: Record<string, CustomerRecord>;
  modules: Record<string, ModuleDefinition>;
  services: Record<string, ServiceRecord>;
  decisions: DecisionRecord[];
  runbooks: RunbookRecord[];
  last_updated: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  industry: string;
  deployment_status: 'demo' | 'staging' | 'production';
  demo_url?: string;
  automation_enabled: boolean;
  created_at: string;
}

export interface ModuleDefinition {
  name: string;
  description: string;
  executor: ExecutionNode;
  intents: Intent[];
  requires_auth: boolean;
}

export interface ServiceRecord {
  name: string;
  node: ExecutionNode;
  status: 'online' | 'offline' | 'degraded';
  port?: number;
  last_check: string;
  uptime_percent?: number;
}

export interface DecisionRecord {
  id: string;
  date: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  implications: string[];
  decided_by: string;
}

export interface RunbookRecord {
  id: string;
  title: string;
  triggers: string[];
  steps: string[];
  rollback_steps?: string[];
  owners: string[];
  updated_at: string;
}
