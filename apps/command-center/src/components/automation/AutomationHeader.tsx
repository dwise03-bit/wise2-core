/**
 * Automation Header Component
 */

'use client';

export function AutomationHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wise-text-primary">Automation & Workflows</h1>
          <p className="text-wise-text-secondary mt-1">
            Build and manage automated business processes
          </p>
        </div>
        <button className="
          px-4 py-2 bg-wise-blue-electric text-black font-semibold rounded-md
          hover:opacity-90 active:scale-95 transition-all
          flex items-center gap-2
        ">
          <span>+</span>
          <span>New Workflow</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-wise-border">
        <button className="
          px-3 py-2 text-sm font-medium
          text-wise-blue-electric border-b-2 border-wise-blue-electric
          hover:opacity-90 transition-opacity
        ">
          All Workflows
        </button>
        <button className="
          px-3 py-2 text-sm font-medium
          text-wise-text-secondary hover:text-wise-text-primary
          border-b-2 border-transparent transition-colors
        ">
          Active
        </button>
        <button className="
          px-3 py-2 text-sm font-medium
          text-wise-text-secondary hover:text-wise-text-primary
          border-b-2 border-transparent transition-colors
        ">
          Drafts
        </button>
        <button className="
          px-3 py-2 text-sm font-medium
          text-wise-text-secondary hover:text-wise-text-primary
          border-b-2 border-transparent transition-colors
        ">
          Scheduled
        </button>
      </div>
    </div>
  );
}
