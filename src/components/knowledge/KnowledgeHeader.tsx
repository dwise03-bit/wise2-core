/**
 * Knowledge Header Component
 */

'use client';

export function KnowledgeHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wise-text-primary">Knowledge & Brain</h1>
          <p className="text-wise-text-secondary mt-1">
            Access organizational intelligence, documents, and continuous learning
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-wise-purple-ai/10 border border-wise-purple-ai/30 rounded-lg">
          <span className="text-lg">🧠</span>
          <span className="text-sm font-medium text-wise-purple-ai">Hermes Connected</span>
        </div>
      </div>
    </div>
  );
}
