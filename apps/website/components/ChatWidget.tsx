'use client';

import { useState, useRef, useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    analytics.track('form_submit', { form: 'chat', message: input });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId: conversationId.current,
          userEmail,
          messageHistory: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.escalated) {
        analytics.track('form_submit', { form: 'chat_escalated', email: userEmail });
        setTimeout(() => {
          const escalationMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role: 'assistant',
            content: '✅ Your message has been sent to our team on Discord. We\'ll get back to you shortly!',
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, escalationMsg]);
        }, 1000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: '❌ Sorry, something went wrong. Please try again or contact us on Discord.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            analytics.track('button_click', { button: 'chat_open' });
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-wise-primary hover:bg-wise-primary-hover text-white rounded-full shadow-lg shadow-wise-primary/50 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-wise border border-wise-subtle rounded-lg shadow-2xl flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-wise-primary text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg">WISE² Support</h3>
            <p className="text-sm text-white/80">Powered by Hermes AI</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-wise">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-wise-muted text-sm">👋 Hi! How can we help?</p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-wise-primary text-white'
                      : 'bg-wise-surface text-wise-primary border border-wise-subtle'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-wise-surface text-wise-primary border border-wise-subtle px-3 py-2 rounded-lg">
                  <p className="text-sm">🤖 Hermes is thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Email Form (First Message) */}
          {showEmailForm && messages.length === 0 && (
            <div className="p-4 border-t border-wise-subtle">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (userEmail.trim()) {
                    setShowEmailForm(false);
                  }
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="w-full px-3 py-2 bg-wise-surface border border-wise-subtle rounded text-wise-primary placeholder-wise-muted text-sm focus:outline-none focus:border-wise-primary"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded text-sm font-semibold transition-colors"
                >
                  Start Chat
                </button>
              </form>
            </div>
          )}

          {/* Input Form */}
          {!showEmailForm && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-wise-subtle">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-wise-surface border border-wise-subtle rounded text-wise-primary placeholder-wise-muted text-sm focus:outline-none focus:border-wise-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
