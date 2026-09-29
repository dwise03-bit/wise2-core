/**
 * Workforce Header Component
 * Title, search, and action buttons
 */

'use client';

export function WorkforceHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wise-text-primary">Digital Workforce</h1>
          <p className="text-wise-text-secondary mt-1">
            Manage your AI team, assign tasks, and monitor performance
          </p>
        </div>
        <button className="
          px-4 py-2 bg-wise-blue-electric text-black font-semibold rounded-md
          hover:opacity-90 active:scale-95 transition-all
          flex items-center gap-2
        ">
          <span>+</span>
          <span>Add Agent</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search agents by name or role..."
            className="
              w-full px-4 py-2 rounded-lg
              bg-wise-surface-2 border border-wise-border
              text-wise-text-primary placeholder-wise-text-secondary
              focus:outline-none focus:border-wise-blue-electric
              transition-colors
            "
          />
          <svg
            className="absolute right-3 top-2.5 w-5 h-5 text-wise-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter buttons */}
        <button className="
          px-4 py-2 rounded-lg
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          transition-colors
        ">
          Status
        </button>
        <button className="
          px-4 py-2 rounded-lg
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          transition-colors
        ">
          Role
        </button>
        <button className="
          px-4 py-2 rounded-lg
          bg-wise-surface-1 border border-wise-border
          text-wise-text-secondary hover:text-wise-text-primary
          transition-colors
        ">
          Availability
        </button>
      </div>
    </div>
  );
}
