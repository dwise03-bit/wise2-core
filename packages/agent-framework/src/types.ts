/**
 * Agent Framework Type Definitions
 */

export interface AgentConfig {
  id: string;
  name: string;
  promptPath: string;
  tools: string[];
  maxRetries?: number;
  timeout?: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AgentResponse {
  content: string;
  tokens?: number;
  duration?: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
  result?: ToolResult;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

export interface AgentState {
  currentTask?: string;
  memory?: Record<string, unknown>;
  toolHistory?: ToolCall[];
  decisions?: Record<string, unknown>;
}

