/**
 * Base AI Provider Interface
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  provider: string;
  timestamp: Date;
}

export interface AIStreamEvent {
  type: 'start' | 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
  usage?: {
    input: number;
    output: number;
  };
}

export abstract class BaseAIProvider {
  abstract name: string;
  abstract modelId: string;

  abstract chat(messages: AIMessage[], options?: any): Promise<AIResponse>;
  abstract stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
    options?: any,
  ): Promise<void>;
  abstract checkHealth(): Promise<boolean>;
}
