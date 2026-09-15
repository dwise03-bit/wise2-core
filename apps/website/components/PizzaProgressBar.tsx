'use client';

export function PizzaProgressBar({ progress = 45 }: { progress?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-xs h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-bold text-neon-green tracking-widest">{progress}% COMPLETE</span>
    </div>
  );
}
