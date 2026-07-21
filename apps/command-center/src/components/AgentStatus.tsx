'use client';

import React, { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error' | 'loading';
  uptime: number;
  requestsPerSecond: number;
  errorRate: number;
  lastUpdated: Date;
}

export const AgentStatus: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/agents/status');
      const data = await response.json();
      setAgents(data.agents);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent status', error);
    }
  };

  const toggleAgent = async (agentId: string) => {
    try {
      const agent = agents.find((a) => a.id === agentId);
      const newStatus = agent?.status === 'running' ? 'idle' : 'running';

      await fetch(`/api/agents/${agentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchAgentStatus();
    } catch (error) {
      console.error('Failed to toggle agent', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'loading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading agent status...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Agent Control Panel</h2>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="border rounded-lg p-4 bg-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                <h3 className="text-lg font-semibold">{agent.name}</h3>
              </div>

              <button
                onClick={() => toggleAgent(agent.id)}
                className={`px-4 py-2 rounded text-white font-medium ${
                  agent.status === 'running'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {agent.status === 'running' ? 'Stop' : 'Start'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status: </span>
                <span className="font-semibold">{agent.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Uptime: </span>
                <span className="font-semibold">{Math.floor(agent.uptime / 1000)}s</span>
              </div>
              <div>
                <span className="text-gray-600">RPS: </span>
                <span className="font-semibold">{agent.requestsPerSecond.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Error Rate: </span>
                <span className="font-semibold text-red-500">
                  {(agent.errorRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatus;
