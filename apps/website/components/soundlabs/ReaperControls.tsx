'use client';

import { useState } from 'react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';

export function ReaperControls() {
  const { reaperTransport, isLoading } = useSoundLabsProduction();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [position, setPosition] = useState(0);

  const handleTransport = async (action: 'play' | 'stop' | 'record' | 'pause') => {
    const success = await reaperTransport(action);
    if (success) {
      if (action === 'play') setIsPlaying(true);
      if (action === 'stop' || action === 'pause') setIsPlaying(false);
      if (action === 'record') setIsRecording(!isRecording);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transport Controls */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-8">REAPER Transport Control</h3>

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00D9FF]/60 text-sm">Playhead</span>
            <span className="text-white font-semibold font-mono">
              {Math.floor(position / 60)}:{String(position % 60).padStart(2, '0')}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3600"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => handleTransport('play')}
            disabled={isLoading || isRecording}
            className={`w-16 h-16 rounded-full font-bold text-lg transition-all ${
              isPlaying
                ? 'bg-gradient-to-br from-[#00D9FF] to-[#00FF7F] text-[#050607] shadow-lg shadow-[#00D9FF]/50'
                : 'bg-[#050607] border-2 border-[#00D9FF]/50 text-[#00D9FF] hover:border-[#00D9FF]'
            }`}
          >
            ▶
          </button>

          <button
            onClick={() => handleTransport('pause')}
            disabled={isLoading || !isPlaying}
            className="w-16 h-16 rounded-full font-bold text-lg transition-all bg-[#050607] border-2 border-[#00D9FF]/30 text-[#00D9FF] hover:border-[#00D9FF]"
          >
            ⏸
          </button>

          <button
            onClick={() => handleTransport('stop')}
            disabled={isLoading}
            className="w-16 h-16 rounded-full font-bold text-lg transition-all bg-[#050607] border-2 border-[#00D9FF]/30 text-[#00D9FF] hover:border-[#00D9FF]"
          >
            ⏹
          </button>

          <button
            onClick={() => handleTransport('record')}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full font-bold text-lg transition-all ${
              isRecording
                ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-[#050607] border-2 border-red-500/30 text-red-400 hover:border-red-500'
            }`}
          >
            ⏺
          </button>
        </div>

        {/* Mixer Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Master', 'Drums', 'Bass', 'Melody'].map((track) => (
            <div key={track} className="p-3 rounded-lg bg-[#050607] border border-[#00D9FF]/10">
              <p className="text-xs text-[#00D9FF]/60 mb-2">{track}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 bg-[#0a0a0c] rounded flex items-center overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D9FF] to-[#00FF7F]"
                    style={{ width: Math.random() * 70 + '%' }}
                  />
                </div>
                <span className="text-xs text-white font-semibold w-8">-∞</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effects Rack */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h4 className="text-lg font-semibold text-white mb-4">Effects Rack</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Reverb', 'Delay', 'Compression', 'EQ'].map((effect) => (
            <div
              key={effect}
              className="p-4 rounded-lg bg-[#050607] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{effect}</span>
                <span className="text-[#00D9FF] text-sm">ON</span>
              </div>
              <div className="h-1 bg-[#0a0a0c] rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-[#00D9FF] to-[#00FF7F]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
