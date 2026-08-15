'use client';

import React, { useMemo, useState } from 'react';
import {
  HotLeadsTable,
  PipelineBoard,
  normalizeLeads,
  normalizePipeline,
  useRevenueData,
  PIPELINE_STAGES,
} from '../../../src/components/revenue-os';

export default function RevenueLeadsPage() {
  const leads = useRevenueData('/leads', normalizeLeads);
  const pipeline = useRevenueData('/leads/pipeline', normalizePipeline);
  const [stage, setStage] = useState<string>('ALL');

  const filtered = useMemo(() => {
    if (!leads.data) return null;
    const rows = stage === 'ALL' ? leads.data : leads.data.filter((l) => l.stage === stage);
    return [...rows].sort((a, b) => (b.opportunityValue ?? -1) - (a.opportunityValue ?? -1));
  }, [leads.data, stage]);

  return (
    <div className="space-y-5">
      <PipelineBoard columns={pipeline.data} state={pipeline.state} onRetry={pipeline.refetch} />

      {/* Stage filter. Horizontally scrollable so it never wraps on a phone. */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {['ALL', ...PIPELINE_STAGES].map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.06em] transition-colors ${
              stage === s
                ? 'border-wise-neon bg-wise-neon/10 text-wise-neon'
                : 'border-border-subtle text-text-muted hover:text-text-secondary'
            }`}
          >
            {s === 'ALL' ? 'All stages' : s}
          </button>
        ))}
      </div>

      <HotLeadsTable
        leads={filtered}
        state={leads.state}
        onRetry={leads.refetch}
        title="Leads"
        subtitle={
          stage === 'ALL' ? 'Every lead in the pipeline' : `Leads in stage ${stage}`
        }
      />
    </div>
  );
}
