'use client';

import React from 'react';
import Link from 'next/link';
import { Users, BarChart3, DollarSign, Zap } from 'lucide-react';

export default function BusinessOSDashboard() {
  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-wise-primary mb-2">Business OS</h1>
          <p className="text-wise-text-secondary">Manage customers, billing, and analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Users,
              title: 'CRM & Customers',
              description: 'Manage customer relationships and accounts',
              status: 'AVAILABLE',
              link: '/crm',
            },
            {
              icon: DollarSign,
              title: 'Billing & Subscriptions',
              description: 'View and manage your subscription and invoices',
              status: 'AVAILABLE',
              link: '/dashboard/subscription',
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              description: 'View usage and performance metrics',
              status: 'AVAILABLE',
              link: '/dashboard',
            },
            {
              icon: Zap,
              title: 'Automation',
              description: 'Set up workflows and automations',
              status: 'COMING SOON',
              link: '#',
            },
          ].map((module) => {
            const Icon = module.icon;
            const isAvailable = module.status === 'AVAILABLE';
            return (
              <Link
                key={module.title}
                href={isAvailable ? module.link : '#'}
                className={`${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-8 h-full hover:border-wise-primary-hover/50 transition-all">
                  <Icon className="w-12 h-12 text-wise-primary mb-4" />
                  <h3 className="text-xl font-bold text-wise-text-primary mb-2">{module.title}</h3>
                  <p className="text-wise-text-muted mb-4">{module.description}</p>
                  <div className={`inline-block text-xs px-3 py-1 rounded ${
                    isAvailable
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {module.status}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
