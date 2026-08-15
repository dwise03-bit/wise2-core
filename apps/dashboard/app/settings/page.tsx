'use client';

import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  actions: number;
  lastSync?: string;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'discord',
    name: 'Discord',
    icon: '💬',
    description: 'Team chat and notifications',
    status: 'connected',
    actions: 12,
    lastSync: '2 minutes ago',
    features: ['Notifications', 'Ticketing', 'Analytics Sync', 'Alerts'],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Code repository and deployments',
    status: 'connected',
    actions: 8,
    lastSync: '15 minutes ago',
    features: ['Deploy Logs', 'Issue Tracking', 'Release Notes', 'Code Status'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    description: 'Payment processing',
    status: 'connected',
    actions: 5,
    lastSync: '1 hour ago',
    features: ['Payment Tracking', 'Invoice Sync', 'Subscription Mgmt', 'Refunds'],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '📋',
    description: 'Team messaging',
    status: 'disconnected',
    actions: 0,
    features: ['Team Alerts', 'Status Updates', 'Notifications'],
  },
  {
    id: 'google',
    name: 'Google Workspace',
    icon: '🔍',
    description: 'Email, calendar, docs',
    status: 'disconnected',
    actions: 0,
    features: ['Calendar Sync', 'Email Integration', 'Docs Storage'],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    icon: '📱',
    description: 'SMS and phone',
    status: 'disconnected',
    actions: 0,
    features: ['SMS Alerts', 'Phone Support', 'Notifications'],
  },
];

const settings = [
  { category: 'Workspace', items: ['Name', 'Timezone', 'Logo', 'Description'] },
  { category: 'Security', items: ['Password', 'Two-Factor Auth', 'API Keys', 'Sessions'] },
  { category: 'Billing', items: ['Plan', 'Payment Method', 'Invoices', 'Usage'] },
  { category: 'Users', items: ['Team Members', 'Permissions', 'Roles', 'Invites'] },
];

export default function SettingsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#2cd588]">⚙️ Settings</h1>
        <p className="text-gray-400 mt-1">Manage integrations and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#2cd588]/30">
        <button className="px-4 py-3 border-b-2 border-[#2cd588] text-[#2cd588] font-medium">
          Integrations
        </button>
        <button className="px-4 py-3 text-gray-400 hover:text-white">Workspace</button>
        <button className="px-4 py-3 text-gray-400 hover:text-white">Security</button>
        <button className="px-4 py-3 text-gray-400 hover:text-white">Billing</button>
      </div>

      {/* Integration Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Connected Services</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{connectedCount}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Automations</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">25</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">API Calls This Month</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">1,234</p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">Available Integrations</h2>
        <div className="grid grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              onClick={() => setSelectedIntegration(integration)}
              className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 cursor-pointer hover:border-[#2cd588] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-3xl">{integration.icon}</p>
                  <div>
                    <h3 className="font-bold text-white">{integration.name}</h3>
                    <p className="text-gray-400 text-sm">{integration.description}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded font-mono ${
                    integration.status === 'connected'
                      ? 'bg-green-500/20 text-green-400'
                      : integration.status === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {integration.status}
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {integration.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="text-xs bg-[#2cd588]/10 text-[#2cd588] px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
                {integration.features.length > 3 && (
                  <span className="text-xs text-gray-500">+{integration.features.length - 3} more</span>
                )}
              </div>

              {/* Status */}
              {integration.status === 'connected' && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{integration.actions} automations</span>
                  <span>Synced {integration.lastSync}</span>
                </div>
              )}

              {integration.status === 'disconnected' && (
                <button className="w-full mt-4 px-4 py-2 bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/30">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Integration Detail */}
      {selectedIntegration && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <p className="text-4xl">{selectedIntegration.icon}</p>
              <div>
                <h2 className="text-3xl font-bold text-[#2cd588]">{selectedIntegration.name}</h2>
                <p className="text-gray-400">{selectedIntegration.description}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded font-mono ${
                selectedIntegration.status === 'connected'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {selectedIntegration.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Features */}
            <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20">
              <h3 className="font-bold text-[#2cd588] mb-4">Features</h3>
              <div className="space-y-2">
                {selectedIntegration.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white">
                    <span className="text-[#2cd588]">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20 space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="text-white font-mono mt-1">
                  {selectedIntegration.status === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>

              {selectedIntegration.status === 'connected' && (
                <>
                  <div>
                    <p className="text-gray-500 text-sm">Active Automations</p>
                    <p className="text-2xl font-bold text-[#2cd588] mt-1">{selectedIntegration.actions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Last Sync</p>
                    <p className="text-white mt-1">{selectedIntegration.lastSync}</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button className="flex-1 px-4 py-2 bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/30">
                  {selectedIntegration.status === 'connected' ? 'Settings' : 'Connect'}
                </button>
                {selectedIntegration.status === 'connected' && (
                  <button className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500 rounded text-red-400 font-medium hover:bg-red-500/30">
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">Workspace Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          {settings.map((settingGroup, idx) => (
            <div
              key={idx}
              className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 hover:border-[#2cd588] transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-white mb-4">{settingGroup.category}</h3>
              <ul className="space-y-2">
                {settingGroup.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-gray-400 text-sm flex justify-between">
                    <span>{item}</span>
                    <span className="text-gray-600">→</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
