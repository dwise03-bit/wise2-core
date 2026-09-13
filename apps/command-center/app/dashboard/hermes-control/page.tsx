'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../../../src/components/ui';

export default function HermesControlPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'context' | 'costs' | 'tuning' | 'integrations'>('models');

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

      {/* Content */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-wise-electric mb-4">{activeTab.toUpperCase()}</h2>

        {activeTab === 'models' && (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">Model Zoo - Select and compare AI models</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-4 border-l-4 border-l-wise-electric">
                <p className="font-semibold text-text-primary">Qwen 2.5 Coder (Local)</p>
                <p className="text-sm text-text-muted mt-1">Provider: OLLAMA</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="info">RAG</Badge>
                  <Badge variant="info">Code</Badge>
                  <Badge variant="info">Vision</Badge>
                </div>
              </Card>
              <Card className="p-4 border-l-4 border-l-border-subtle">
                <p className="font-semibold text-text-primary">Claude Opus (Anthropic)</p>
                <p className="text-sm text-text-muted mt-1">Provider: ANTHROPIC</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="success">Reasoning</Badge>
                  <Badge variant="success">Code</Badge>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'context' && (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">Context Inspector - View live Hermes context</p>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              <Card className="p-3">
                <div className="text-sm text-text-muted">Brain Entries</div>
                <div className="text-2xl font-bold text-wise-electric mt-1">2,847</div>
              </Card>
              <Card className="p-3">
                <div className="text-sm text-text-muted">Knowledge Vaults</div>
                <div className="text-2xl font-bold text-wise-electric mt-1">12</div>
              </Card>
              <Card className="p-3">
                <div className="text-sm text-text-muted">Active Agents</div>
                <div className="text-2xl font-bold text-wise-electric mt-1">9/18</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">Cost Dashboard - Track AI spending</p>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-text-muted">Today</div>
                <div className="text-3xl font-bold text-wise-electric mt-2">$12.48</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-text-muted">This Month</div>
                <div className="text-3xl font-bold text-wise-electric mt-2">$284.32</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-text-muted">This Year</div>
                <div className="text-3xl font-bold text-wise-electric mt-2">$1,203.45</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'tuning' && (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">Model Parameters - Adjust Hermes behavior</p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">Temperature: 0.70</label>
                <input type="range" min="0" max="2" step="0.1" defaultValue="0.7" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">Max Tokens: 2048</label>
                <input type="range" min="256" max="8192" step="256" defaultValue="2048" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">Reasoning Depth</label>
                <div className="flex gap-2">
                  {['Basic', 'Standard', 'Deep'].map(depth => (
                    <Button key={depth} variant="secondary" size="sm">
                      {depth}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">Integration Manager - Connect external services</p>
            <div className="space-y-3">
              <Card className="p-4 border-l-4 border-l-success">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">WISE² Discord</p>
                    <p className="text-sm text-text-muted mt-1">Send alerts to Discord channels</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
              </Card>
              <Card className="p-4 border-l-4 border-l-warning">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">Team Slack</p>
                    <p className="text-sm text-text-muted mt-1">Integrate with team notifications</p>
                  </div>
                  <Badge variant="neutral">Disconnected</Badge>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
