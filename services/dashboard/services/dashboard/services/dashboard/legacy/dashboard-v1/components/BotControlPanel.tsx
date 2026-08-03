'use client';

import { useEffect, useState } from 'react';
import { Power, RotateCcw, Zap } from 'lucide-react';

interface Bot {
  id: number;
  name: string;
  status: 'online' | 'errored' | 'stopped' | 'stopping';
  pid: number | null;
  memory: number;
  cpu: number;
  uptime: string;
  restarts: number;
}

interface Summary {
  total: number;
  online: number;
  errored: number;
  stopped: number;
}

export default function BotControlPanel() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      fetchBotStatus(storedToken);
    }
    setLoading(false);
  }, []);

  const fetchBotStatus = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/bots/control', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setBots(data.bots);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    }
  };

  const handleBotAction = async (action: 'start' | 'stop' | 'restart', botId?: number) => {
    if (!token) return;

    setActionLoading(botId ?? -1);

    try {
      const response = await fetch('/api/admin/bots/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          botId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBotStatus(token);
      }
    } catch (error) {
      console.error(`Failed to ${action} bot:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'errored':
        return 'text-red-500';
      case 'stopped':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-900 bg-opacity-20';
      case 'errored':
        return 'bg-red-900 bg-opacity-20';
      case 'stopped':
        return 'bg-gray-900 bg-opacity-20';
      default:
        return 'bg-gray-900 bg-opacity-20';
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading bot control panel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card bg-opacity-50">
            <div className="text-sm text-gray-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-silver">{summary.total}</div>
          </div>
          <div className="card bg-opacity-50 border-green-500 border-opacity-30">
            <div className="text-sm text-green-400 mb-1">Online</div>
            <div className="text-2xl font-bold text-green-400">{summary.online}</div>
          </div>
          <div className="card bg-opacity-50 border-red-500 border-opacity-30">
            <div className="text-sm text-red-400 mb-1">Errored</div>
            <div className="text-2xl font-bold text-red-400">{summary.errored}</div>
          </div>
          <div className="card bg-opacity-50 border-gray-500 border-opacity-30">
            <div className="text-sm text-gray-400 mb-1">Stopped</div>
            <div className="text-2xl font-bold text-gray-400">{summary.stopped}</div>
          </div>
        </div>
      )}

      {/* Global Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleBotAction('start')}
          disabled={actionLoading !== null}
          className="btn-primary flex items-center gap-2"
        >
          <Power size={16} /> Start All
        </button>
        <button
          onClick={() => handleBotAction('restart')}
          disabled={actionLoading !== null}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw size={16} /> Restart All
        </button>
        <button
          onClick={() => handleBotAction('stop')}
          disabled={actionLoading !== null}
          className="btn-secondary flex items-center gap-2"
        >
          <Power size={16} /> Stop All
        </button>
        <button
          onClick={() => fetchBotStatus(token)}
          disabled={actionLoading !== null}
          className="btn-secondary flex items-center gap-2"
        >
          <Zap size={16} /> Refresh
        </button>
      </div>

      {/* Bot List */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">PID</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Memory</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">CPU</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Uptime</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Restarts</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.id} className={`border-b border-gray-900 ${getStatusBg(bot.status)}`}>
                <td className="px-4 py-3 text-silver font-semibold">{bot.name}</td>
                <td className="px-4 py-3">
                  <span className={`${getStatusColor(bot.status)} font-medium capitalize`}>
                    {bot.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono">{bot.pid || '-'}</td>
                <td className="px-4 py-3 text-gray-300">{bot.memory} MB</td>
                <td className="px-4 py-3 text-gray-300">{bot.cpu}%</td>
                <td className="px-4 py-3 text-gray-300 text-xs">{bot.uptime || '-'}</td>
                <td className="px-4 py-3 text-gray-300">{bot.restarts}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleBotAction('start', bot.id)}
                    disabled={actionLoading === bot.id}
                    className="px-2 py-1 text-xs bg-green-900 bg-opacity-30 text-green-400 hover:bg-opacity-50 rounded transition-colors"
                    title="Start bot"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleBotAction('restart', bot.id)}
                    disabled={actionLoading === bot.id}
                    className="px-2 py-1 text-xs bg-blue-900 bg-opacity-30 text-blue-400 hover:bg-opacity-50 rounded transition-colors"
                    title="Restart bot"
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => handleBotAction('stop', bot.id)}
                    disabled={actionLoading === bot.id}
                    className="px-2 py-1 text-xs bg-red-900 bg-opacity-30 text-red-400 hover:bg-opacity-50 rounded transition-colors"
                    title="Stop bot"
                  >
                    Stop
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bots.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No bots currently running. Start the PM2 process manager to begin.
        </div>
      )}
    </div>
  );
}
