'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  cta: string;
  href: string;
  icon: string;
}

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const steps: OnboardingStep[] = [
    {
      id: '1',
      title: 'Complete Business Profile',
      description: 'Set up your business name, contact info, and primary service offering',
      status: 'in_progress',
      cta: 'Continue Setup',
      href: '/onboarding/business-profile',
      icon: '📝',
    },
    {
      id: '2',
      title: 'Add Your First Lead',
      description: 'Bring in a prospect or hot lead to start building your pipeline',
      status: 'pending',
      cta: 'Add Lead',
      href: '/leads?new=true',
      icon: '🔥',
    },
    {
      id: '3',
      title: 'Add Services or Products',
      description: 'Define what you offer so leads can see pricing and services',
      status: 'pending',
      cta: 'Create Service',
      href: '/services?new=true',
      icon: '🎯',
    },
    {
      id: '4',
      title: 'Invite Your Team',
      description: 'Add team members who can help manage leads and customers',
      status: 'pending',
      cta: 'Invite Team',
      href: '/settings/team',
      icon: '👥',
    },
    {
      id: '5',
      title: 'Connect Your Tools',
      description: 'Link email, calendar, and CRM tools you already use',
      status: 'pending',
      cta: 'Connect Integrations',
      href: '/settings/integrations',
      icon: '⚙️',
    },
    {
      id: '6',
      title: 'Launch Command Center',
      description: 'You\'re ready to run your business from WISE²!',
      status: 'pending',
      cta: 'Go to Dashboard',
      href: '/dashboard',
      icon: '🚀',
    },
  ];

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  const statusColor = {
    completed: 'bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)]',
    in_progress:
      'bg-[var(--warning)] bg-opacity-20 text-[var(--warning)]',
    pending: 'bg-[var(--border-medium)] text-[var(--text-secondary)]',
  };

  return (
    <div className="min-h-screen bg-[var(--wise-black)] text-[var(--text-primary)]">
      <nav className="border-b border-[var(--border-medium)] bg-[var(--wise-black)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[var(--organized-chaos-green)]">
            🚀 Welcome to WISE²
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Let's get your business operational in 6 easy steps
          </p>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Progress */}
        <section className="bg-gradient-to-br from-[var(--wise-steel)] to-[var(--wise-black)] border border-[var(--organized-chaos-green)] rounded-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[var(--organized-chaos-green)]">
                {progressPercent}%
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                {completedSteps} of {steps.length} steps complete
              </div>
            </div>
            {progressPercent === 100 && (
              <div className="text-5xl">🎉</div>
            )}
          </div>
          <div className="w-full bg-[var(--wise-black)] rounded-full h-3 overflow-hidden border border-[var(--border-medium)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--organized-chaos-green)] to-[var(--organized-chaos-green)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        {/* Quick Setup */}
        {!businessName && (
          <section className="bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Quick Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g., Acme Services"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--wise-black)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] focus:border-[var(--organized-chaos-green)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">What do you do?</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--wise-black)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] focus:border-[var(--organized-chaos-green)] focus:outline-none"
                >
                  <option value="">Select your business type</option>
                  <option value="services">Services (consulting, freelance, etc.)</option>
                  <option value="product">Product (SaaS, software, etc.)</option>
                  <option value="agency">Agency (marketing, design, etc.)</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                disabled={!businessName || !businessType}
                className="w-full px-4 py-3 bg-[var(--organized-chaos-green)] text-[var(--wise-black)] rounded-lg font-semibold disabled:bg-[var(--border-medium)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Continue to Setup
              </button>
            </div>
          </section>
        )}

        {/* Steps */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold mb-4">Onboarding Steps</h2>
          {steps.map((step, index) => (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                step.status === 'completed'
                  ? 'bg-[var(--wise-steel)] border-[var(--organized-chaos-green)]'
                  : step.status === 'in_progress'
                    ? 'bg-gradient-to-r from-[var(--wise-steel)] to-[var(--wise-black)] border-[var(--warning)]'
                    : 'bg-[var(--wise-steel)] border-[var(--border-medium)] hover:border-[var(--organized-chaos-green)]'
              }`}
            >
              <div className="text-3xl shrink-0">{step.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${statusColor[step.status]}`}
                  >
                    {step.status === 'completed' ? '✓ Done' : step.status === 'in_progress' ? 'In Progress' : 'Next'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
              </div>
              <button className="shrink-0 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)] hover:bg-opacity-30 transition-all">
                {step.cta}
              </button>
            </Link>
          ))}
        </section>

        {/* Help */}
        <section className="bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">❓</div>
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Check out our guides or contact our support team
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)] rounded-lg text-sm font-semibold hover:bg-opacity-30 transition-all">
              View Guides
            </button>
            <button className="px-4 py-2 bg-[var(--organized-chaos-green)] text-[var(--wise-black)] rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
              Contact Support
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
