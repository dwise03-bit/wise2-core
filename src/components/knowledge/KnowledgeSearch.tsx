/**
 * Knowledge Search Component
 */

'use client';

export function KnowledgeSearch() {
  return (
    <div className="relative">
      <div className="
        flex items-center gap-3 px-4 py-3 rounded-lg
        bg-wise-surface-1 border border-wise-border
        focus-within:border-wise-blue-electric transition-colors
      ">
        <svg
          className="w-5 h-5 text-wise-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Ask Hermes anything... 'What's our customer retention rate?' 'How do we process orders?'"
          className="
            flex-1 bg-transparent text-wise-text-primary placeholder-wise-text-secondary
            focus:outline-none
          "
        />
        <button className="
          px-3 py-1 text-xs font-semibold
          bg-wise-blue-electric text-black
          rounded hover:opacity-90 transition-opacity
        ">
          Search
        </button>
      </div>
    </div>
  );
}
