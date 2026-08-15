/**
 * Brain Stats Component
 */

'use client';

export function BrainStats() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-wise-text-primary">Brain Status</h2>

      <div className="rounded-lg bg-wise-purple-ai/10 border border-wise-purple-ai/30 p-4">
        <div className="text-sm font-medium text-wise-text-secondary mb-2">
          Knowledge Index
        </div>
        <div className="text-2xl font-bold text-wise-purple-ai">12,847</div>
        <div className="text-xs text-wise-text-secondary mt-1">
          Documents, conversations, and insights
        </div>
      </div>

      <div className="space-y-2">
        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Last Indexed</span>
            <span className="text-sm font-medium text-wise-text-primary">2 hours ago</span>
          </div>
        </div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Insights</span>
            <span className="text-sm font-medium text-wise-text-primary">487</span>
          </div>
          <div className="text-xs text-wise-text-secondary">Generated this month</div>
        </div>

        <div className="p-3 bg-wise-surface-1 rounded border border-wise-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-wise-text-secondary">Hermes Queries</span>
            <span className="text-sm font-medium text-wise-text-primary">1,234</span>
          </div>
          <div className="text-xs text-wise-text-secondary">This week</div>
        </div>
      </div>

      <button className="
        w-full px-3 py-2 text-xs font-semibold
        bg-wise-purple-ai text-white
        rounded hover:opacity-90 transition-opacity
      ">
        Ask Hermes
      </button>
    </div>
  );
}
