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
  // Ollama (Local Models). Every entry below is installed on at least one
  // host - the Mac (100.64.72.14) or gpu-nmls. contextWindow values are read
  // from /api/show, not estimated. Verify before adding new entries:
  //   curl -s localhost:11434/api/show -d '{"model":"<tag>"}'
  'ollama-mistral': {
    id: 'ollama-mistral',
    name: 'Mistral (Local)',
    provider: 'ollama',
    description: 'Mistral 7B - general purpose, gpu-nmls',
    contextWindow: 32768,
    isLocal: true,
    modelName: 'mistral',
  },
  'ollama-qwen3-coder': {
    id: 'ollama-qwen3-coder',
    name: 'Qwen 3 Coder 30B (Local)',
    provider: 'ollama',
    description: 'Strongest local coder - gpu-nmls only, too large for the Mac',
    contextWindow: 262144,
    isLocal: true,
    modelName: 'qwen3-coder:30b',
  },
  'ollama-devstral': {
    id: 'ollama-devstral',
    name: 'Devstral 24B (Local)',
    provider: 'ollama',
    description: 'Agentic coding model - gpu-nmls only',
    contextWindow: 131072,
    isLocal: true,
    modelName: 'devstral:24b',
  },
  'ollama-qwen-coder': {
    id: 'ollama-qwen-coder',
    name: 'Qwen 2.5 Coder 7B (Local)',
    provider: 'ollama',
    description: 'Primary local coding model - Mac dev default',
    contextWindow: 32768,
    isLocal: true,
    modelName: 'qwen2.5-coder:7b',
  },
  'ollama-qwen-coder-fast': {
    id: 'ollama-qwen-coder-fast',
    name: 'Qwen 2.5 Coder 1.5B (Local)',
    provider: 'ollama',
    description: 'Small/fast local coder - completions, quick edits',
    contextWindow: 32768,
    isLocal: true,
    modelName: 'qwen2.5-coder:1.5b',
  },
  // MLX builds - Apple Silicon only. Context windows read from /api/show.
  'ollama-qwen35-mlx': {
    id: 'ollama-qwen35-mlx',
    name: 'Qwen 3.5 4B MLX (Local)',
    provider: 'ollama',
    description: 'MLX-accelerated general model - long context, Mac only',
    contextWindow: 262144,
    isLocal: true,
    modelName: 'qwen3.5:4b-mlx',
  },
  'ollama-gemma4-mlx': {
    id: 'ollama-gemma4-mlx',
    name: 'Gemma 4 12B MLX (Local)',
    provider: 'ollama',
    description: 'MLX-accelerated 12B - highest local quality, Mac only',
    contextWindow: 262144,
    isLocal: true,
    modelName: 'gemma4:12b-mlx',
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

// Ollama tags actually installed across our hosts (verified 2026-08-01).
// Availability still varies per machine - call isModelAvailable() at runtime.
export const OLLAMA_MODELS = [
  // Mac (Apple Silicon)
  'qwen2.5-coder:7b',
  'qwen2.5-coder:1.5b',
  'qwen3.5:4b-mlx',
  'gemma4:12b-mlx',
  // gpu-nmls
  'qwen3-coder:30b',
  'devstral:24b',
  'mistral',
];
