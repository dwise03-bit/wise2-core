'use client';

import { useState, useEffect } from 'react';

interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'idle';
  color: string;
  icon: string;
  features: string[];
  endpoint: string;
}

const BOTS: Bot[] = [
  {
    id: 'discord-oauth',
    name: 'Discord OAuth',
    description: 'Authenticate users via Discord',
    status: 'online',
    color: '#5865F2',
    icon: '🔐',
    features: ['User login', 'Profile sync', 'Server integration'],
    endpoint: '/api/bots/discord-oauth',
  },
  {
    id: 'graphics',
    name: 'Graphics API',
    description: 'Generate and edit graphics with AI',
    status: 'online',
    color: '#39FF14',
    icon: '🎨',
    features: ['Image generation', 'Style control', 'Batch processing'],
    endpoint: '/api/bots/graphics',
  },
  {
    id: 'analytics',
    name: 'Analytics Bot',
    description: 'Track user behavior and engagement',
    status: 'online',
    color: '#00D9FF',
    icon: '📊',
    features: ['Event tracking', 'Real-time metrics', 'User insights'],
    endpoint: '/api/bots/analytics',
  },
  {
    id: 'hermes',
    name: 'Hermes Support',
    description: 'AI-powered customer service',
    status: 'online',
    color: '#e0a83c',
    icon: '💬',
    features: ['Chat support', 'FAQ knowledge', 'Issue resolution'],
    endpoint: '/api/bots/hermes',
  },
];

export default function BotsPage() {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [botStatuses, setBotStatuses] = useState<Record<string, 'online' | 'offline' | 'idle'>>({});
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');

  useEffect(() => {
    // Check bot statuses
    BOTS.forEach(bot => {
      setBotStatuses(prev => ({ ...prev, [bot.id]: 'online' }));
    });
  }, []);

  const handleTestBot = async (bot: Bot) => {
    if (!testMessage && bot.id !== 'discord-oauth') {
      alert('Enter a message to test');
      return;
    }

    try {
      let response;
      if (bot.id === 'hermes') {
        response = await fetch(bot.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: testMessage,
            userId: 'test_user',
          }),
        });
      } else if (bot.id === 'graphics') {
        response = await fetch(bot.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: testMessage,
            style: 'professional',
          }),
        });
      } else if (bot.id === 'analytics') {
        response = await fetch(bot.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: testMessage,
            userId: 'test_user',
          }),
        });
      }

      const data = await response?.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050505] to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-[#39FF14] via-white to-[#00D9FF] bg-clip-text text-transparent">
            WISE² Bot Suite
          </h1>
          <p className="text-xl text-[#aaa]">
            Integrated AI agents powering Discord, Graphics, Analytics, and Customer Support
          </p>
        </div>

        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {BOTS.map(bot => (
            <div
              key={bot.id}
              onClick={() => setSelectedBot(bot)}
              className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6 cursor-pointer hover:border-opacity-100 transition hover:shadow-lg hover:shadow-[#39FF14]/20"
              style={{
                borderColor: botStatuses[bot.id] === 'online' ? bot.color + '40' : '#333',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{bot.icon}</div>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor: botStatuses[bot.id] === 'online' ? bot.color : '#666',
                  }}
                ></div>
              </div>

              <h3 className="text-xl font-black mb-2" style={{ color: bot.color }}>
                {bot.name}
              </h3>
              <p className="text-[#999] text-sm mb-4">{bot.description}</p>

              <div className="space-y-2 mb-4">
                {bot.features.map((feature, i) => (
                  <div key={i} className="text-xs text-[#666] flex items-center gap-2">
                    <span style={{ color: bot.color }}>✓</span> {feature}
                  </div>
                ))}
              </div>

              <div className="text-xs font-mono text-[#555] break-all">{bot.endpoint}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        {selectedBot && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black mb-2" style={{ color: selectedBot.color }}>
                  {selectedBot.icon} {selectedBot.name}
                </h2>
                <p className="text-[#999]">{selectedBot.description}</p>
              </div>
              <button
                onClick={() => setSelectedBot(null)}
                className="text-[#666] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Test Interface */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#39FF14]">Test Bot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#39FF14] mb-2">Message</label>
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message..."
                      className="w-full bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg px-4 py-3 text-white focus:border-[#39FF14] outline-none transition"
                    />
                  </div>
                  <button
                    onClick={() => handleTestBot(selectedBot)}
                    className="w-full py-3 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black font-bold rounded-lg hover:shadow-lg transition"
                  >
                    Test {selectedBot.name}
                  </button>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#39FF14]">Response</h3>
                <div className="bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg p-4 min-h-[200px] overflow-auto">
                  {testResponse ? (
                    <pre className="text-xs text-[#39FF14] font-mono whitespace-pre-wrap break-words">
                      {testResponse}
                    </pre>
                  ) : (
                    <p className="text-[#666] text-sm">Response will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div className="mt-8 pt-8 border-t border-[#333]">
              <h3 className="text-lg font-bold mb-4 text-[#39FF14]">API Documentation</h3>
              <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                <div className="font-mono text-sm text-[#666] space-y-2">
                  <div>
                    <span className="text-[#00D9FF]">POST</span> {selectedBot.endpoint}
                  </div>
                  <div className="text-[#39FF14]">Request body example:</div>
                  <pre className="text-xs text-[#999] overflow-auto">
                    {JSON.stringify(
                      selectedBot.id === 'hermes'
                        ? { message: 'How much does pricing cost?', userId: 'user123' }
                        : selectedBot.id === 'graphics'
                          ? { prompt: 'Create a logo', style: 'professional' }
                          : { event: 'user_signup', userId: 'user123' },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
