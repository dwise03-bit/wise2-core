/**
 * ChatGPT / OpenAI Provider
 */

import { BaseAIProvider, AIMessage, AIResponse, AIStreamEvent } from './base';
import { PROVIDER_KEYS, AI_MODELS } from '../config';

export class ChatGPTProvider extends BaseAIProvider {
  name = 'ChatGPT';
  modelId: string;
  private apiKey: string;

  constructor(modelId: string = 'gpt-4o') {
    super();
    this.modelId = modelId;
    this.apiKey = PROVIDER_KEYS.chatgpt;

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const model = AI_MODELS[this.modelId];
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model?.modelName || this.modelId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message}`);
      }

      const data = await response.json();

      return {
        content: data.choices?.[0]?.message?.content || '',
        model: model?.modelName || this.modelId,
        provider: 'chatgpt',
        timestamp: new Date(),
        tokensUsed: {
          input: data.usage?.prompt_tokens || 0,
          output: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      throw new Error(`ChatGPT chat error: ${error}`);
    }
  }

  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
  ): Promise<void> {
    try {
      const model = AI_MODELS[this.modelId];
      onChunk({ type: 'start' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model?.modelName || this.modelId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data:'));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.choices?.[0]?.delta?.content) {
              onChunk({
                type: 'chunk',
                content: data.choices[0].delta.content,
              });
            }

            if (data.usage) {
              onChunk({
                type: 'done',
                usage: {
                  input: data.usage.prompt_tokens || 0,
                  output: data.usage.completion_tokens || 0,
                },
              });
            }
          } catch {
            // Skip invalid JSON or [DONE] marker
          }
        }
      }
    } catch (error) {
      onChunk({ type: 'error', error: String(error) });
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
