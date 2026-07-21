'use client';

import React, { useState } from 'react';
import { AgentStatus } from './AgentStatus';
import { KnowledgeGraphViz } from './KnowledgeGraphViz';
import { VoiceControl } from './VoiceControl';

type TabType = 'agents' | 'knowledge-graph' | 'voice' | 'sync' | 'metrics';

export const DashboardV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('agents');

  const tabs = [
    { id: 'agents', label: 'Agent Control Panel', icon: '🤖' },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: '🕸️' },
    { id: 'voice', label: 'Voice Assistant', icon: '🎤' },
    { id: 'sync', label: 'Sync Status', icon: '🔄' },
    { id: 'metrics', label: 'System Metrics', icon: '📊' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgentStatus />;
      case 'knowledge-graph':
        return <KnowledgeGraphViz />;
      case 'voice':
        return <VoiceControl />;
      case 'sync':
        return <SyncStatusComponent />;
      case 'metrics':
        return <SystemMetricsComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">WISE² Command Center</h1>
        </div>

        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white min-h-screen">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>WISE² Core v1.0 | Advanced Agentic Operating System</p>
        </div>
      </footer>
    </div>
  );
};

const SyncStatusComponent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Device Sync Status</h2>
    <div className="bg-blue-50 p-4 rounded-lg">
      <p className="text-gray-700">Sync status component coming soon...</p>
    </div>
  </div>
);

const SystemMetricsComponent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">System Metrics</h2>
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="text-gray-600 text-sm">Total Requests</div>
        <div className="text-3xl font-bold">12,847</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <div className="text-gray-600 text-sm">Success Rate</div>
        <div className="text-3xl font-bold">99.8%</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
        <div className="text-gray-600 text-sm">Avg Response Time</div>
        <div className="text-3xl font-bold">145ms</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <div className="text-gray-600 text-sm">Error Rate</div>
        <div className="text-3xl font-bold">0.2%</div>
      </div>
    </div>
  </div>
);

export default DashboardV2;
