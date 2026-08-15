'use client';

import { useState } from 'react';

export default function StudioPage() {
  const [tracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  return (
    <div className="flex h-full gap-md p-md">
      {/* Left Sidebar: Projects & Library */}
      <aside className="w-64 bg-gray-900 rounded-lg border border-chrome/20 p-md overflow-y-auto">
        <h3 className="font-bold mb-lg">Projects</h3>
        <div className="space-y-md">
          <div className="p-md bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer">
            <p className="font-semibold">Summer Campaign</p>
            <p className="text-sm text-gray-500">4 tracks</p>
          </div>
        </div>

        <h3 className="font-bold mt-2xl mb-lg">Asset Library</h3>
        <div className="space-y-sm text-sm">
          <button className="w-full text-left p-md hover:bg-gray-800 rounded">📁 Samples</button>
          <button className="w-full text-left p-md hover:bg-gray-800 rounded">🎛️ Presets</button>
          <button className="w-full text-left p-md hover:bg-gray-800 rounded">✨ Effects</button>
        </div>
      </aside>

      {/* Center: Recording & Mixing */}
      <div className="flex-1 flex flex-col gap-md">
        {/* Transport Controls */}
        <div className="bg-gray-900 rounded-lg border border-chrome/20 p-md flex items-center gap-lg">
          <button className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center font-bold">
            ●
          </button>
          <button className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center">
            ▶
          </button>
          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            ⏹
          </button>
          <div className="flex-1 flex items-center gap-md">
            <span className="font-mono text-lg">00:00:00</span>
            <div className="flex-1 h-1 bg-gray-700 rounded cursor-pointer" />
          </div>
        </div>

        {/* Track Editor */}
        <div className="flex-1 bg-gray-900 rounded-lg border border-chrome/20 p-md overflow-y-auto">
          <div className="space-y-md">
            {tracks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-md">No tracks yet</p>
                  <button className="px-lg py-md bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-md">
                    Import Audio
                  </button>
                </div>
              </div>
            ) : (
              tracks.map((track, i) => (
                <div
                  key={i}
                  className={`p-md rounded-lg border cursor-pointer transition-colors ${
                    selectedTrack === track.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-chrome/50'
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="flex items-center gap-md mb-sm">
                    <button className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600">▶</button>
                    <span className="font-semibold flex-1">{track.name}</span>
                    <span className="text-sm text-gray-500">{track.duration}s</span>
                  </div>
                  <div className="h-16 bg-gray-950 rounded flex items-center">
                    <div className="w-full h-full flex items-center">
                      {/* Waveform visualization */}
                      <svg className="w-full h-full" viewBox="0 0 1000 100">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <line
                            key={i}
                            x1={i * 20}
                            y1={50}
                            x2={i * 20}
                            y2={50 - Math.random() * 40}
                            stroke="#00D9FF"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Mixer & Effects */}
      <aside className="w-64 bg-gray-900 rounded-lg border border-chrome/20 p-md overflow-y-auto">
        <h3 className="font-bold mb-lg">Mixer</h3>
        {selectedTrack ? (
          <div className="space-y-md">
            <div>
              <label className="text-sm text-gray-400">Volume</label>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Pan</label>
              <input type="range" min="-100" max="100" defaultValue="0" className="w-full" />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Select a track to adjust</p>
        )}

        <h3 className="font-bold mt-2xl mb-lg">Effects</h3>
        <div className="space-y-md">
          <button className="w-full p-md bg-gray-800 hover:bg-gray-700 rounded text-left">
            <p className="font-semibold text-sm">+ Add Effect</p>
          </button>
        </div>
      </aside>
    </div>
  );
}
