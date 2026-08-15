'use client';

import React from 'react';
import { SectionScaffold } from '../../../src/components/revenue-os';

export default function RevenueDispatchPage() {
  return (
    <SectionScaffold
      title="Dispatch"
      description="Job board, technician assignment, and daily schedule"
      plannedEndpoint="GET /api/revenue-os/dispatch — not in the current contract"
      links={[
        {
          label: 'Booked Leads',
          href: '/revenue-os/leads',
          description: 'Leads that have reached the BOOKED stage',
        },
        {
          label: 'Live Ops',
          href: '/dashboard/live',
          description: 'Real-time operations view',
        },
      ]}
    />
  );
}
