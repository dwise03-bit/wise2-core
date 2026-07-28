/**
 * Analytics Dashboard Page
 * Business metrics, performance tracking, and insights
 */

'use client';

import React from 'react';
import { AnalyticsHeader } from '@/src/components/analytics/AnalyticsHeader';
import { KeyMetrics } from '@/src/components/analytics/KeyMetrics';
import { PerformanceCharts } from '@/src/components/analytics/PerformanceCharts';
import { InsightsPanel } from '@/src/components/analytics/InsightsPanel';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader />
      <KeyMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceCharts />
        </div>
        <div>
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}
