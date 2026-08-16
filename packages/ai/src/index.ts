// Providers
export { BaseAIProvider } from './providers/base';
export { OllamaProvider } from './providers/ollama';
export { ClaudeProvider } from './providers/claude';
export { ChatGPTProvider } from './providers/chatgpt';
export { GeminiProvider } from './providers/gemini';

// Types
export type { AIMessage, AIResponse, AIStreamEvent } from './providers/base';

// Configuration
export { AI_MODELS, PROVIDER_KEYS, OLLAMA_MODELS } from './config';
export type { AIModel, AIProvider } from './config';

// Manager
export { aiManager, AIManager } from './manager';

// Hooks
export { useAIChat, useProviderHealth, useAvailableModels, useModelManager } from './hooks';

// Components
export { AIChat } from './components/AIChat';
