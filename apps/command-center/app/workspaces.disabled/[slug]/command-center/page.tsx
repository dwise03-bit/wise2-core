/**
 * Command Center Dashboard (Mission Control)
 * Main operational dashboard for workspace
 */

'use client';

import React from 'react';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { MetricCard } from '@/src/components/dashboard/MetricCard';
import { DigitalWorkforcePanel } from '@/src/components/dashboard/DigitalWorkforcePanel';
import { WorkflowTimeline } from '@/src/components/dashboard/WorkflowTimeline';
import { BusinessHealthCard } from '@/src/components/dashboard/BusinessHealthCard';

export default function CommandCenterPage() {
  const { workspace, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-wise-surface-1 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-wise-surface-1 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-wise-bg-darkest min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-wise-text-primary">
            Command Center
          </h1>
          <p className="text-wise-text-secondary mt-2">
            Real-time operational dashboard for {workspace?.name}
          </p>
        </div>
        <div className="text-right text-xs text-wise-text-secondary">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="w-2 h-2 bg-wise-green-neon rounded-full animate-green-pulse" />
            Systems operational
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value="$45,230"
          change="+12%"
          changeType="positive"
          icon="💰"
        />
        <MetricCard
          title="AI Activity"
          value="8 tasks"
          change="2 pending"
          changeType="neutral"
          icon="🤖"
        />
        <MetricCard
          title="Queue Health"
          value="142 items"
          change="-8 today"
          changeType="positive"
          icon="📋"
        />
        <MetricCard
          title="System Health"
          value="99.97%"
          change="↑ 0.1%"
          changeType="positive"
          icon="⚡"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Workflows & Timeline */}
        <div className="col-span-2 space-y-6">
          {/* Workflow Ribbon */}
          <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
            <h2 className="text-lg font-semibold text-wise-text-primary mb-4">
              Current Workflow
            </h2>
            <WorkflowTimeline />
          </div>

          {/* Business Health */}
          <BusinessHealthCard />

          {/* Production Status */}
          <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
            <h2 className="text-lg font-semibold text-wise-text-primary mb-4">
              Production Status
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Orders Processing', status: 'running', count: 42 },
                { label: 'Inventory Sync', status: 'ready', count: 100 },
                { label: 'Quality Control', status: 'working', count: 12 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 bg-wise-surface-2 rounded-md border border-wise-border"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'ready'
                          ? 'bg-wise-green-neon animate-green-pulse'
                          : item.status === 'working'
                            ? 'bg-wise-blue-electric animate-blue-pulse'
                            : 'bg-wise-text-secondary'
                      }`}
                    />
                    <span className="text-sm font-medium text-wise-text-primary">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-wise-text-secondary">
                    {item.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Digital Workforce & Recommendations */}
        <div className="space-y-6">
          {/* Digital Workforce Panel */}
          <DigitalWorkforcePanel />

          {/* Hermes Command Panel */}
          <div className="rounded-lg bg-wise-surface-1 border border-wise-blue-electric border-opacity-30 p-6 bg-gradient-to-b from-wise-surface-1 to-wise-surface-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-wise-text-primary">Hermes</h3>
                  <p className="text-xs text-wise-text-secondary">Master Orchestrator</p>
                </div>
              </div>
              <span className="w-2 h-2 bg-wise-green-neon rounded-full animate-green-pulse" />
            </div>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-wise-text-secondary">Status</span>
                <span className="text-wise-green-neon font-semibold">Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wise-text-secondary">Processing</span>
                <span className="text-wise-text-primary">3 conversations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wise-text-secondary">Recommendations</span>
                <span className="text-wise-text-primary">2 pending</span>
              </div>
            </div>

            <button className="w-full py-2 px-3 bg-wise-blue-electric text-black font-semibold rounded-md hover:opacity-90 transition-opacity text-sm">
              Open Hermes
            </button>
          </div>

          {/* Alerts & Notifications */}
          <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
            <h3 className="font-semibold text-wise-text-primary mb-3 text-sm uppercase">
              Alerts
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-wise-surface-2 border-l-2 border-l-wise-orange-warning rounded text-xs">
                <div className="font-semibold text-wise-orange-warning">
                  Inventory Low
                </div>
                <div className="text-wise-text-secondary text-xs mt-1">
                  Stock below threshold on 3 items
                </div>
              </div>
              <div className="p-3 bg-wise-surface-2 border-l-2 border-l-wise-green-neon rounded text-xs">
                <div className="font-semibold text-wise-green-neon">
                  QC Complete
                </div>
                <div className="text-wise-text-secondary text-xs mt-1">
                  Batch #1042 passed inspection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Infrastructure Health Bar */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {[
            { label: 'Redis', status: 'ok' },
            { label: 'PostgreSQL', status: 'ok' },
            { label: 'MongoDB', status: 'ok' },
            { label: 'Workers', status: 'ok', value: '5/5' },
            { label: 'Queues', status: 'ok', value: '142 items' },
            { label: 'AI Models', status: 'ok', value: '8 active' },
            { label: 'Uptime', status: 'ok', value: '99.97%' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 whitespace-nowrap py-2 px-3 bg-wise-surface-2 rounded text-xs"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.status === 'ok'
                    ? 'bg-wise-green-neon'
                    : 'bg-wise-orange-warning'
                }`}
              />
              <span className="font-medium text-wise-text-primary">
                {item.label}
              </span>
              {item.value && (
                <span className="text-wise-text-secondary">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
