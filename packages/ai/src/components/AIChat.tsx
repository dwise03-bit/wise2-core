'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAIChat, useAvailableModels, useProviderHealth } from '../hooks';
import { AIMessage } from '../providers/base';

interface AIChatProps {
  initialModel?: string;
  systemPrompt?: string;
  className?: string;
  showModelSelector?: boolean;
  showHealth?: boolean;
}

/**
 * AI Chat Component
 * Unified interface for chatting with multiple AI models
 */
export function AIChat({
  initialModel,
  systemPrompt,
  className = '',
  showModelSelector = true,
  showHealth = true,
}: AIChatProps) {
  const { messages, loading, error, selectedModel, streamingContent, sendMessage, clearMessages, changeModel } =
    useAIChat({
      modelId: initialModel,
      systemPrompt,
    });

  const { models } = useAvailableModels();
  const { health } = useProviderHealth();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const message = input;
    setInput('');
    await sendMessage(message, true);
  };

  const isModelHealthy = health ? health[selectedModel] : true;

  return (
    <div className={`flex flex-col h-full bg-wise-bg text-wise-text-primary ${className}`}>
      {/* Header */}
      <div className="border-b border-wise-medium p-4 space-y-3">
        {showHealth && (
          <div className="text-xs text-wise-text-muted">
            {isModelHealthy ? '✅ Connected' : '❌ Model unavailable'}
          </div>
        )}

        {showModelSelector && (
          <select
            value={selectedModel}
            onChange={(e) => changeModel(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-wise-surface border border-wise-medium rounded text-wise-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-wise-primary"
          >
            {Object.entries(models).map(([id, model]) => (
              <option key={id} value={id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && streamingContent === '' && (
          <div className="h-full flex items-center justify-center text-center text-wise-text-muted">
            <div>
              <p className="text-lg font-semibold mb-2">Start a conversation</p>
              <p className="text-sm">Choose a model and send your first message</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-wise-primary text-wise-bg'
                  : 'bg-wise-surface border border-wise-medium text-wise-text-primary'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-wise-surface border border-wise-medium text-wise-text-primary">
              <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
              <span className="inline-block w-2 h-4 bg-wise-primary ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {loading && !streamingContent && (
          <div className="flex justify-center">
            <div className="text-wise-text-muted text-sm">Thinking...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-wise-accent-red/20 border border-wise-accent-red text-wise-accent-red px-4 py-2 rounded text-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-wise-medium p-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading || !isModelHealthy}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-wise-surface border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-wise-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || !isModelHealthy}
            className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise-bg rounded font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            disabled={loading}
            className="w-full px-3 py-1 text-xs text-wise-text-muted hover:text-wise-text-primary transition"
          >
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}
