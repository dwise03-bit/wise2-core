'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '../../../src/components/ui';

export default function FollowUpsPage() {
  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-wise-electric">Follow-Ups</h1>
            <p className="text-text-secondary mt-1">Track and manage action items</p>
          </div>
          <Link href="/hvac/follow-ups/new">
            <Button>+ New Follow-Up</Button>
          </Link>
        </div>

        <Card className="p-8 text-center">
          <p className="text-text-muted">Follow-up management interface coming soon</p>
        </Card>
      </div>
    </div>
  );
}
