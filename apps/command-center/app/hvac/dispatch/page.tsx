'use client';

import React from 'react';
import { Card } from '../../../src/components/ui';

export default function DispatchPage() {
  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-wise-electric">Dispatch Management</h1>
          <p className="text-text-secondary mt-1">Real-time technician tracking and assignment</p>
        </div>

        <Card className="p-8 text-center">
          <p className="text-text-muted">Dispatch interface coming soon</p>
        </Card>
      </div>
    </div>
  );
}
