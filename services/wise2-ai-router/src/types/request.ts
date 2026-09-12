/**
 * WISE² AI Router - Normalized Request/Response Contracts
 * Single format for all clients (Discord, Sound Labs, Edge, Hermes)
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ContextRef {
  files?: string[];           // File paths to fetch
  vault?: string[];           // Second Brain items
  previous_session?: string;  // Session ID for history
}

export type RoutingMode = 'AUTO' | 'LOCAL' | 'CLOUD';
export type PrivacyClass = 'public' | 'internal' | 'confidential';
export type Priority = 'critical' | 'high' | 'normal' | 'low';
export type TaskType = 'code' | 'summary' | 'chat' | 'generation' | 'analysis' | 'translation' | 'other';

/**
 * Normalized request sent by clients to router
 */
export interface AIRequest {
  // Identification
  project_id: string;           // e.g. "wise2-core", "sencere-brand"
  agent_id: string;             // e.g. "discord-bot", "sound-labs"
  user_id: string;              // e.g. "dwise", "sencere"
  task_type: TaskType;          // Classification for routing

  // Messages
  messages: AIMessage[];        // Normalized message format

  // Capabilities & constraints
  capabilities_required?: string[]; // ["code-gen", "reasoning", "vision", ...]
  context_refs?: ContextRef;    // Optional context references
  max_tokens?: number;          // Request token limit (overrides default)
  max_cost?: number;            // $ cost limit for this request

  // Routing & policy
  route_mode: RoutingMode;      // Routing preference (default: AUTO)
  privacy_class?: PrivacyClass; // Default: internal
  priority?: Priority;           // Default: normal

  // Metadata
  metadata?: Record<string, any>; // Custom metadata (preserved in telemetry)
  request_id?: string;          // Optional - generated if not provided
}

/**
 * Normalized response from router to clients
 */
export interface AIResponse {
  // Response content
  response: string;             // The actual AI response

  // Usage metrics
  usage: {
    input_tokens: number;
    output_tokens: number;
    context_bytes: number;
  };

  // Routing information
  routing: {
    actual_route: 'LOCAL' | 'CLOUD';
    model: string;              // Model used (e.g. "ollama-qwen-coder")
    provider: string;           // Provider (e.g. "ollama", "claude")
    latency_ms: number;
    estimated_cost: number;     // $ cost to run this request
  };

  // Cache status
  cache: {
    hit: boolean;               // Was this result cached?
    key?: string;               // Cache key (if hit)
  };

  // Escalation info
  escalation?: {
    reason: string;             // Why escalated to cloud
    attempted_model: string;    // What local model was tried first
  };

  // Reference
  telemetry_id: string;         // UUID for logging/debugging
}

/**
 * Error response from router
 */
export interface AIError {
  error: {
    code: string;               // e.g. "BUDGET_EXHAUSTED", "PROVIDER_UNAVAILABLE"
    message: string;
    details: {
      available_providers?: string[];
      suggested_action?: string;
      budget_status?: {
        used_pct: number;
        daily_budget: number;
        used: number;
        remaining: number;
      };
    };
    timestamp: string;          // ISO8601
    request_id: string;         // For support/debugging
  };
}

/**
 * Provider interface - all AI backends implement this
 */
export interface AIProvider {
  name: string;
  isHealthy(): Promise<boolean>;
  listModels(): Promise<Model[]>;
  estimate(request: AIRequest): Promise<{ tokens: number; cost: number }>;
  generate(request: AIRequest): Promise<string>;
}

/**
 * Model metadata
 */
export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  capabilities: string[];
  costPerInputToken?: number;      // Only for cloud
  costPerOutputToken?: number;     // Only for cloud
  priority?: number;               // For AUTO selection (lower = try first)
  lastHealthCheck?: Date;
  healthy?: boolean;
}

/**
 * Budget tracking
 */
export interface BudgetStatus {
  daily_budget: number;
  used: number;
  remaining: number;
  used_pct: number;
  threshold: 'NORMAL' | 'WARN' | 'COMPRESS' | 'RESTRICT' | 'BRAKE';
}
