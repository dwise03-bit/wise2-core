/**
 * WISE² Agent Framework Type Definitions
 * Core types for multi-agent orchestration
 */

export interface AgentConfig {
  name: string;
  role: string;
  promptPath: string;
  tools: string[];
  maxContextTokens: number;
  timeout: number;
}

export interface AgentRequest {
  id: string;
  userId: string;
  sessionId: string;
  query: string;
  context?: Record<string, any>;
  conversationHistory?: ConversationMessage[];
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  id: string;
  agentName: string;
  response: string;
  reasoning: string;
  executionTime: number;
  toolsUsed: string[];
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentMemory {
  userId: string;
  sessionId: string;
  shortTerm: ConversationMessage[];
  longTerm: Record<string, any>;
  preferences: Record<string, any>;
}

export interface PromptModule {
  name: string;
  content: string;
  version: string;
  dependencies: string[];
}

export interface ComposedPrompt {
  system: string;
  messages: ConversationMessage[];
  context: Record<string, any>;
}

export interface AgentRouterResult {
  agent: string;
  confidence: number;
  reasoning: string;
  parallelAgents?: string[];
}

export interface IntegratedContext {
  memory: AgentMemory;
  knowledgeGraph?: Record<string, any>;
  secondBrain?: Record<string, any>;
  deviceSync?: Record<string, any>;
}

export type Tool = (params: Record<string, any>) => Promise<any>;
