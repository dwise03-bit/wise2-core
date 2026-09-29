'use client';

import React from 'react';
import { SectionScaffold } from '../../../src/components/revenue-os';

export default function RevenueAutomationsPage() {
  return (
    <SectionScaffold
      title="Automations"
      description="Triggers and follow-up sequences behind the AI workforce"
      plannedEndpoint="GET /api/revenue-os/automations — not in the current contract"
      links={[
        {
          label: 'Workflows',
          href: '/dashboard/workflows',
          description: 'The existing Command Center automation builder',
        },
        {
          label: 'AI Workforce',
          href: '/revenue-os/agents',
          description: 'Agents these automations drive',
        },
      ]}
    />
  );
}
