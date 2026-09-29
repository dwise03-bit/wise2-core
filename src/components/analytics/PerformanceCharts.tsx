/**
 * Performance Charts Component
 */

'use client';

export function PerformanceCharts() {
  return (
    <div className="space-y-4">
      {/* Revenue Trend */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
        <h3 className="text-lg font-semibold text-wise-text-primary mb-4">
          Revenue Trend
        </h3>
        <div className="h-48 bg-wise-surface-2/50 rounded flex items-end justify-around gap-2 p-4">
          {[65, 72, 68, 85, 92, 78, 95, 87, 102, 110, 105, 120].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-wise-blue-electric to-wise-blue-electric/50 rounded-t"
              style={{ height: `${height * 1.5}px` }}
            />
          ))}
        </div>
        <div className="mt-4 text-xs text-wise-text-secondary text-center">
          Last 12 months revenue progression
        </div>
      </div>

      {/* Customer Growth */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
        <h3 className="text-lg font-semibold text-wise-text-primary mb-4">
          Customer Growth
        </h3>
        <div className="h-48 bg-wise-surface-2/50 rounded flex items-end justify-around gap-2 p-4">
          {[40, 52, 61, 68, 75, 82, 88, 95, 102, 110, 118, 128].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-wise-green-neon to-wise-green-neon/50 rounded-t"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
        <div className="mt-4 text-xs text-wise-text-secondary text-center">
          New customers acquired per month
        </div>
      </div>
    </div>
  );
}
