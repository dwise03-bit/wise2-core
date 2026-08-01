'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '../../../../src/components/ui';

type ProductionStage = 'preflight' | 'queued' | 'printing' | 'postprocess' | 'qc' | 'ready';

interface ProductionJob {
  id: string;
  orderNumber: string;
  customerName: string;
  itemName: string;
  type: '3d' | 'dtf';
  stage: ProductionStage;
  progress: number;
  estimatedMinutes: number;
  startedAt: string | null;
}

const STAGE_LABELS: Record<ProductionStage, string> = {
  preflight: 'Preflight',
  queued: 'Queued',
  printing: 'Printing',
  postprocess: 'Post-Process',
  qc: 'QC',
  ready: 'Ready',
};

const STAGE_COLORS: Record<ProductionStage, string> = {
  preflight: 'text-purple-400',
  queued: 'text-text-muted',
  printing: 'text-wise-electric',
  postprocess: 'text-warning',
  qc: 'text-wise-neon',
  ready: 'text-success',
};

const DEMO_JOBS: ProductionJob[] = [
  { id: 'j1', orderNumber: 'PS-20260801-A3F2K', customerName: 'Martinez LLC', itemName: 'Packout Monitor Mount', type: '3d', stage: 'printing', progress: 65, estimatedMinutes: 240, startedAt: '2026-08-01T08:00:00Z' },
  { id: 'j2', orderNumber: 'PS-20260801-A3F2K', customerName: 'Martinez LLC', itemName: 'Cable Clip x10', type: '3d', stage: 'queued', progress: 0, estimatedMinutes: 45, startedAt: null },
  { id: 'j3', orderNumber: 'PS-20260730-C1D4M', customerName: 'PIFF CITY', itemName: 'Gang Sheet 22×32"', type: 'dtf', stage: 'postprocess', progress: 90, estimatedMinutes: 30, startedAt: '2026-07-30T14:00:00Z' },
  { id: 'j4', orderNumber: 'PS-20260728-E5F1Q', customerName: 'Wise Defense LLC', itemName: 'Router Mount v2', type: '3d', stage: 'qc', progress: 100, estimatedMinutes: 0, startedAt: '2026-07-28T09:00:00Z' },
];

const STAGES: ProductionStage[] = ['preflight', 'queued', 'printing', 'postprocess', 'qc', 'ready'];

export default function ProductionPage() {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const jobsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = DEMO_JOBS.filter(j => j.stage === stage);
    return acc;
  }, {} as Record<ProductionStage, ProductionJob[]>);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/dashboard/print-on-demand" className="text-text-muted hover:text-text-secondary text-sm">&larr; Print Shop</Link>
          <h1 className="text-xl font-bold text-white mt-1">Production Queue</h1>
          <p className="text-sm text-text-muted">{DEMO_JOBS.length} active jobs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${viewMode === 'board' ? 'border-wise-electric text-wise-electric bg-wise-electric/10' : 'border-border-subtle text-text-muted'}`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${viewMode === 'list' ? 'border-wise-electric text-wise-electric bg-wise-electric/10' : 'border-border-subtle text-text-muted'}`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {STAGES.map(stage => (
            <div key={stage} className="min-w-[180px]">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${STAGE_COLORS[stage]}`}>
                  {STAGE_LABELS[stage]}
                </span>
                <Badge variant="neutral">{jobsByStage[stage].length}</Badge>
              </div>
              <div className="space-y-2">
                {jobsByStage[stage].map(job => (
                  <Card key={job.id} className="p-3 hover:border-border-electric transition-colors cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${job.type === '3d' ? 'bg-wise-electric' : 'bg-wise-neon'}`} />
                      <span className="text-2xs text-text-muted font-mono">{job.orderNumber.split('-').pop()}</span>
                    </div>
                    <p className="text-xs font-medium text-text-primary line-clamp-1">{job.itemName}</p>
                    <p className="text-2xs text-text-muted mt-0.5">{job.customerName}</p>
                    {job.stage === 'printing' && (
                      <div className="mt-2">
                        <div className="h-1 bg-wise-gunmetal rounded-full overflow-hidden">
                          <div className="h-full bg-wise-electric rounded-full transition-all" style={{ width: `${job.progress}%` }} />
                        </div>
                        <p className="text-2xs text-wise-electric mt-0.5">{job.progress}%</p>
                      </div>
                    )}
                  </Card>
                ))}
                {jobsByStage[stage].length === 0 && (
                  <div className="border border-dashed border-border-subtle rounded-lg p-4 text-center">
                    <p className="text-2xs text-text-muted">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs bg-wise-surface-elevated/50">
                  <th className="text-left px-4 py-2.5 font-medium">Job</th>
                  <th className="text-left px-4 py-2.5 font-medium">Order</th>
                  <th className="text-left px-4 py-2.5 font-medium">Customer</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Stage</th>
                  <th className="text-left px-4 py-2.5 font-medium">Progress</th>
                  <th className="text-right px-4 py-2.5 font-medium">Est. Time</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_JOBS.map(job => (
                  <tr key={job.id} className="border-b border-border-subtle/50 hover:bg-wise-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-text-primary text-sm">{job.itemName}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-wise-electric">{job.orderNumber}</span></td>
                    <td className="px-4 py-3 text-text-secondary">{job.customerName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={job.type === '3d' ? 'info' : 'success'}>{job.type === '3d' ? '3D' : 'DTF'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${STAGE_COLORS[job.stage]}`}>{STAGE_LABELS[job.stage]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-wise-gunmetal rounded-full overflow-hidden">
                          <div className="h-full bg-wise-electric rounded-full" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-xs text-text-muted">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted text-xs">
                      {job.estimatedMinutes > 0 ? `${Math.round(job.estimatedMinutes / 60)}h ${job.estimatedMinutes % 60}m` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
