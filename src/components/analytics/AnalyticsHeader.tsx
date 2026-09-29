/**
 * Analytics Header Component
 */

'use client';

export function AnalyticsHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wise-text-primary">Analytics & Insights</h1>
          <p className="text-wise-text-secondary mt-1">
            Track business performance and monitor key metrics
          </p>
        </div>
      </div>

      {/* Date range and export */}
      <div className="flex gap-2">
        <button className="
          px-3 py-2 text-sm font-medium
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          rounded transition-colors
        ">
          This Month
        </button>
        <button className="
          px-3 py-2 text-sm font-medium
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          rounded transition-colors
        ">
          Last 3 Months
        </button>
        <button className="
          px-3 py-2 text-sm font-medium
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          rounded transition-colors ml-auto
        ">
          Export Report
        </button>
      </div>
    </div>
  );
}
