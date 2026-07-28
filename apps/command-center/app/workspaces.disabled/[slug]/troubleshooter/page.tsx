/**
 * Master Troubleshooter Page
 * Proactive issue detection, diagnostics, and recommendations
 */

'use client';

import React from 'react';
import { TroubleshooterHeader } from '@/src/components/troubleshooter/TroubleshooterHeader';
import { IssuesList } from '@/src/components/troubleshooter/IssuesList';
import { SystemHealth } from '@/src/components/troubleshooter/SystemHealth';

export default function TroubleshooterPage() {
  return (
    <div className="p-6 space-y-6">
      <TroubleshooterHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IssuesList />
        </div>
        <div>
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
