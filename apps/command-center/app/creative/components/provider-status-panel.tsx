import React from 'react';

interface ProviderStatus {
  name: string;
  online: boolean;
  freeCredits: string | number;
  paidCredits?: number;
}

interface Props {
  providers: ProviderStatus[];
}

export function ProviderStatusPanel({ providers }: Props) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <span className="text-2xl">🌐</span>
        Provider Status
      </h2>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  provider.online
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              ></div>
              <span className="font-medium">{provider.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                {provider.online ? (
                  <span className="text-green-400">
                    {typeof provider.freeCredits === 'number'
                      ? `${provider.freeCredits} credits`
                      : provider.freeCredits}
                  </span>
                ) : (
                  <span className="text-slate-500">Offline</span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  provider.online
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {provider.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-400 mb-2">Priority Order</p>
        <div className="text-xs text-slate-500 space-y-1">
          <p>1️⃣ Local GPU (free, fastest)</p>
          <p>2️⃣ Free Cloud Credits (Kling, Hailuo)</p>
          <p>3️⃣ Paid Cloud Credits (premium quality)</p>
        </div>
      </div>
    </div>
  );
}
