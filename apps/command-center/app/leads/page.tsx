'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '../../src/components/ui';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'hot' | 'warm' | 'cold' | 'closed';
  value: number;
  lastContact: string;
  daysWaiting: number;
}

const statusBadges: Record<Lead['status'], 'danger' | 'warning' | 'neutral' | 'success'> = {
  hot: 'danger',
  warm: 'warning',
  cold: 'neutral',
  closed: 'success',
};

const statusLabels: Record<Lead['status'], string> = {
  hot: '🔥 Hot',
  warm: '⚠️ Warm',
  cold: '❄️ Cold',
  closed: '✓ Closed',
};

export default function LeadsPage() {
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      company: 'Acme Corp',
      email: 'sarah@acmecorp.com',
      status: 'hot',
      value: 15000,
      lastContact: '2 days ago',
      daysWaiting: 2,
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      company: 'TechStartup Inc',
      email: 'mike@techstartup.com',
      status: 'warm',
      value: 8500,
      lastContact: '7 days ago',
      daysWaiting: 7,
    },
    {
      id: '3',
      name: 'Jennifer Smith',
      company: 'Global Services',
      email: 'jennifer@globalservices.com',
      status: 'warm',
      value: 25000,
      lastContact: '5 days ago',
      daysWaiting: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      {/* Header */}
      <div className="sticky top-[var(--topbar-height)] z-20 border-b border-border-subtle bg-wise-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-wise-electric hover:text-wise-electric/80 font-bold transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-wise-neon mt-2">🔥 Sales Prospects</h1>
          </div>
          <Button variant="primary" size="md">
            + New Lead
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="space-y-3">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
              <Card interactive className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-text-primary truncate">{lead.name}</h3>
                  <p className="text-sm text-text-secondary">{lead.company}</p>
                  <p className="text-xs text-text-muted">{lead.email}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                  <Badge variant={statusBadges[lead.status]}>
                    {statusLabels[lead.status]}
                  </Badge>
                  <div className="text-lg font-bold text-wise-neon">
                    ${lead.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-text-muted whitespace-nowrap">
                    {lead.daysWaiting} days waiting
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
