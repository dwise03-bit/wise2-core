'use client';

import React, { useState } from 'react';

interface Recording {
  id: string;
  title: string;
  duration: number;
  size: string;
  timestamp: string;
}

interface RecordingsListProps {
  recordings: Recording[];
}

export default function RecordingsList({ recordings }: RecordingsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase text-gray-400">Recordings</h3>

      {recordings.length === 0 ? (
        <div className="bg-studio-input border border-studio-line rounded p-4 text-center">
          <div className="text-xs text-gray-500">No recordings yet</div>
          <div className="text-xs text-gray-600 mt-1">Start recording to see clips here</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedId(selectedId === rec.id ? null : rec.id)}
              className={`p-2 rounded border cursor-pointer transition-all ${
                selectedId === rec.id
                  ? 'bg-wise-accent/10 border-wise-accent/50'
                  : 'bg-studio-input border-studio-line hover:border-wise-accent/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{rec.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {formatDuration(rec.duration)} • {rec.size}
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-right whitespace-nowrap">
                  {formatDate(rec.timestamp)}
                </span>
              </div>

              {selectedId === rec.id && (
                <div className="mt-2 pt-2 border-t border-studio-line/50 flex gap-2">
                  <button className="flex-1 px-2 py-1 text-xs rounded bg-wise-accent/10 border border-wise-accent/30 text-wise-accent hover:bg-wise-accent/20 transition">
                    Export
                  </button>
                  <button className="flex-1 px-2 py-1 text-xs rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition">
                    Upload to VOD
                  </button>
                  <button className="flex-1 px-2 py-1 text-xs rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
