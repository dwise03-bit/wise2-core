'use client';

export interface StreamControlProps {
  isStreaming: boolean;
  isRecording: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  viewerCount?: number;
}

export function StreamControl({
  isStreaming,
  isRecording,
  onStartStream,
  onStopStream,
  onStartRecord,
  onStopRecord,
  viewerCount = 0,
}: StreamControlProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">LIVE CONTROLS</div>

      {/* Stream Controls */}
      <div className="space-y-2">
        {isStreaming ? (
          <button
            onClick={onStopStream}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
            Stop Stream
          </button>
        ) : (
          <button
            onClick={onStartStream}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Stream
          </button>
        )}

        {/* Viewer Count */}
        {isStreaming && (
          <div className="text-xs text-center text-gray-400">
            {viewerCount.toLocaleString()} viewer{viewerCount !== 1 ? 's' : ''} watching
          </div>
        )}
      </div>

      {/* Record Controls */}
      <div className="border-t border-gray-700 pt-4 space-y-2">
        {isRecording ? (
          <button
            onClick={onStopRecord}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
            Stop Record
          </button>
        ) : (
          <button
            onClick={onStartRecord}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Record
          </button>
        )}
      </div>

      {/* Additional Controls */}
      <div className="border-t border-gray-700 pt-4 space-y-2">
        <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors text-sm">
          Add Marker
        </button>
        <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors text-sm">
          Screenshot
        </button>
      </div>
    </div>
  );
}
