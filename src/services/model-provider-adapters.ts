/**
 * Model Provider Adapters
 * Unified interface for calling different AI providers
 */

import axios from 'axios';

export interface ModelRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ModelResponse {
  text: string;
  tokens: number;
  stopReason: string;
}

/**
 * Anthropic Claude Adapter
 */
export class AnthropicAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-opus-5') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
          messages: [{ role: 'user', content: request.prompt }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      const content = response.data.content[0];
      const stopReason = response.data.stop_reason;

      return {
        text: content.text,
        tokens: response.data.usage.output_tokens,
        stopReason,
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }
}

/**
 * OpenAI GPT Adapter
 */
export class OpenAIAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 1,
          messages: [{ role: 'user', content: request.prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const message = response.data.choices[0].message;
      const stopReason = response.data.choices[0].finish_reason;

      return {
        text: message.content,
        tokens: response.data.usage.completion_tokens,
        stopReason,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

/**
 * Google Gemini Adapter
 */
export class GeminiAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-pro') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          contents: [
            {
              parts: [{ text: request.prompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: request.maxTokens || 2048,
            temperature: request.temperature || 0.7,
            topP: request.topP || 1,
          },
        },
        {
          params: {
            key: this.apiKey,
          },
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      const stopReason = response.data.candidates[0].finishReason;

      return {
        text: content,
        tokens: Math.ceil(content.length / 4), // Estimate
        stopReason,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}

/**
 * OpenRouter Adapter (for free models: DeepSeek, Qwen, Mistral, etc.)
 */
export class OpenRouterAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek/deepseek-chat') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.model,
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 1,
          messages: [{ role: 'user', content: request.prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://wise2.net',
            'X-Title': 'WISE²',
          },
        }
      );

      const message = response.data.choices[0].message;
      const stopReason = response.data.choices[0].finish_reason;

      return {
        text: message.content,
        tokens: response.data.usage.completion_tokens,
        stopReason,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }
}

/**
 * GitHub Models Adapter (free Llama models)
 */
export class GitHubModelsAdapter {
  private token: string;
  private model: string;

  constructor(token: string, model: string = 'gpt-4o-mini') {
    this.token = token;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        `https://models.inference.ai.azure.com/chat/completions`,
        {
          model: this.model,
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
          messages: [{ role: 'user', content: request.prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      const message = response.data.choices[0].message;
      const stopReason = response.data.choices[0].finish_reason;

      return {
        text: message.content,
        tokens: response.data.usage.completion_tokens,
        stopReason,
      };
    } catch (error) {
      console.error('GitHub Models API error:', error);
      throw error;
    }
  }
}

/**
 * NVIDIA API Adapter (Nemotron and others)
 */
export class NVIDIAAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'meta/nemotron-4-340b-instruct') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async call(request: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          model: this.model,
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
          messages: [{ role: 'user', content: request.prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const message = response.data.choices[0].message;
      const stopReason = response.data.choices[0].finish_reason;

      return {
        text: message.content,
        tokens: response.data.usage.completion_tokens,
        stopReason,
      };
    } catch (error) {
      console.error('NVIDIA API error:', error);
      throw error;
    }
  }
}

/**
 * Provider factory
 */
export class ProviderFactory {
  static createAdapter(provider: string, model: string, apiKey: string) {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return new AnthropicAdapter(apiKey, model);
      case 'openai':
        return new OpenAIAdapter(apiKey, model);
      case 'google':
        return new GeminiAdapter(apiKey, model);
      case 'openrouter':
        return new OpenRouterAdapter(apiKey, model);
      case 'github':
        return new GitHubModelsAdapter(apiKey, model);
      case 'nvidia':
        return new NVIDIAAdapter(apiKey, model);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
