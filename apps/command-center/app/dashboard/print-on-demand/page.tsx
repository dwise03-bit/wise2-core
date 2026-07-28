'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '../../../src/components/ui';

export default function PrintOnDemandPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary-bright">DTF Print Studio</h1>
        <p className="text-sm text-text-secondary mt-1">Design, manage, and print on-demand products</p>
      </div>

      {/* Setup Required */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Setup Required</h2>
          <Badge variant="warning">Not Available</Badge>
        </div>
        <p className="text-xs text-text-muted mb-4">
          The DTF Print Studio integrates with direct-to-film printing technology. Backend printer integration and configuration is required before this module becomes available.
        </p>
      </Card>

      {/* Feature Roadmap */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Feature Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Designer', status: 'Coming Soon', desc: 'Create custom DTF designs with drag-and-drop canvas' },
            { title: 'Gang Sheets', status: 'Coming Soon', desc: 'Optimize print layouts for maximum yield' },
            { title: 'Print Queue', status: 'Coming Soon', desc: 'Manage and track print jobs in real time' },
          ].map(f => (
            <Card key={f.title} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{f.title}</h3>
                <Badge variant="neutral">{f.status}</Badge>
              </div>
              <p className="text-xs text-text-muted">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
