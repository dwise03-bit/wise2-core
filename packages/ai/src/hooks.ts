'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIMessage, AIResponse, AIStreamEvent } from './providers/base';
import { aiManager } from './manager';
import { AI_MODELS, AIProvider } from './config';

export interface UseAIChatOptions {
  initialMessages?: AIMessage[];
  modelId?: string;
  systemPrompt?: string;
  onStreamChunk?: (chunk: string) => void;
  onStreamComplete?: (response: AIResponse) => void;
}

/**
 * Hook for AI chat functionality
 */
export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>(options.initialMessages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(options.modelId || 'claude-opus');
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string, useStream: boolean = true) => {
      try {
        setError(null);
        setStreamingContent('');
        setLoading(true);

        const systemMessages: AIMessage[] = options.systemPrompt
          ? [{ role: 'system', content: options.systemPrompt }]
          : [];

        const allMessages: AIMessage[] = [
          ...systemMessages,
          ...messages,
          { role: 'user', content: userMessage },
        ];

        if (useStream) {
          await aiManager.stream(
            allMessages,
            (event: AIStreamEvent) => {
              if (event.type === 'chunk' && event.content) {
                setStreamingContent((prev) => prev + event.content);
                options.onStreamChunk?.(event.content);
              } else if (event.type === 'done') {
                const assistantMessage: AIMessage = {
                  role: 'assistant',
                  content: streamingContent,
                };
                setMessages((prev) => [...prev, { role: 'user', content: userMessage }, assistantMessage]);
                options.onStreamComplete?.({
                  content: streamingContent,
                  model: selectedModel,
                  provider: AI_MODELS[selectedModel]?.provider || 'claude',
                  timestamp: new Date(),
                  tokensUsed: {
                    input: event.usage?.input || 0,
                    output: event.usage?.output || 0,
                    total: (event.usage?.input || 0) + (event.usage?.output || 0),
                  },
                });
              } else if (event.type === 'error') {
                setError(event.error || 'Stream error');
              }
            },
            selectedModel,
          );
        } else {
          const response = await aiManager.chat(allMessages, selectedModel);
          setMessages((prev) => [
            ...prev,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: response.content },
          ]);
          options.onStreamComplete?.(response);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setStreamingContent('');
      }
    },
    [messages, options, selectedModel, streamingContent],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  const changeModel = useCallback((modelId: string) => {
    if (AI_MODELS[modelId]) {
      setSelectedModel(modelId);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    selectedModel,
    streamingContent,
    sendMessage,
    clearMessages,
    changeModel,
    setMessages,
  };
}

/**
 * Hook to check provider health
 */
export function useProviderHealth() {
  const [health, setHealth] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiManager.checkHealth();
      setHealth(result);
    } catch (error) {
      console.error('Failed to check provider health:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { health, loading, checkHealth };
}

/**
 * Hook to get available models
 */
export function useAvailableModels() {
  const models = aiManager.getAvailableModels();

  const getModelsByProvider = useCallback(
    (provider: AIProvider) => {
      return aiManager.getModelsByProvider(provider);
    },
    [],
  );

  return { models, getModelsByProvider };
}

/**
 * Hook for model management
 */
export function useModelManager() {
  const [defaultModel, setDefaultModel] = useState(aiManager.getDefaultModel());

  const changeDefaultModel = useCallback((modelId: string) => {
    aiManager.setDefaultModel(modelId);
    setDefaultModel(modelId);
  }, []);

  return {
    defaultModel,
    changeDefaultModel,
    getDefaultModel: () => aiManager.getDefaultModel(),
  };
}
