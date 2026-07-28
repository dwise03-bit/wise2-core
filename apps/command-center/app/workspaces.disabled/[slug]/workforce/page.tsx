/**
 * Digital Workforce Management Page
 * Manage AI agents, their status, capabilities, and workloads
 */

'use client';

import React from 'react';
import { WorkforceHeader } from '@/src/components/workforce/WorkforceHeader';
import { WorkforceGrid } from '@/src/components/workforce/WorkforceGrid';
import { WorkforceStats } from '@/src/components/workforce/WorkforceStats';

export default function WorkforcePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and actions */}
      <WorkforceHeader />

      {/* Overview statistics */}
      <WorkforceStats />

      {/* AI Team Grid */}
      <WorkforceGrid />
    </div>
  );
}
