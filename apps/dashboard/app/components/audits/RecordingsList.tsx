'use client';

import { useEffect, useState } from 'react';

interface Recording {
  id: string;
  filename: string;
  type: 'AUDIO' | 'VIDEO';
  duration?: number;
  uploadStatus: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  recordedAt: string;
}

interface RecordingsListProps {
  sessionId: string;
  selectedId: string | null;
  onSelect: (recordingId: string) => void;
}

export default function RecordingsList({ sessionId, selectedId, onSelect }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await fetch(`/api/v1/audits/${sessionId}/recordings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch recordings');

        const data = await response.json();
        setRecordings(data.recordings || []);
      } catch (err) {
        console.error('Failed to fetch recordings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchRecordings();
    }

    // Listen for recording-uploaded events
    const handleRecordingUploaded = () => {
      fetchRecordings();
    };

    window.addEventListener('recording-uploaded', handleRecordingUploaded);
    return () => window.removeEventListener('recording-uploaded', handleRecordingUploaded);
  }, [sessionId]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Recordings</h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recordings</h3>
        <span className="text-sm text-slate-400">{recordings.length}</span>
      </div>

      {recordings.length === 0 ? (
        <div className="text-slate-400 text-sm text-center py-8">
          No recordings yet. Start recording to capture evidence.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recordings.map(recording => (
            <div
              key={recording.id}
              onClick={() => onSelect(recording.id)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedId === recording.id
                  ? 'bg-blue-600 border border-blue-500'
                  : 'bg-slate-700 border border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recording.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-600 px-2 py-1 rounded">
                      {recording.type === 'AUDIO' ? '🎙️ Audio' : '📹 Video'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(recording.duration)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {recording.uploadStatus === 'COMPLETED' && (
                    <div className="text-xs text-green-400 font-semibold">✓ Uploaded</div>
                  )}
                  {recording.uploadStatus === 'PENDING' && (
                    <div className="text-xs text-yellow-400 font-semibold">Pending</div>
                  )}
                  {recording.uploadStatus === 'FAILED' && (
                    <div className="text-xs text-red-400 font-semibold">Failed</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
