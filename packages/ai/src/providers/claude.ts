/**
 * Claude AI Provider (Anthropic)
 */

import { BaseAIProvider, AIMessage, AIResponse, AIStreamEvent } from './base';
import { PROVIDER_KEYS, AI_MODELS } from '../config';

export class ClaudeProvider extends BaseAIProvider {
  name = 'Claude';
  modelId: string;
  private apiKey: string;

  constructor(modelId: string = 'claude-opus') {
    super();
    this.modelId = modelId;
    this.apiKey = PROVIDER_KEYS.claude;

    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const model = AI_MODELS[this.modelId];
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model?.modelName || this.modelId,
          max_tokens: 2048,
          messages: messages.map((m) => ({
            role: m.role === 'system' ? 'user' : m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message}`);
      }

      const data = await response.json();

      return {
        content: data.content?.[0]?.text || '',
        model: model?.modelName || this.modelId,
        provider: 'claude',
        timestamp: new Date(),
        tokensUsed: {
          input: data.usage?.input_tokens || 0,
          output: data.usage?.output_tokens || 0,
          total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      throw new Error(`Claude chat error: ${error}`);
    }
  }

  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
  ): Promise<void> {
    try {
      const model = AI_MODELS[this.modelId];
      onChunk({ type: 'start' });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model?.modelName || this.modelId,
          max_tokens: 2048,
          stream: true,
          messages: messages.map((m) => ({
            role: m.role === 'system' ? 'user' : m.role,
            content: m.content,
          })),
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

      let inputTokens = 0;
      let outputTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data:'));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'content_block_delta' && data.delta?.text) {
              onChunk({
                type: 'chunk',
                content: data.delta.text,
              });
            }

            if (data.type === 'message_delta' && data.usage) {
              outputTokens = data.usage.output_tokens;
            }

            if (data.type === 'message_start' && data.message?.usage) {
              inputTokens = data.message.usage.input_tokens;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }

      onChunk({
        type: 'done',
        usage: {
          input: inputTokens,
          output: outputTokens,
        },
      });
    } catch (error) {
      onChunk({ type: 'error', error: String(error) });
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4.1-20250805',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
