/**
 * AI Provider Configuration
 * Supports: Ollama (local), Claude, ChatGPT, Gemini
 */

export type AIProvider = 'ollama' | 'claude' | 'chatgpt' | 'gemini';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow: number;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  isLocal?: boolean;
  modelName?: string; // For Ollama, Claude API model name
}

export const AI_MODELS: Record<string, AIModel> = {
  // Ollama (Local Models)
  'ollama-llama2': {
    id: 'ollama-llama2',
    name: 'Llama 2 (Local)',
    provider: 'ollama',
    description: 'Meta Llama 2 7B - Fast local inference',
    contextWindow: 4096,
    isLocal: true,
    modelName: 'llama2',
  },
  'ollama-mistral': {
    id: 'ollama-mistral',
    name: 'Mistral (Local)',
    provider: 'ollama',
    description: 'Mistral 7B - High quality local model',
    contextWindow: 8192,
    isLocal: true,
    modelName: 'mistral',
  },
  'ollama-neural': {
    id: 'ollama-neural',
    name: 'Neural Chat (Local)',
    provider: 'ollama',
    description: 'Neural Chat 7B - Optimized for conversations',
    contextWindow: 8192,
    isLocal: true,
    modelName: 'neural-chat',
  },
  'ollama-codellama': {
    id: 'ollama-codellama',
    name: 'Code Llama (Local)',
    provider: 'ollama',
    description: 'Code Llama 7B - Optimized for code generation',
    contextWindow: 4096,
    isLocal: true,
    modelName: 'codellama',
  },

  // Claude (Anthropic)
  'claude-opus': {
    id: 'claude-opus',
    name: 'Claude Opus',
    provider: 'claude',
    description: 'Most capable Claude model for complex tasks',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    modelName: 'claude-opus-4.1-20250805',
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'claude',
    description: 'Fast and efficient Claude model',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    modelName: 'claude-sonnet-4-20250514',
  },
  'claude-haiku': {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    provider: 'claude',
    description: 'Smallest and fastest Claude model',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.0008, output: 0.0024 },
    modelName: 'claude-haiku-3-5-20241022',
  },

  // ChatGPT (OpenAI)
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'chatgpt',
    description: 'Most capable GPT-4 model',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    modelName: 'gpt-4-turbo',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'chatgpt',
    description: 'Latest GPT-4 optimized model',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.005, output: 0.015 },
    modelName: 'gpt-4o',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'chatgpt',
    description: 'Fast and efficient OpenAI model',
    contextWindow: 16385,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    modelName: 'gpt-3.5-turbo',
  },

  // Gemini (Google)
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Latest fast Gemini model',
    contextWindow: 1000000,
    costPer1kTokens: { input: 0.0001, output: 0.0004 },
    modelName: 'gemini-2.0-flash',
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Most capable Gemini model',
    contextWindow: 2000000,
    costPer1kTokens: { input: 0.00125, output: 0.005 },
    modelName: 'gemini-1.5-pro',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Fast Gemini model',
    contextWindow: 1000000,
    costPer1kTokens: { input: 0.000075, output: 0.0003 },
    modelName: 'gemini-1.5-flash',
  },
};

// Provider API Keys (from environment)
export const PROVIDER_KEYS = {
  claude: process.env.ANTHROPIC_API_KEY || '',
  chatgpt: process.env.OPENAI_API_KEY || '',
  gemini: process.env.GOOGLE_API_KEY || '',
  ollama: process.env.OLLAMA_API_URL || 'http://localhost:11434',
};

// Ollama available models (check at runtime)
export const OLLAMA_MODELS = [
  'llama2',
  'mistral',
  'neural-chat',
  'codellama',
  'falcon',
  'dolphin-mixtral',
  'openchat',
];
