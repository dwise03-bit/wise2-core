'use client';

import React from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'trial' | 'at_risk';
  plan: string;
  monthlyValue: number;
  joinDate: string;
}

const statusColor = {
  active: 'bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)]',
  inactive: 'bg-[var(--border-medium)] text-[var(--text-secondary)]',
  trial: 'bg-[var(--warning)] bg-opacity-20 text-[var(--warning)]',
  at_risk: 'bg-[var(--danger)] bg-opacity-20 text-[var(--danger)]',
};

export default function CustomersPage() {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Acme Corp',
      email: 'contact@acmecorp.com',
      status: 'active',
      plan: 'Pro',
      monthlyValue: 2500,
      joinDate: 'Jan 2024',
    },
    {
      id: '2',
      name: 'TechStartup Inc',
      email: 'team@techstartup.com',
      status: 'active',
      plan: 'Startup',
      monthlyValue: 299,
      joinDate: 'Mar 2024',
    },
    {
      id: '3',
      name: 'Global Services',
      email: 'admin@globalservices.com',
      status: 'active',
      plan: 'Enterprise',
      monthlyValue: 5000,
      joinDate: 'Dec 2023',
    },
    {
      id: '4',
      name: 'Local Business Co',
      email: 'owner@localbiz.com',
      status: 'trial',
      plan: 'Trial',
      monthlyValue: 0,
      joinDate: 'Jul 2024',
    },
  ];

  const totalMRR = customers
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyValue, 0);

  return (
    <div className="min-h-screen bg-[var(--wise-black)] text-[var(--text-primary)]">
      <nav className="border-b border-[var(--border-medium)] bg-[var(--wise-black)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-[var(--organized-chaos-green)] font-bold">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">👥 Customers</h1>
          </div>
          <button className="px-4 py-2 bg-[var(--organized-chaos-green)] text-[var(--wise-black)] rounded-lg font-semibold hover:shadow-lg transition-all">
            + Import Customers
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-[var(--wise-steel)] border border-[var(--organized-chaos-green)] rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Monthly Recurring Revenue
            </div>
            <div className="text-3xl font-bold text-[var(--organized-chaos-green)] mt-2">
              ${totalMRR.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Active Customers
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">
              {customers.filter((c) => c.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex items-start justify-between p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg hover:border-[var(--organized-chaos-green)] hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{customer.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{customer.email}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Joined {customer.joinDate}</p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-2 ${statusColor[customer.status]}`}
                >
                  {customer.status.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-sm font-medium text-[var(--text-secondary)]">{customer.plan}</div>
                <div className="text-lg font-bold text-[var(--organized-chaos-green)] mt-1">
                  ${customer.monthlyValue.toLocaleString()}/mo
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
