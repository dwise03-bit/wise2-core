'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '../ui';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  href: string;
  color: string;
}

export function QuickActionsPanel() {
  const actions: QuickAction[] = [
    {
      icon: '🔥',
      label: 'Add New Lead',
      description: 'Create a new lead from website or call',
      href: '/hvac/leads/new',
      color: 'bg-wise-blue/10 border-wise-blue/50 hover:bg-wise-blue/20',
    },
    {
      icon: '👥',
      label: 'Add New Customer',
      description: 'Register a new customer',
      href: '/hvac/customers/new',
      color: 'bg-wise-neon/10 border-wise-neon/50 hover:bg-wise-neon/20',
    },
    {
      icon: '📄',
      label: 'Create Estimate',
      description: 'Generate Good/Better/Best estimate',
      href: '/hvac/estimates/new',
      color: 'bg-wise-purple/10 border-wise-purple/50 hover:bg-wise-purple/20',
    },
    {
      icon: '📅',
      label: 'Schedule Job',
      description: 'Book a service appointment',
      href: '/hvac/jobs/new',
      color: 'bg-wise-orange/10 border-wise-orange/50 hover:bg-wise-orange/20',
    },
    {
      icon: '📞',
      label: 'Add Follow-Up',
      description: 'Create manual follow-up task',
      href: '/hvac/follow-ups/new',
      color: 'bg-wise-success/10 border-wise-success/50 hover:bg-wise-success/20',
    },
  ];

  return (
    <Card className="p-6 border border-wise-electric/20">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">QUICK ACTIONS</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <div className={`p-4 rounded-lg border cursor-pointer transition-all ${action.color}`}>
                <p className="text-2xl mb-2">{action.icon}</p>
                <p className="font-semibold text-sm text-text-primary">{action.label}</p>
                <p className="text-xs text-text-secondary mt-1">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
