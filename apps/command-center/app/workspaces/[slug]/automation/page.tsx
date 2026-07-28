/**
 * Automation & Workflows Page
 * Build, manage, and monitor automated workflows
 */

'use client';

import React from 'react';
import { AutomationHeader } from '@/src/components/automation/AutomationHeader';
import { WorkflowsList } from '@/src/components/automation/WorkflowsList';
import { AutomationStats } from '@/src/components/automation/AutomationStats';

export default function AutomationPage() {
  return (
    <div className="p-6 space-y-6">
      <AutomationHeader />
      <AutomationStats />
      <WorkflowsList />
    </div>
  );
}
