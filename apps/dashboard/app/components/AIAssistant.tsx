'use client';

import { useEffect, useRef } from 'react';
import { useImpExpression } from '@/hooks/useImpExpression';
import { useHermesChat } from '@/hooks/useHermesChat';
import { ImpAvatar } from '@/components/ImpAvatar';

export function AIAssistant() {
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hermes chat state and API integration
  const {
    messages,
    isLoading,
    error,
    model,
    provider,
    sendMessage,
    clearMessages,
  } = useHermesChat();

  // Personal IMP expression state management
  const {
    state: impState,
    setExpression,
    handleEvent,
  } = useImpExpression('idle', 'blue');

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update avatar expression as chat progresses
  useEffect(() => {
    if (isLoading) {
      handleEvent({
        type: 'ai_thinking',
        timestamp: new Date(),
      });
    } else if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      handleEvent({
        type: 'ai_stream_end',
        timestamp: new Date(),
      });
    }
  }, [isLoading, messages, handleEvent]);

  const handleSendMessage = async () => {
    const message = inputRef.current?.value.trim();
    if (!message) return;

    // Update avatar to listening state
    handleEvent({
      type: 'voice_start',
      timestamp: new Date(),
    });

    // Clear input and send
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    try {
      await sendMessage(message);
    } catch (err) {
      handleEvent({
        type: 'tool_error',
        timestamp: new Date(),
      });
    }
  };

  const handleClear = () => {
    clearMessages();
    setExpression('idle');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const quickActions = [
    { icon: '📊', label: 'Analyze', mode: 'analysis' },
    { icon: '🤖', label: 'Suggest', mode: 'suggestions' },
    { icon: '⚡', label: 'Automate', mode: 'automation' },
    { icon: '📝', label: 'Summarize', mode: 'summary' },
  ];

  return (
    <div className="w-80 bg-[#0f0f1e] border-l border-[#2cd588] flex flex-col h-screen">
      {/* Header with Avatar */}
      <div className="bg-[#1a1a2e] border-b border-[#2cd588] px-4 py-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <ImpAvatar
            expression={impState.expression}
            colorVariant={impState.colorVariant}
            size="sm"
            animated
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#2cd588]">
              WISE² Personal IMP
            </h2>
            <p className="text-xs text-gray-500">Your AI. Your Partner. Yours.</p>
          </div>
        </div>

        {/* Model Info */}
        {model && provider && (
          <div className="text-xs text-gray-600 mt-2">
            <span className="text-gray-500">Model:</span> {model} ({provider})
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-2 text-xs bg-red-500/10 border border-red-500/30 rounded px-2 py-1 text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ImpAvatar
              expression={impState.expression}
              colorVariant={impState.colorVariant}
              size="lg"
              animated
              className="mb-4"
            />
            <p className="text-sm text-gray-400">
              Hey Boss 👋 What can I help you build, analyze, or automate today?
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2cd588]/20 text-[#2cd588] border border-[#2cd588]/50'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2cd588]/20 text-[#2cd588] border border-[#2cd588]/50 px-4 py-2 rounded-lg text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 space-y-2 border-t border-[#2cd588]/20">
        <p className="text-xs text-gray-500">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(`${action.label}: analyze my metrics`, action.mode)}
              disabled={isLoading}
              className="text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-300 disabled:opacity-50 transition-colors"
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2cd588] bg-[#050505] space-y-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 bg-[#0f0f1e] border border-[#2cd588] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2cd588] disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputRef.current?.value.trim()}
            className="bg-[#2cd588] text-black px-3 py-2 rounded font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            ↑
          </button>
        </div>

        {/* Clear history button */}
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="w-full text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-400 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>
    </div>
  );
}
