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
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = AI_MODELS[this.modelId];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const error: any = await response.json();
          lastError = new Error(`OpenAI API error: ${error.error?.message} (HTTP ${response.status})`);

          // Don't retry on 4xx errors (auth, not found, etc)
          if (response.status >= 400 && response.status < 500) {
            throw lastError;
          }

          // Retry on 5xx errors (server issues)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          throw lastError;
        }

        const data: any = await response.json();

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
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on timeouts or network errors on last attempt
        if (attempt === maxRetries - 1) {
          throw new Error(`ChatGPT chat error after ${maxRetries} attempts: ${lastError.message}`);
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('ChatGPT chat error: Unknown error');
  }

  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
  ): Promise<void> {
    let attempt = 0;
    const maxRetries = 2; // Fewer retries for streaming to avoid duplicate chunks

    while (attempt < maxRetries) {
      try {
        const model = AI_MODELS[this.modelId];
        onChunk({ type: 'start' });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout for streaming

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
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const statusError = `HTTP ${response.status}`;
          if (response.status >= 500 && attempt < maxRetries - 1) {
            attempt++;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          onChunk({ type: 'error', error: statusError });
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

        return;
      } catch (error) {
        if (attempt < maxRetries - 1) {
          attempt++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          onChunk({ type: 'error', error: `Stream error after ${maxRetries} attempts: ${String(error)}` });
        }
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          return true;
        }

        if (response.status >= 500 && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        return false;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return false;
  }
}
