/**
 * Google Gemini AI Provider
 */

import { BaseAIProvider, AIMessage, AIResponse, AIStreamEvent } from './base';
import { PROVIDER_KEYS, AI_MODELS } from '../config';

export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini';
  modelId: string;
  private apiKey: string;

  constructor(modelId: string = 'gemini-2.0-flash') {
    super();
    this.modelId = modelId;
    this.apiKey = PROVIDER_KEYS.gemini;

    if (!this.apiKey) {
      throw new Error('GOOGLE_API_KEY not configured');
    }
  }

  private convertMessages(messages: AIMessage[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const model = AI_MODELS[this.modelId];
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model?.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: this.convertMessages(messages),
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 64,
              maxOutputTokens: 2048,
            },
          }),
        },
      );

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message}`);
      }

      const data: any = await response.json();

      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model: model?.modelName || this.modelId,
        provider: 'gemini',
        timestamp: new Date(),
        tokensUsed: {
          input: data.usageMetadata?.promptTokenCount || 0,
          output: data.usageMetadata?.candidatesTokenCount || 0,
          total: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      throw new Error(`Gemini chat error: ${error}`);
    }
  }

  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
  ): Promise<void> {
    try {
      const model = AI_MODELS[this.modelId];
      onChunk({ type: 'start' });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model?.modelName}:streamGenerateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: this.convertMessages(messages),
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 64,
              maxOutputTokens: 2048,
            },
          }),
        },
      );

      if (!response.ok) {
        onChunk({ type: 'error', error: `HTTP ${response.status}` });
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onChunk({ type: 'error', error: 'No response body' });
        return;
      }

      let totalTokens = { input: 0, output: 0 };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              onChunk({
                type: 'chunk',
                content: data.candidates[0].content.parts[0].text,
              });
            }

            if (data.usageMetadata) {
              totalTokens = {
                input: data.usageMetadata.promptTokenCount || 0,
                output: data.usageMetadata.candidatesTokenCount || 0,
              };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      onChunk({
        type: 'done',
        usage: totalTokens,
      });
    } catch (error) {
      onChunk({ type: 'error', error: String(error) });
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: 'Hi' }],
              },
            ],
          }),
        },
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}
