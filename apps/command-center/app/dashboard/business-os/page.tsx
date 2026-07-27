'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function BusinessOSPage() {
  const { user } = useAuth();

  const modules = [
    {
      icon: '👥',
      title: 'CRM & Customers',
      description: 'Manage customer relationships and accounts',
      status: 'AVAILABLE',
      link: '/dashboard/leads',
    },
    {
      icon: '💰',
      title: 'Billing & Subscriptions',
      description: 'View and manage your subscription and invoices',
      status: 'AVAILABLE',
      link: '/dashboard/billing',
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View usage and performance metrics',
      status: 'AVAILABLE',
      link: '/dashboard/analytics',
    },
    {
      icon: '⚡',
      title: 'Automation',
      description: 'Set up workflows and automations',
      status: 'COMING SOON',
      link: '#',
    },
    {
      icon: '📋',
      title: 'Consulting',
      description: 'Manage consulting engagements and deliverables',
      status: 'COMING SOON',
      link: '#',
    },
    {
      icon: '🔍',
      title: 'Audits',
      description: 'Security audits, compliance reviews, and assessments',
      status: 'COMING SOON',
      link: '#',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Business OS</h1>
        <p className="text-text-secondary">
          Manage customers, billing, and analytics
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const isAvailable = module.status === 'AVAILABLE';
          return (
            <Link
              key={module.title}
              href={isAvailable ? module.link : '#'}
              className={`group ${!isAvailable ? 'cursor-not-allowed' : ''}`}
            >
              <div
                className={`bg-wise-surface border border-wise-border rounded-lg p-8 h-full transition-all ${
                  isAvailable
                    ? 'hover:border-wise-electric/50 hover:bg-wise-surface/80'
                    : 'opacity-60'
                }`}
              >
                <span className="text-4xl block mb-4">{module.icon}</span>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-wise-electric transition-colors">
                  {module.title}
                </h3>
                <p className="text-text-muted mb-4">{module.description}</p>
                <span
                  className={`inline-block text-xs px-3 py-1 rounded font-semibold ${
                    isAvailable
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {module.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
