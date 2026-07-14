'use client';

/**
 * Master mixer panel - shows overall mix levels and master controls
 */

interface MasterMixerProps {
  masterVolume: number;
  peakLevel: number;
  rmsLevel: number;
  lufsLevel: number;
  onVolumeChange: (volume: number) => void;
}

export function MasterMixer({
  masterVolume,
  peakLevel,
  rmsLevel,
  lufsLevel,
  onVolumeChange,
}: MasterMixerProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onVolumeChange(value / 100);
  };

  const getMeterColor = (level: number): string => {
    if (level >= 0) return 'text-red-500';
    if (level >= -3) return 'text-yellow-500';
    if (level >= -12) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-950 border-2 border-blue-500/30 rounded-lg p-4">
      {/* Master Label */}
      <div className="border-b border-gray-700 pb-3">
        <h3 className="text-sm font-bold text-white">MASTER</h3>
        <p className="text-xs text-gray-500">Main output</p>
      </div>

      {/* Meter Readings */}
      <div className="grid grid-cols-3 gap-2 bg-gray-900 rounded p-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Peak</div>
          <div className={`text-lg font-mono font-bold ${getMeterColor(peakLevel)}`}>
            {peakLevel === -Infinity ? '-∞' : `${peakLevel.toFixed(1)}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">RMS</div>
          <div className={`text-lg font-mono font-bold ${getMeterColor(rmsLevel)}`}>
            {rmsLevel === -Infinity ? '-∞' : `${rmsLevel.toFixed(1)}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">LUFS</div>
          <div className={`text-lg font-mono font-bold ${getMeterColor(lufsLevel)}`}>
            {lufsLevel === -Infinity ? '-∞' : `${lufsLevel.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Master Fader */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-300">Master Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume * 100}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="text-xs text-gray-400 text-center">
          {(masterVolume * 100).toFixed(0)}%
        </div>
      </div>

      {/* Peak Meter Visual */}
      <div className="flex items-end gap-1 h-20 bg-gray-900 rounded p-2 border border-gray-700">
        {Array.from({ length: 32 }).map((_, i) => {
          const freq = (i / 32) * peakLevel; // Simplified spectrum visualization
          const isActive = freq > -40;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${
                isActive ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gray-800'
              }`}
              style={{
                height: isActive ? `${Math.max(10, (freq + 40) / 40 * 100)}%` : '4px',
              }}
            />
          );
        })}
      </div>

      {/* Clipping Indicator */}
      {peakLevel >= 0 && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold py-2 px-3 rounded animate-pulse">
          ⚠ CLIPPING - Reduce volume
        </div>
      )}

      {/* Headroom Indicator */}
      <div className="flex items-center justify-between text-xs bg-gray-900 rounded p-2 border border-gray-700">
        <span className="text-gray-400">Headroom:</span>
        <span className={`font-mono font-bold ${getMeterColor(peakLevel)}`}>
          {peakLevel >= 0 ? '0.0 dB' : `${Math.abs(peakLevel).toFixed(1)} dB`}
        </span>
      </div>
    </div>
  );
}
