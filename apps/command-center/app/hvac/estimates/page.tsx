'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '../../../src/components/ui';

export default function EstimatesPage() {
  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-wise-electric">Estimates</h1>
            <p className="text-text-secondary mt-1">Manage your estimate pipeline</p>
          </div>
          <Link href="/hvac/estimates/new">
            <Button>+ New Estimate</Button>
          </Link>
        </div>

        <Card className="p-8 text-center">
          <p className="text-text-muted">Estimate management interface coming soon</p>
        </Card>
      </div>
    </div>
  );
}
