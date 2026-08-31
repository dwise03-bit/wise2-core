'use client';

export function CrowdMode({ reactions }: { reactions: { [emoji: string]: number } }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(reactions).map(([emoji, count]) => (
          <div key={emoji} className="flex flex-col items-center">
            <div className="text-3xl animate-bounce" style={{ animationDelay: '0ms' }}>
              {emoji}
            </div>
            <span className="text-xs text-gray-400 mt-1">{count}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-3">
        React with emoji using the mob mode
      </p>
    </div>
  );
}
