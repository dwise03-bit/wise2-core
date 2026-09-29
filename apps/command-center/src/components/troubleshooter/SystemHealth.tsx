/**
 * System Health Component
 * Overall system status and quick metrics
 */

'use client';

export function SystemHealth() {
  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="rounded-lg bg-wise-orange-warning/10 border border-wise-orange-warning/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-wise-orange-warning rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-wise-orange-warning">REQUIRES ATTENTION</span>
        </div>
        <div className="text-2xl font-bold text-wise-orange-warning">72%</div>
        <div className="text-xs text-wise-text-secondary mt-1">System Health Score</div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-wise-text-primary">Key Metrics</div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">API Latency</span>
            <span className="text-sm font-semibold text-wise-orange-warning">1.2s</span>
          </div>
          <div className="text-xs text-wise-text-secondary">+45% vs baseline</div>
        </div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Error Rate</span>
            <span className="text-sm font-semibold text-wise-red-alert">0.8%</span>
          </div>
          <div className="text-xs text-wise-text-secondary">+0.3% vs yesterday</div>
        </div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Uptime</span>
            <span className="text-sm font-semibold text-wise-green-neon">99.95%</span>
          </div>
          <div className="text-xs text-wise-text-secondary">This month</div>
        </div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Issues Found</span>
            <span className="text-sm font-semibold text-wise-orange-warning">4</span>
          </div>
          <div className="text-xs text-wise-text-secondary">1 High, 2 Medium, 1 Low</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-3 border-t border-wise-border">
        <button className="
          w-full px-3 py-2 text-xs font-semibold
          bg-wise-green-neon text-black
          rounded hover:opacity-90 transition-opacity
        ">
          Resolve All Issues
        </button>
        <button className="
          w-full px-3 py-2 text-xs font-semibold
          bg-wise-surface-2 border border-wise-border
          text-wise-text-primary
          rounded hover:bg-wise-surface-1 transition-colors
        ">
          Run Diagnostics
        </button>
      </div>
    </div>
  );
}
