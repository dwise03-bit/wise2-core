'use client';

import React from 'react';
import Link from 'next/link';

export default function PrintOnDemandPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">DTF Print Studio</h1>
        <p className="wise-page-subtitle">Design, manage, and print on-demand products</p>
      </div>

      {/* Setup Required */}
      <div className="wise-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Setup Required</h2>
          <span className="wise-badge-warning">Not Available</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          The DTF Print Studio integrates with direct-to-film printing technology. Backend printer integration and configuration is required before this module becomes available.
        </p>
      </div>

      {/* Feature Roadmap */}
      <div>
        <h2 className="wise-section-title mb-3">Feature Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Designer', status: 'Coming Soon', desc: 'Create custom DTF designs with drag-and-drop canvas' },
            { title: 'Gang Sheets', status: 'Coming Soon', desc: 'Optimize print layouts for maximum yield' },
            { title: 'Print Queue', status: 'Coming Soon', desc: 'Manage and track print jobs in real time' },
          ].map(f => (
            <div key={f.title} className="wise-card p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{f.title}</h3>
                <span className="wise-badge-neutral">{f.status}</span>
              </div>
              <p className="text-xs text-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/dashboard" className="wise-btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
