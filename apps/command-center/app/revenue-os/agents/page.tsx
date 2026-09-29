'use client';

import React from 'react';
import {
  WorkforcePanel,
  normalizeAgents,
  useRevenueData,
} from '../../../src/components/revenue-os';

export default function RevenueAgentsPage() {
  const agents = useRevenueData('/agents', normalizeAgents);

  return (
    <div className="space-y-5">
      <WorkforcePanel
        agents={agents.data}
        state={agents.state}
        onRetry={agents.refetch}
        showLink={false}
      />
    </div>
  );
}
