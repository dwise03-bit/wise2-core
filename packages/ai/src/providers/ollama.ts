/**
 * Ollama Local AI Provider
 * Runs open-source LLMs locally
 */

import { BaseAIProvider, AIMessage, AIResponse, AIStreamEvent } from './base';
import { PROVIDER_KEYS } from '../config';

export class OllamaProvider extends BaseAIProvider {
  name = 'Ollama';
  modelId: string;
  private baseUrl: string;

  constructor(modelId: string = 'llama2') {
    super();
    this.modelId = modelId;
    this.baseUrl = PROVIDER_KEYS.ollama;
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: any = await response.json();

      return {
        content: data.message?.content || '',
        model: this.modelId,
        provider: 'ollama',
        timestamp: new Date(),
        tokensUsed: {
          input: data.prompt_eval_count || 0,
          output: data.eval_count || 0,
          total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      throw new Error(`Ollama chat error: ${error}`);
    }
  }

  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
  ): Promise<void> {
    try {
      onChunk({ type: 'start' });

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        onChunk({ type: 'error', error: `HTTP ${response.status}` });
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onChunk({ type: 'error', error: 'No response body' });
        return;
      }

      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              onChunk({
                type: 'chunk',
                content: data.message.content,
              });
            }
            if (data.prompt_eval_count) totalInputTokens = data.prompt_eval_count;
            if (data.eval_count) totalOutputTokens += data.eval_count;
          } catch {
            // Skip invalid JSON lines
          }
        }
      }

      onChunk({
        type: 'done',
        usage: {
          input: totalInputTokens,
          output: totalOutputTokens,
        },
      });
    } catch (error) {
      onChunk({ type: 'error', error: String(error) });
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data: any = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // Stream the response to track progress
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch (error) {
      throw new Error(`Ollama pull error: ${error}`);
    }
  }
}
