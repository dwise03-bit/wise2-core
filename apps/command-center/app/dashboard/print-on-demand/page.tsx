'use client';

import React from 'react';
import Link from 'next/link';

export default function PrintOnDemandPage() {
  const features = [
    { title: 'Designer', status: 'COMING SOON', icon: '🎨', description: 'Create custom DTF designs with drag-and-drop canvas' },
    { title: 'Gang Sheets', status: 'PLANNED', icon: '📐', description: 'Optimize print layouts for maximum yield' },
    { title: 'Print Queue', status: 'PLANNED', icon: '🖨️', description: 'Manage and track print jobs in real time' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
          <span className="text-2xl">🖨️</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">DTF Print Studio</h1>
          <p className="text-text-secondary">Design, manage, and print on-demand products</p>
        </div>
      </div>

      {/* Setup Required Notice */}
      <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
        <span className="text-6xl block mb-4">⚠️</span>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Setup Required</h3>
        <p className="text-text-muted mb-8 max-w-2xl mx-auto">
          The DTF Print Studio integrates with direct-to-film printing technology. Backend printer integration and configuration is required before this module becomes available.
        </p>

        {/* Feature Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-wise-black/30 border border-wise-border/30 rounded-lg p-6 text-left"
            >
              <span className="text-3xl block mb-3">{feature.icon}</span>
              <h4 className="font-semibold text-text-primary mb-2">{feature.title}</h4>
              <p className="text-sm text-text-muted mb-3">{feature.description}</p>
              <span className="text-xs px-2 py-1 bg-gray-500/10 text-gray-400 rounded">
                {feature.status}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
