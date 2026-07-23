'use client';

import React, { useState } from 'react';

export function AICommandPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ready to assist. What would you like to automate?', timestamp: new Date() },
  ]);

  const quickActions = [
    { label: 'Deploy', icon: '🚀' },
    { label: 'Analyze', icon: '📊' },
    { label: 'Generate', icon: '✨' },
    { label: 'Automate', icon: '⚙️' },
  ];

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-white mb-4">AI COMMAND CENTER</h3>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-[#050505] rounded p-3">
        {messages.map((msg, i) => (
          <div key={i} className="text-xs">
            <p className="text-gray-500 mb-1">
              {msg.role === 'assistant' ? '🤖' : '👤'} {msg.role}
            </p>
            <p className="text-gray-300">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {quickActions.map((action, i) => (
          <button
            key={i}
            className="bg-[#050505] border border-[#161616] rounded p-2 text-xs hover:border-emerald-500/30 transition"
          >
            <span className="mr-1">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-[#050505] border border-[#161616] rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-emerald-500/30 outline-none"
        />
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded font-semibold text-xs transition">
          Send
        </button>
      </div>
    </div>
  );
}
