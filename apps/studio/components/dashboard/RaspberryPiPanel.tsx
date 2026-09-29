'use client';

import React from 'react';

export function RaspberryPiPanel({ systemData }: any) {
  return (
    <div className="bg-gradient-to-br from-[#161616] to-[#101010] border border-emerald-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🍓</span>
        <h3 className="text-sm font-bold text-white">RASPBERRY PI</h3>
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-500 mb-1">Model</p>
            <p className="font-semibold text-white">RPi 3B+</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Uptime</p>
            <p className="font-semibold text-white">42d 15h</p>
          </div>
        </div>

        <div className="bg-[#050505] rounded p-2">
          <p className="text-gray-500 mb-1">Load Average</p>
          <p className="font-mono text-emerald-400">0.42 | 0.38 | 0.35</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">CPU</span>
            <span className="font-semibold">28%</span>
          </div>
          <div className="w-full h-1 bg-[#050505] rounded overflow-hidden">
            <div className="h-full w-1/4 bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
