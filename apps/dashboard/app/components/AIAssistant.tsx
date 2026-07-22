'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const aiResponses = [
  'Your revenue grew 12% this month. Consider focusing on high-value customers.',
  'I detected 3 overdue invoices. Would you like me to send reminders?',
  'Your AI usage increased 22%. Consider batching requests for efficiency.',
  'Pipeline health is strong. 5 deals are ready for closing conversations.',
  'Customer satisfaction is up 8%. Great work on the support team!',
  'Recommended action: Schedule follow-ups with prospects in stage 2.',
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your WISE² AI Agent. I can help analyze metrics, suggest actions, and automate workflows.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-80 bg-[#0f0f1e] border-l border-[#2cd588] flex flex-col h-screen">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-[#2cd588] px-4 py-4">
        <h2 className="text-lg font-bold text-[#2cd588] flex items-center gap-2">
          <span>🤖</span> AI Agent
        </h2>
        <p className="text-xs text-gray-500 mt-1">Always learning your business</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
        <div ref={messagesEnd} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 space-y-2 border-t border-[#2cd588]/20">
        <p className="text-xs text-gray-500">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-300">
            📊 Analyze
          </button>
          <button className="text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-300">
            🤖 Suggest
          </button>
          <button className="text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-300">
            ⚡ Automate
          </button>
          <button className="text-xs bg-[#2cd588]/10 hover:bg-[#2cd588]/20 border border-[#2cd588]/30 rounded px-2 py-1 text-gray-300">
            📝 Summarize
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2cd588] bg-[#050505]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything..."
            className="flex-1 bg-[#0f0f1e] border border-[#2cd588] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2cd588]"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-[#2cd588] text-black px-3 py-2 rounded font-bold text-sm hover:bg-green-600 disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
