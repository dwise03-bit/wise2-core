/**
 * PromptOS Type Definitions
 * Type-safe interfaces for prompt system, agents, and composition
 */

/**
 * Module types - defines what a prompt module is
 */
export interface PromptModule {
  /** Module identifier (e.g., "reasoning", "tool-use") */
  id: string;
  /** Human-readable name */
  name: string;
  /** Module content (markdown) */
  content: string;
  /** What modules does this inherit from? */
  inherits?: string[];
  /** Tags for discovery */
  tags?: string[];
  /** When was this last updated? */
  updated?: Date;
  /** Version (for caching) */
  version?: string;
}

/**
 * Agent definition - metadata about an agent
 */
export interface AgentDefinition {
  /** Agent identifier (e.g., "executive", "developer") */
  id: string;
  /** Agent name */
  name: string;
  /** What role does this agent play? */
  role: string;
  /** Specializations of this agent */
  specializations: string[];
  /** Which modules does this agent load? */
  modules: string[];
  /** Tools available to this agent */
  tools: string[];
  /** When was this agent created? */
  created?: Date;
  /** When was this agent last updated? */
  updated?: Date;
}

/**
 * Prompt composition - how prompts are built
 */
export interface PromptComposition {
  /** The loaded agent definition */
  agent: AgentDefinition;
  /** Base system prompt */
  basePrompt: string;
  /** Loaded modules in order */
  modules: PromptModule[];
  /** Full composed prompt (all layers) */
  fullPrompt: string;
  /** Composition timestamp */
  composed: Date;
}

/**
 * Agent context - runtime context for agent execution
 */
export interface AgentContext {
  /** Who is running this agent? */
  userId: string;
  /** Which agent is loaded? */
  agentId: string;
  /** Current workspace directory */
  workspace: string;
  /** Session identifier (for logging/audit) */
  sessionId: string;
  /** User memory (preferences, history) */
  userMemory?: Record<string, unknown>;
  /** Business context (projects, decisions) */
  businessContext?: Record<string, unknown>;
  /** When did this context load? */
  loadedAt: Date;
  /** Rate limits for this session */
  rateLimits?: Record<string, RateLimit>;
}

/**
 * Rate limit configuration
 */
export interface RateLimit {
  /** Max calls per window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Current usage count */
  current: number;
}

/**
 * Tool definition - what a tool is and what it does
 */
export interface ToolDefinition {
  /** Tool identifier */
  id: string;
  /** Tool name */
  name: string;
  /** What does this tool do? */
  description: string;
  /** Input schema (JSON Schema) */
  inputSchema?: Record<string, unknown>;
  /** Output schema (JSON Schema) */
  outputSchema?: Record<string, unknown>;
  /** Categories (file, git, external, etc.) */
  categories: string[];
  /** Rate limit for this tool */
  rateLimit?: RateLimit;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  /** Did the tool succeed? */
  success: boolean;
  /** Result data */
  data?: unknown;
  /** Error message if failed */
  error?: string;
  /** Execution time in ms */
  duration: number;
  /** Tool that was executed */
  tool: string;
}

/**
 * Agent memory - per-agent persistent state
 */
export interface AgentMemory {
  /** Agent identifier */
  agentId: string;
  /** Current task (what's the agent working on?) */
  currentTask?: string;
  /** Work in progress */
  workInProgress?: Record<string, unknown>;
  /** Last checkpoint state */
  lastCheckpoint?: Record<string, unknown>;
  /** Tool execution history */
  toolHistory: ToolExecution[];
  /** When was this memory last updated? */
  updated: Date;
}

/**
 * Tool execution tracking
 */
export interface ToolExecution {
  /** Tool that was called */
  tool: string;
  /** Timestamp */
  timestamp: Date;
  /** Arguments passed */
  args?: unknown;
  /** Result */
  result?: ToolResult;
  /** Was it successful? */
  success: boolean;
}

/**
 * Agent routing - which agent should handle this?
 */
export interface AgentRoutingRequest {
  /** User's request */
  request: string;
  /** Primary keywords identified */
  keywords: string[];
  /** Confidence scores for each agent */
  scores: Record<string, number>;
  /** Recommended agent */
  recommended: string;
  /** Alternative agents */
  alternatives?: string[];
}

/**
 * Decision log - tracks decisions made
 */
export interface Decision {
  /** Decision identifier */
  id: string;
  /** When was this decided? */
  date: Date;
  /** Who decided? */
  decider: string;
  /** What was the problem? */
  problem: string;
  /** What options were considered? */
  options: string[];
  /** Which option was chosen? */
  choice: string;
  /** Why was it chosen? */
  rationale: string;
  /** Expected consequences */
  consequences?: string;
  /** Is this reversible? */
  reversible: boolean;
  /** How will we know if it worked? */
  verification?: string;
}

/**
 * Execution event - what happened during execution
 */
export interface ExecutionEvent {
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  type: 'start' | 'tool_call' | 'decision' | 'error' | 'complete';
  /** Event data */
  data: Record<string, unknown>;
  /** Session this event belongs to */
  sessionId: string;
  /** Agent that triggered this */
  agent: string;
}

/**
 * Session state - complete state of an agent session
 */
export interface SessionState {
  /** Session identifier */
  sessionId: string;
  /** Which agent is running? */
  agentId: string;
  /** Session start time */
  startTime: Date;
  /** Current status */
  status: 'running' | 'paused' | 'complete' | 'error';
  /** Events that occurred */
  events: ExecutionEvent[];
  /** Decisions made */
  decisions: Decision[];
  /** Final result if complete */
  result?: unknown;
  /** Error message if errored */
  error?: string;
}

export type AgentId =
  | 'executive'
  | 'developer'
  | 'infrastructure'
  | 'deployment'
  | 'raspberry-pi'
  | 'discord'
  | 'marketing'
  | 'sales'
  | 'crm'
  | 'finance'
  | 'research'
  | 'documentation'
  | 'voice'
  | 'vision'
  | 'security'
  | 'qa'
  | 'automation';

export type ToolCategory = 'file' | 'git' | 'external' | 'agent' | 'system';

