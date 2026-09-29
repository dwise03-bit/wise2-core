'use client';

import React from 'react';
import { SectionScaffold } from '../../../src/components/revenue-os';

export default function RevenueCustomersPage() {
  return (
    <SectionScaffold
      title="Customers"
      description="Accounts, service history, and membership status"
      plannedEndpoint="GET /api/revenue-os/customers — not in the current contract"
      links={[
        {
          label: 'CRM / Customers',
          href: '/dashboard/customers',
          description: 'The existing Command Center customer list',
        },
        {
          label: 'Revenue OS Leads',
          href: '/revenue-os/leads',
          description: 'Pipeline of leads on their way to becoming customers',
        },
      ]}
    />
  );
}
