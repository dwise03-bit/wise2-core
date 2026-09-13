'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Input } from '../../../src/components/ui';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
const BRAIN_API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || '/brain-api';

interface HermesModel {
  id: string;
  name: string;
  provider: 'ollama' | 'anthropic' | 'openai' | 'local';
  costPer1kTokens: number;
  speedMs: number;
  latencyP99: number;
  active: boolean;
  features: string[];
}

interface ContextData {
  brain: { entries: number; vaults: number };
  telemetry: { systems: number; events: number };
  agents: { active: number; total: number };
  edges: { online: number; total: number };
}

interface CostMetrics {
  today: number;
  thisMonth: number;
  thisYear: number;
  byProvider: Record<string, number>;
  byOperationType: Record<string, number>;
  trend: Array<{ date: string; cost: number }>;
}

interface TuningParams {
  temperature: number;
  maxTokens: number;
  reasoningDepth: 'basic' | 'standard' | 'deep';
  contextWindow: number;
  retryCount: number;
  timeoutMs: number;
}

interface Integration {
  id: string;
  name: string;
  type: 'discord' | 'slack' | 'github' | 'webhook';
  enabled: boolean;
  webhookUrl?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export default function HermesControlPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'models' | 'context' | 'costs' | 'tuning' | 'integrations'>('models');
  const [loading, setLoading] = useState(true);

  // Models
  const [models, setModels] = useState<HermesModel[]>([
    {
      id: 'ollama-qwen',
      name: 'Qwen 2.5 Coder (Local)',
      provider: 'ollama',
      costPer1kTokens: 0,
      speedMs: 180,
      latencyP99: 850,
      active: true,
      features: ['RAG', 'Code', 'Vision'],
    },
    {
      id: 'claude-opus',
      name: 'Claude Opus (Anthropic)',
      provider: 'anthropic',
      costPer1kTokens: 0.075,
      speedMs: 90,
      latencyP99: 320,
      active: false,
      features: ['Reasoning', 'Code', 'Vision', 'Tool Use'],
    },
    {
      id: 'gpt4-turbo',
      name: 'GPT-4 Turbo (OpenAI)',
      provider: 'openai',
      costPer1kTokens: 0.03,
      speedMs: 120,
      latencyP99: 450,
      active: false,
      features: ['Vision', 'Code', 'Tool Use'],
    },
  ]);

  // Context
  const [context, setContext] = useState<ContextData>({
    brain: { entries: 2847, vaults: 12 },
    telemetry: { systems: 14, events: 42156 },
    agents: { active: 9, total: 18 },
    edges: { online: 7, total: 8 },
  });

  // Costs
  const [costs, setCosts] = useState<CostMetrics>({
    today: 12.48,
    thisMonth: 284.32,
    thisYear: 1203.45,
    byProvider: { anthropic: 892, openai: 311, ollama: 0 },
    byOperationType: { rag: 450, analysis: 320, synthesis: 280, planning: 153 },
    trend: [
      { date: 'Sep 1', cost: 8.2 },
      { date: 'Sep 5', cost: 15.3 },
      { date: 'Sep 10', cost: 22.1 },
      { date: 'Sep 15', cost: 18.7 },
      { date: 'Sep 20', cost: 25.4 },
      { date: 'Sep 25', cost: 31.2 },
      { date: 'Sep 30', cost: 12.48 },
    ],
  });

  // Tuning
  const [tuning, setTuning] = useState<TuningParams>({
    temperature: 0.7,
    maxTokens: 2048,
    reasoningDepth: 'standard',
    contextWindow: 8192,
    retryCount: 2,
    timeoutMs: 30000,
  });

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'discord-1',
      name: 'WISE² Discord',
      type: 'discord',
      enabled: true,
      status: 'connected',
      lastSync: '2026-09-13T12:24:17Z',
    },
    {
      id: 'slack-1',
      name: 'Team Slack',
      type: 'slack',
      enabled: false,
      status: 'disconnected',
    },
    {
      id: 'github-1',
      name: 'wise2-core Repository',
      type: 'github',
      enabled: true,
      status: 'connected',
      lastSync: '2026-09-13T11:42:00Z',
    },
  ]);

  useEffect(() => {
    if (authLoading || !token) {
      setLoading(false);
      return;
    }
    // Simulate load
    setTimeout(() => setLoading(false), 500);
  }, [authLoading, token]);

  const toggleModel = (modelId: string) => {
    setModels(prev =>
      prev.map(m =>
        m.id === modelId
          ? { ...m, active: !m.active }
          : m.provider === 'ollama'
            ? m
            : { ...m, active: false }
      )
    );
  };

  const updateTuning = (key: keyof TuningParams, value: any) => {
    setTuning(prev => ({ ...prev, [key]: value }));
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => (i.id === id ? { ...i, enabled: !i.enabled } : i))
    );
  };

  const saveTuning = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/v1/hermes/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tuning }),
      });
      alert('Tuning parameters saved!');
    } catch (err) {
      console.error('Failed to save tuning:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">⚡ Hermes Control</h1>
          <p className="text-sm text-text-muted mt-1">Advanced configuration & monitoring</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-text-muted">Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-semibold text-success">Online</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0 border-0 bg-transparent">
        <div className="flex gap-1 overflow-x-auto border-b border-border-subtle">
          {(['models', 'context', 'costs', 'tuning', 'integrations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-wise-electric text-wise-electric'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'models' && (
        <div className="space-y-5">
          <Card className="p-4">
            <div className="space-y-1 mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Available Models</h2>
              <p className="text-xs text-text-muted">
                Select the model Hermes will use for inference. LOCAL models run free; CLOUD models incur costs.
              </p>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {models.map(model => (
              <Card key={model.id} className={`p-4 border-l-4 ${model.active ? 'border-l-wise-electric' : 'border-l-border-subtle'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{model.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{model.provider.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => toggleModel(model.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      model.active
                        ? 'bg-wise-electric/20 text-wise-electric border border-wise-electric/30'
                        : 'bg-wise-black/40 text-text-secondary border border-border-subtle'
                    }`}
                  >
                    {model.active ? 'Active' : 'Select'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-text-muted">Speed</div>
                    <div className="text-sm font-semibold text-text-primary">{model.speedMs}ms</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-text-muted">P99 Latency</div>
                    <div className="text-sm font-semibold text-text-primary">{model.latencyP99}ms</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-text-muted">Cost / 1K Tokens</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {model.costPer1kTokens === 0 ? 'Free' : `$${model.costPer1kTokens.toFixed(3)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-text-muted">Capability</div>
                    <div className="text-sm font-semibold text-text-primary">{model.features.length} features</div>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {model.features.map(f => (
                    <Badge key={f} variant="info" className="text-[9px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'context' && (
        <div className="space-y-5">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Brain Entries', value: context.brain.entries, icon: '🧠' },
              { label: 'Knowledge Vaults', value: context.brain.vaults, icon: '📚' },
              { label: 'Live Systems', value: context.telemetry.systems, icon: '🖥️' },
              { label: 'Telemetry Events', value: context.telemetry.events, icon: '📊' },
              { label: 'Active Agents', value: `${context.agents.active}/${context.agents.total}`, icon: '⚙️' },
              { label: 'Edge Nodes Online', value: `${context.edges.online}/${context.edges.total}`, icon: '📡' },
            ].map((item, i) => (
              <Card key={i} className="p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-xs uppercase tracking-widest text-text-muted">{item.label}</div>
                <div className="text-2xl font-bold text-wise-electric mt-1">{item.value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Context Composition</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Brain Knowledge</span>
                <span className="text-text-primary font-semibold">35%</span>
              </div>
              <div className="w-full h-1.5 bg-wise-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-wise-electric to-wise-electric/50" style={{ width: '35%' }} />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Live Telemetry</span>
                <span className="text-text-primary font-semibold">45%</span>
              </div>
              <div className="w-full h-1.5 bg-wise-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-wise-electric via-wise-gold to-wise-gold/50" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Agent State</span>
                <span className="text-text-primary font-semibold">20%</span>
              </div>
              <div className="w-full h-1.5 bg-wise-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-wise-electric/60 to-transparent" style={{ width: '20%' }} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Today</div>
              <div className="text-3xl font-bold text-wise-electric">${costs.today.toFixed(2)}</div>
              <div className="text-xs text-text-muted mt-2">Last 24 hours</div>
            </Card>
            <Card className="p-4">
              <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">This Month</div>
              <div className="text-3xl font-bold text-wise-electric">${costs.thisMonth.toFixed(2)}</div>
              <div className="text-xs text-text-muted mt-2">30-day run rate</div>
            </Card>
            <Card className="p-4">
              <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">This Year</div>
              <div className="text-3xl font-bold text-wise-electric">${costs.thisYear.toFixed(2)}</div>
              <div className="text-xs text-text-muted mt-2">YTD total</div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Cost by Provider</h3>
            <div className="space-y-3">
              {Object.entries(costs.byProvider).map(([provider, cost]) => (
                <div key={provider}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary capitalize">{provider}</span>
                    <span className="text-text-primary font-semibold">${cost.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-wise-black/50 rounded overflow-hidden">
                    <div
                      className="h-full bg-wise-electric/70"
                      style={{ width: `${(cost / costs.thisYear) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Cost by Operation Type</h3>
            <div className="space-y-2">
              {Object.entries(costs.byOperationType)
                .sort(([, a], [, b]) => b - a)
                .map(([opType, cost]) => (
                  <div key={opType} className="flex items-center justify-between p-2 rounded bg-wise-black/30">
                    <span className="text-xs text-text-secondary capitalize">{opType.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold text-text-primary">${cost.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tuning' && (
        <div className="space-y-5">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Model Parameters</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-text-secondary">Temperature</label>
                  <span className="text-sm font-semibold text-wise-electric">{tuning.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tuning.temperature}
                  onChange={e => updateTuning('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-wise-black/50 rounded cursor-pointer"
                />
                <p className="text-[10px] text-text-muted mt-1">Lower = deterministic, Higher = creative</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-text-secondary">Max Tokens</label>
                  <span className="text-sm font-semibold text-wise-electric">{tuning.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={tuning.maxTokens}
                  onChange={e => updateTuning('maxTokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-wise-black/50 rounded cursor-pointer"
                />
                <p className="text-[10px] text-text-muted mt-1">Maximum response length</p>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-2">Reasoning Depth</label>
                <div className="flex gap-2">
                  {(['basic', 'standard', 'deep'] as const).map(depth => (
                    <button
                      key={depth}
                      onClick={() => updateTuning('reasoningDepth', depth)}
                      className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                        tuning.reasoningDepth === depth
                          ? 'bg-wise-electric text-wise-black'
                          : 'bg-wise-black/40 text-text-secondary border border-border-subtle hover:border-wise-electric/30'
                      }`}
                    >
                      {depth.charAt(0).toUpperCase() + depth.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted mt-2">
                  {tuning.reasoningDepth === 'deep' && 'Multi-step thinking enabled — higher latency, better quality'}
                  {tuning.reasoningDepth === 'standard' && 'Balanced thinking — recommended for most tasks'}
                  {tuning.reasoningDepth === 'basic' && 'Fast inference — use for simple queries'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-2">Context Window</label>
                  <Input
                    type="number"
                    value={tuning.contextWindow}
                    onChange={e => updateTuning('contextWindow', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-2">Retry Count</label>
                  <Input
                    type="number"
                    value={tuning.retryCount}
                    onChange={e => updateTuning('retryCount', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-2">Timeout (ms)</label>
                  <Input
                    type="number"
                    value={tuning.timeoutMs}
                    onChange={e => updateTuning('timeoutMs', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={saveTuning}
              variant="primary"
              className="w-full mt-6"
            >
              Save Tuning Parameters
            </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-warning bg-warning/5">
            <p className="text-xs text-text-secondary">
              ⚠️ Changing parameters will affect all future Hermes inference requests. Test changes in a non-production context first.
            </p>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-5">
          {integrations.map(integration => (
            <Card
              key={integration.id}
              className={`p-4 border-l-4 ${integration.enabled ? 'border-l-success' : 'border-l-warning'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-text-primary">{integration.name}</p>
                    <Badge
                      variant={integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'danger' : 'neutral'}
                      className="text-[9px]"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {integration.type === 'discord' && 'Send Hermes decisions and alerts to Discord channels'}
                    {integration.type === 'slack' && 'Integrate with Slack for team notifications'}
                    {integration.type === 'github' && 'Sync commits and deployments to Hermes context'}
                  </p>
                  {integration.lastSync && (
                    <p className="text-[10px] text-text-muted mt-1">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    integration.enabled
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-wise-black/40 text-text-secondary border border-border-subtle hover:border-success/30'
                  }`}
                >
                  {integration.enabled ? 'Connected' : 'Disconnected'}
                </button>
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Add Custom Webhook</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Webhook URL</label>
                <Input
                  type="text"
                  placeholder="https://your-domain.com/webhook"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Events</label>
                <div className="space-y-2">
                  {['decision', 'alert', 'error', 'completion'].map(event => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="text-xs text-text-secondary capitalize">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Add Webhook
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
