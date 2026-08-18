'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../ui';

interface PipelineStage {
  status: string;
  count: number;
  value: number;
}

interface PipelineData {
  stages: PipelineStage[];
  totalPipelineValue: number;
  conversionRate: number;
}

export function PipelineSummary({ tenantId }: { tenantId: string }) {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const response = await fetch(`/api/v1/revenue-os/dashboard/pipeline`, {
          headers: {
            'X-Tenant-ID': tenantId,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch pipeline');
        const data = await response.json();
        setPipeline(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
    const interval = setInterval(fetchPipeline, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return <Card className="h-32 bg-wise-black/50 animate-pulse" />;
  }

  if (error || !pipeline) {
    return <div className="text-red-500 text-sm">Error loading pipeline</div>;
  }

  const stageLabels: Record<string, string> = {
    DRAFT: 'NEW',
    SENT: 'CONTACTED',
    VIEWED: 'ESTIMATES',
    SOLD: 'WON',
    DECLINED: 'LOST',
    EXPIRED: 'EXPIRED',
  };

  return (
    <Card className="p-6 border border-wise-blue/30">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-4">LIVE PIPELINE SUMMARY</h3>

          {/* Pipeline flow */}
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            {pipeline.stages.map((stage, idx) => (
              <React.Fragment key={stage.status}>
                <Link href={`/hvac/estimates?status=${stage.status}`}>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-max">
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-semibold text-text-muted uppercase">
                        {stageLabels[stage.status] || stage.status}
                      </p>
                      <p className="text-2xl font-bold text-wise-electric">{stage.count}</p>
                    </div>
                  </div>
                </Link>
                {idx < pipeline.stages.length - 1 && (
                  <div className="flex-1 h-1 bg-gradient-to-r from-wise-blue/50 to-wise-blue/10 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              PIPELINE VALUE
            </p>
            <p className="text-2xl font-bold text-wise-neon mt-1">
              ${(pipeline.totalPipelineValue / 1000).toFixed(0)}k
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              CONVERSION RATE
            </p>
            <p className="text-2xl font-bold text-wise-success mt-1">{pipeline.conversionRate}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
