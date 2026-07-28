'use client';

import React from 'react';
import Link from 'next/link';

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

const statusColor = {
  hot: 'bg-[var(--danger)] text-white',
  warm: 'bg-[var(--warning)] text-[var(--wise-black)]',
  cold: 'bg-[var(--border-medium)] text-[var(--text-secondary)]',
  closed: 'bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)]',
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
    <div className="min-h-screen bg-[var(--wise-black)] text-[var(--text-primary)]">
      <nav className="border-b border-[var(--border-medium)] bg-[var(--wise-black)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-[var(--organized-chaos-green)] font-bold">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">🔥 Sales Leads</h1>
          </div>
          <button className="px-4 py-2 bg-[var(--organized-chaos-green)] text-[var(--wise-black)] rounded-lg font-semibold hover:shadow-lg transition-all">
            + New Lead
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-start justify-between p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg hover:border-[var(--organized-chaos-green)] hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{lead.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{lead.company}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{lead.email}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-2 ${statusColor[lead.status]}`}>
                  {lead.status.toUpperCase()}
                </div>
                <div className="text-lg font-bold text-[var(--organized-chaos-green)]">
                  ${lead.value.toLocaleString()}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {lead.daysWaiting} days waiting for follow-up
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
