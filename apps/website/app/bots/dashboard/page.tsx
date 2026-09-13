'use client';

import { useState, useEffect } from 'react';

interface BotStatus {
  id: string;
  name: string;
  service: string;
  status: 'online' | 'offline' | 'checking';
  color: string;
  icon: string;
  endpoint: string;
  port?: number;
  lastCheck?: string;
  responseTime?: number;
  uptime?: number;
}

const BOTS: BotStatus[] = [
  {
    id: 'discord-bot',
    name: 'Discord Bot',
    service: 'Primary Discord Service',
    status: 'checking',
    color: '#5865F2',
    icon: '🤖',
    endpoint: 'http://127.0.0.1:3004',
    port: 3004,
  },
  {
    id: 'hermes',
    name: 'Hermes AI',
    service: 'Consulting & Image Generation',
    status: 'checking',
    color: '#e0a83c',
    icon: '🧠',
    endpoint: 'http://127.0.0.1:3012',
    port: 3012,
  },
  {
    id: 'brain-api',
    name: 'Brain API',
    service: 'RAG & Intelligence Layer',
    status: 'checking',
    color: '#00D9FF',
    icon: '🧠',
    endpoint: 'http://127.0.0.1:3011',
    port: 3011,
  },
  {
    id: 'main-api',
    name: 'Main API',
    service: 'Core Backend API',
    status: 'checking',
    color: '#0094FF',
    icon: '⚙️',
    endpoint: 'http://127.0.0.1:3000',
    port: 3000,
  },
  {
    id: 'edge-health',
    name: 'Edge Health',
    service: 'Raspberry Pi Health Monitoring',
    status: 'checking',
    color: '#00FF88',
    icon: '🥧',
    endpoint: 'http://127.0.0.1:4900',
    port: 4900,
  },
  {
    id: 'edge-voice',
    name: 'Edge Voice',
    service: 'Raspberry Pi Voice API',
    status: 'checking',
    color: '#FF6B9D',
    icon: '🎤',
    endpoint: 'http://127.0.0.1:4901',
    port: 4901,
  },
  {
    id: 'edge-support',
    name: 'Edge Support',
    service: 'Raspberry Pi Support Service',
    status: 'checking',
    color: '#FFD700',
    icon: '🆘',
    endpoint: 'http://127.0.0.1:4902',
    port: 4902,
  },
  {
    id: 'model-health',
    name: 'Model Orchestrator',
    service: 'Multi-Model Health Monitoring',
    status: 'checking',
    color: '#FF6B6B',
    icon: '🤖',
    endpoint: 'http://127.0.0.1:3000/api/v1/models/health',
    port: 3000,
  },
];

export default function BotsDashboard() {
  const [bots, setBots] = useState<BotStatus[]>(BOTS);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkBotHealth = async (bot: BotStatus) => {
    const startTime = Date.now();
    try {
      const response = await fetch(
        `${bot.endpoint}${bot.id === 'model-health' ? '' : '/health'}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        }
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          ...bot,
          status: 'online' as const,
          responseTime,
          lastCheck: new Date().toLocaleTimeString(),
        };
      } else {
        return {
          ...bot,
          status: 'offline' as const,
          responseTime,
          lastCheck: new Date().toLocaleTimeString(),
        };
      }
    } catch (error) {
      return {
        ...bot,
        status: 'offline' as const,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toLocaleTimeString(),
      };
    }
  };

  const refreshAllBots = async () => {
    const updated = await Promise.all(bots.map(checkBotHealth));
    setBots(updated);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshAllBots();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshAllBots, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const onlineBots = bots.filter(b => b.status === 'online').length;
  const totalBots = bots.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050505] to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-[#0094FF] via-white to-[#00D9FF] bg-clip-text text-transparent">
                Bot Dashboard
              </h1>
              <p className="text-lg text-[#aaa]">
                Real-time monitoring of all WISE² services
              </p>
            </div>
            <button
              onClick={refreshAllBots}
              className="px-6 py-3 bg-gradient-to-r from-[#0094FF] to-[#00D9FF] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#0094FF]/50 transition"
            >
              🔄 Refresh Now
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6">
              <div className="text-[#0094FF] text-sm font-bold mb-2">ONLINE</div>
              <div className="text-4xl font-black text-[#00FF88]">{onlineBots}</div>
              <div className="text-xs text-[#666] mt-2">of {totalBots} services</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6">
              <div className="text-[#0094FF] text-sm font-bold mb-2">HEALTH</div>
              <div className="text-4xl font-black text-[#0094FF]">
                {Math.round((onlineBots / totalBots) * 100)}%
              </div>
              <div className="text-xs text-[#666] mt-2">System health</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6">
              <div className="text-[#0094FF] text-sm font-bold mb-2">LAST UPDATE</div>
              <div className="text-sm font-mono text-[#00D9FF]">{lastUpdate || '—'}</div>
              <div className="text-xs text-[#666] mt-2">Auto-refresh: {autoRefresh ? '✓ ON' : '✗ OFF'}</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6">
              <div className="text-[#0094FF] text-sm font-bold mb-2">AUTO-REFRESH</div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 text-sm font-bold rounded transition ${
                  autoRefresh
                    ? 'bg-[#00FF88] text-black'
                    : 'bg-[#333] text-[#999]'
                }`}
              >
                {autoRefresh ? 'ENABLED' : 'DISABLED'}
              </button>
              <div className="text-xs text-[#666] mt-2">Updates every 10s</div>
            </div>
          </div>
        </div>

        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div
              key={bot.id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-6 hover:border-opacity-100 transition hover:shadow-lg"
              style={{
                borderColor:
                  bot.status === 'online'
                    ? bot.color + '60'
                    : bot.status === 'checking'
                      ? '#666'
                      : '#FF4444',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{bot.icon}</div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: bot.color }}>
                      {bot.name}
                    </h3>
                    <p className="text-xs text-[#666]">{bot.service}</p>
                  </div>
                </div>
                {/* Status Indicator */}
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      bot.status === 'online'
                        ? 'animate-pulse'
                        : 'animate-bounce'
                    }`}
                    style={{
                      backgroundColor:
                        bot.status === 'online'
                          ? bot.color
                          : bot.status === 'checking'
                            ? '#666'
                            : '#FF4444',
                    }}
                  ></div>
                  <div
                    className="text-xs font-bold"
                    style={{
                      color:
                        bot.status === 'online'
                          ? '#00FF88'
                          : bot.status === 'checking'
                            ? '#999'
                            : '#FF4444',
                    }}
                  >
                    {bot.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Port & Endpoint */}
              <div className="mb-4 pb-4 border-b border-[#333]">
                <div className="text-xs font-mono text-[#666] mb-1">Port: {bot.port || '—'}</div>
                <div className="text-xs font-mono text-[#555] truncate" title={bot.endpoint}>
                  {bot.endpoint}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[#0094FF] text-xs font-bold mb-1">RESPONSE</div>
                  <div className="text-lg font-mono" style={{ color: bot.color }}>
                    {bot.responseTime ? `${bot.responseTime}ms` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[#0094FF] text-xs font-bold mb-1">LAST CHECK</div>
                  <div className="text-xs font-mono text-[#999]">
                    {bot.lastCheck || '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[#666] text-xs">
          <p>🚀 WISE² Bot Ecosystem Monitoring</p>
          <p className="mt-1">Status updates every 10 seconds • Last updated: {lastUpdate || 'never'}</p>
        </div>
      </div>
    </div>
  );
}
