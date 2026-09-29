'use client';

import { useState } from 'react';

interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: 'webhook' | 'schedule' | 'event' | 'manual';
    config: Record<string, any>;
  };
  actions: Array<{
    type: 'email' | 'discord' | 'api' | 'database' | 'sms' | 'http';
    config: Record<string, any>;
  }>;
  executionCount: number;
  lastRun?: string;
  createdAt: string;
}

const builtInAutomations = [
  {
    id: 'auto-1',
    name: 'Invoice Paid → CRM Sync',
    description: 'When invoice is marked paid, create contact in CRM',
    enabled: true,
    trigger: { type: 'event' as const, config: { event: 'invoice.paid' } },
    actions: [
      { type: 'database' as const, config: { action: 'create_contact' } },
      { type: 'discord' as const, config: { channel: 'payments', message: 'Invoice paid' } },
    ],
    executionCount: 23,
    lastRun: '2 hours ago',
    createdAt: '2026-07-15',
  },
  {
    id: 'auto-2',
    name: 'Deal Negotiation → Email Alert',
    description: 'Alert sales team when deal moves to negotiation stage',
    enabled: true,
    trigger: { type: 'event' as const, config: { event: 'opportunity.stage_changed' } },
    actions: [
      { type: 'email' as const, config: { to: 'sales@wise2.net', subject: 'Deal in negotiation' } },
    ],
    executionCount: 8,
    lastRun: '1 day ago',
    createdAt: '2026-07-10',
  },
  {
    id: 'auto-3',
    name: 'Daily Report Generator',
    description: 'Generate and email daily metrics report at 9am',
    enabled: true,
    trigger: { type: 'schedule' as const, config: { cron: '0 9 * * *' } },
    actions: [
      { type: 'api' as const, config: { endpoint: '/reports/generate-daily' } },
      { type: 'email' as const, config: { to: 'team@wise2.net', subject: 'Daily Report' } },
    ],
    executionCount: 47,
    lastRun: '12 hours ago',
    createdAt: '2026-06-20',
  },
  {
    id: 'auto-4',
    name: 'Overdue Invoice Reminder',
    description: 'Send reminder for invoices 15+ days overdue',
    enabled: true,
    trigger: { type: 'schedule' as const, config: { cron: '0 10 * * MON' } },
    actions: [
      { type: 'email' as const, config: { template: 'overdue_reminder' } },
      { type: 'discord' as const, config: { channel: 'finance' } },
    ],
    executionCount: 12,
    lastRun: '3 days ago',
    createdAt: '2026-07-01',
  },
];

const triggerTypes = [
  { id: 'webhook', name: 'Webhook', icon: '🔗', description: 'External API trigger' },
  { id: 'schedule', name: 'Schedule', icon: '⏰', description: 'Cron job / timer' },
  { id: 'event', name: 'Event', icon: '📌', description: 'App event trigger' },
  { id: 'manual', name: 'Manual', icon: '👆', description: 'Click to run' },
];

const actionTypes = [
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'api', name: 'HTTP API', icon: '🔌' },
  { id: 'database', name: 'Database', icon: '💾' },
  { id: 'sms', name: 'SMS', icon: '📱' },
];

export default function AutomationPage() {
  const [automations, setAutomations] = useState(builtInAutomations);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const totalExecutions = automations.reduce((sum, a) => sum + a.executionCount, 0);
  const enabledCount = automations.filter((a) => a.enabled).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">⚡ Automation</h1>
          <p className="text-gray-400 mt-1">Build powerful workflows without coding</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-6 py-3 bg-blue-500/20 border border-blue-500 text-blue-400 font-bold rounded-lg hover:bg-blue-500/30"
          >
            📋 Templates
          </button>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600"
          >
            + New Workflow
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Active Workflows</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{enabledCount}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Automations</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{automations.length}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Executions (all-time)</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{totalExecutions}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Errors</p>
          <p className="text-3xl font-bold text-red-400 mt-2">0</p>
        </div>
      </div>

      {/* Automation List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">Active Workflows</h2>
        {automations.map((auto) => (
          <div
            key={auto.id}
            onClick={() => setSelectedAutomation(auto)}
            className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 cursor-pointer hover:border-[#2cd588] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{auto.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      auto.enabled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {auto.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{auto.description}</p>

                {/* Trigger & Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Trigger:</span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                      {auto.trigger.type}
                    </span>
                  </div>
                  <span className="text-gray-600">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Actions:</span>
                    <div className="flex gap-1">
                      {auto.actions.map((action, idx) => (
                        <span
                          key={idx}
                          className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs"
                        >
                          {action.type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right space-y-2">
                <div className="text-sm">
                  <p className="text-gray-500">Executions</p>
                  <p className="text-[#2cd588] font-bold">{auto.executionCount}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Last run</p>
                  <p className="text-gray-400">{auto.lastRun}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Automation Detail */}
      {selectedAutomation && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#2cd588]">{selectedAutomation.name}</h2>
              <p className="text-gray-400 mt-2">{selectedAutomation.description}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/30">
                Edit
              </button>
              <button className="px-4 py-2 bg-green-500/20 border border-green-500 rounded text-green-400 font-medium hover:bg-green-500/30">
                Run Now
              </button>
            </div>
          </div>

          {/* Trigger Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20">
              <h3 className="font-bold text-[#2cd588] mb-4">Trigger</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="text-white font-mono mt-1">{selectedAutomation.trigger.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Configuration</p>
                  <pre className="text-xs text-gray-400 mt-1 overflow-auto">
                    {JSON.stringify(selectedAutomation.trigger.config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Actions Details */}
            <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20">
              <h3 className="font-bold text-[#2cd588] mb-4">Actions ({selectedAutomation.actions.length})</h3>
              <div className="space-y-3">
                {selectedAutomation.actions.map((action, idx) => (
                  <div key={idx} className="bg-[#0f0f1e] p-3 rounded border border-[#2cd588]/20">
                    <p className="font-mono text-sm text-[#2cd588]">{action.type}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.keys(action.config).length} parameters
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution History */}
          <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20">
            <h3 className="font-bold text-[#2cd588] mb-4">Recent Executions</h3>
            <div className="space-y-2">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex justify-between text-sm py-2 border-b border-[#2cd588]/10">
                  <span className="text-gray-400">{new Date(Date.now() - idx * 3600000).toLocaleString()}</span>
                  <span className="text-green-400">✓ Success (234ms)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f1e] border border-[#2cd588] rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2cd588]">Create Workflow</h2>
              <button onClick={() => setShowBuilder(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Name & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g., Invoice Paid → CRM Sync"
                  className="w-full bg-[#050505] border border-[#2cd588] rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              {/* Trigger Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Select Trigger</label>
                <div className="grid grid-cols-2 gap-3">
                  {triggerTypes.map((trigger) => (
                    <button
                      key={trigger.id}
                      className="p-4 border border-[#2cd588]/30 rounded-lg hover:bg-[#2cd588]/10 hover:border-[#2cd588] transition-all text-left"
                    >
                      <p className="text-2xl">{trigger.icon}</p>
                      <p className="font-medium text-white mt-2">{trigger.name}</p>
                      <p className="text-xs text-gray-400">{trigger.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Add Actions</label>
                <div className="grid grid-cols-5 gap-2">
                  {actionTypes.map((action) => (
                    <button
                      key={action.id}
                      className="p-3 border border-[#2cd588]/30 rounded-lg hover:bg-[#2cd588]/10 hover:border-[#2cd588] transition-all text-center"
                    >
                      <p className="text-2xl">{action.icon}</p>
                      <p className="text-xs text-white mt-1">{action.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f1e] border border-[#2cd588] rounded-lg max-w-3xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2cd588]">Automation Templates</h2>
              <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Invoice Auto-Payment', desc: 'Auto-pay invoices from Stripe' },
                { name: 'Daily Standup', desc: 'Send daily team metrics' },
                { name: 'Lead Scoring', desc: 'Score leads with AI' },
                { name: 'Customer Churn Alert', desc: 'Alert on churn signals' },
                { name: 'Deploy Notification', desc: 'Notify on GitHub deploy' },
                { name: 'Slack Status Sync', desc: 'Sync Slack with calendar' },
              ].map((template, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#2cd588]/30 rounded-lg cursor-pointer hover:bg-[#2cd588]/10 hover:border-[#2cd588] transition-all"
                >
                  <p className="font-medium text-white">{template.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{template.desc}</p>
                  <button className="mt-3 px-3 py-1 text-xs bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] hover:bg-[#2cd588]/30">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
