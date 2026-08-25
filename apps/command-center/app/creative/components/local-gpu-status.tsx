import React, { useEffect, useState } from 'react';

interface GPUStatus {
  online: boolean;
  vram: {
    total: number;
    used: number;
    free: number;
  };
  temperature: number;
  models: string[];
  generationsInProgress: number;
}

export function LocalGPUStatus() {
  const [status, setStatus] = useState<GPUStatus>({
    online: true,
    vram: {
      total: 24,
      used: 12.5,
      free: 11.5,
    },
    temperature: 68,
    models: ['SDXL 1.0', 'Flux', 'ControlNet'],
    generationsInProgress: 2,
  });

  const vramUsagePercent = (status.vram.used / status.vram.total) * 100;
  const tempPercent = (status.temperature / 100) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Local GPU (ComfyUI)
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={status.online ? 'text-green-400' : 'text-red-400'}>{status.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {status.online ? (
        <div className="space-y-4">
          {/* VRAM Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">VRAM</span>
              <span className="text-blue-400">{status.vram.used.toFixed(1)} / {status.vram.total} GB</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
                style={{ width: `${vramUsagePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Temperature</span>
              <span className={tempPercent > 80 ? 'text-red-400' : 'text-orange-400'}>
                {status.temperature}°C
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  tempPercent > 80
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                }`}
                style={{ width: `${tempPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Models Available */}
          <div>
            <span className="text-sm text-slate-300 block mb-2">Available Models</span>
            <div className="flex gap-2 flex-wrap">
              {status.models.map((model) => (
                <span
                  key={model}
                  className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-200"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>

          {/* Active Generations */}
          <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Active Generations</span>
              <span className="text-lg font-bold text-blue-400">{status.generationsInProgress}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p>GPU offline - check connection</p>
        </div>
      )}
    </div>
  );
}
