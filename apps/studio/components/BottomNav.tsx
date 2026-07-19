'use client';

/**
 * Bottom Navigation for mobile - provides quick access to essential controls
 * Visible only on mobile/tablet, hidden on desktop
 */

interface BottomNavProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  recordingStatus?: 'idle' | 'recording' | 'paused';
}

export function BottomNav({
  isPlaying,
  onPlayPause,
  onStop,
  onRecord,
  recordingStatus = 'idle',
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-wise-surface-secondary border-t border-wise-medium backdrop-blur-lg">
      <div className="grid grid-cols-4 gap-2 p-3 max-h-[80px]">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="py-3 px-2 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold transition text-xs flex items-center justify-center gap-1 min-h-[56px] flex-col"
          title={isPlaying ? 'Pause playback' : 'Start playback'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
          <span className="hidden xs:inline text-xs">
            {isPlaying ? 'Pause' : 'Play'}
          </span>
        </button>

        {/* Stop */}
        <button
          onClick={onStop}
          className="py-3 px-2 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded font-semibold transition border border-wise-medium text-xs flex items-center justify-center gap-1 min-h-[56px] flex-col"
          title="Stop playback"
          aria-label="Stop"
        >
          ⏹
          <span className="hidden xs:inline text-xs">Stop</span>
        </button>

        {/* Record */}
        <button
          onClick={onRecord}
          className={`py-3 px-2 text-wise-text-primary rounded font-semibold transition text-xs flex items-center justify-center gap-1 min-h-[56px] flex-col ${
            recordingStatus === 'recording'
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-wise-accent-red hover:opacity-90'
          }`}
          title={
            recordingStatus === 'recording'
              ? 'Stop recording'
              : 'Start recording'
          }
          aria-label={
            recordingStatus === 'recording'
              ? 'Stop recording'
              : 'Record'
          }
        >
          ●
          <span className="hidden xs:inline text-xs">
            {recordingStatus === 'recording' ? 'Stop' : 'Record'}
          </span>
        </button>

        {/* Settings/More */}
        <button
          className="py-3 px-2 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded font-semibold transition border border-wise-medium text-xs flex items-center justify-center gap-1 min-h-[56px] flex-col"
          title="More options"
          aria-label="More"
        >
          ⋮
          <span className="hidden xs:inline text-xs">More</span>
        </button>
      </div>
    </div>
  );
}
