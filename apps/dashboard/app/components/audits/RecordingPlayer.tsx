'use client';

import { useEffect, useRef, useState } from 'react';

interface AuditMoment {
  id: string;
  label: string;
  description?: string;
  timestampMs: number;
  category?: string;
  severity?: string;
}

interface Recording {
  id: string;
  filename: string;
  s3Url?: string;
  duration?: number;
  moments: AuditMoment[];
  userNotes?: string;
}

interface RecordingPlayerProps {
  sessionId: string;
  recordingId: string;
}

export default function RecordingPlayer({ sessionId, recordingId }: RecordingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [recording, setRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNewMoment, setShowNewMoment] = useState(false);
  const [newMomentLabel, setNewMomentLabel] = useState('');
  const [newMomentCategory, setNewMomentCategory] = useState('finding');
  const [loading, setLoading] = useState(true);

  // Fetch recording details
  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const response = await fetch(
          `/api/v1/audits/${sessionId}/recordings/${recordingId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch recording');

        const data = await response.json();
        setRecording(data);
        setNotes(data.userNotes || '');
      } catch (err) {
        console.error('Failed to fetch recording:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && recordingId) {
      fetchRecording();
    }
  }, [sessionId, recordingId]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToMoment = (timestampMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestampMs / 1000;
    }
  };

  const markMoment = async () => {
    if (!newMomentLabel || !recording) return;

    try {
      const response = await fetch(
        `/api/v1/audits/${sessionId}/recordings/${recordingId}/moments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            label: newMomentLabel,
            timestampMs: Math.floor(currentTime * 1000),
            category: newMomentCategory,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to mark moment');

      // Refresh recording
      const recordingResponse = await fetch(
        `/api/v1/audits/${sessionId}/recordings/${recordingId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const updated = await recordingResponse.json();
      setRecording(updated);

      setNewMomentLabel('');
      setShowNewMoment(false);
    } catch (err) {
      console.error('Failed to mark moment:', err);
    }
  };

  const saveNotes = async () => {
    try {
      await fetch(
        `/api/v1/audits/${sessionId}/recordings/${recordingId}/notes`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ notes }),
        }
      );
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-700 rounded" />
          <div className="h-40 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!recording || !recording.s3Url) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <p className="text-slate-400">Recording not available for playback</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player */}
      <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">{recording.filename}</h3>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          src={recording.s3Url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          className="w-full mb-4"
        />

        {/* Player Controls */}
        <div className="space-y-4">
          {/* Play Button */}
          <button
            onClick={togglePlayPause}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Moment Marks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Marked Moments ({recording.moments.length})</h4>
              <button
                onClick={() => setShowNewMoment(!showNewMoment)}
                className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition"
              >
                {showNewMoment ? '✕' : '+ Mark'}
              </button>
            </div>

            {showNewMoment && (
              <div className="bg-slate-700 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Moment label (e.g., 'Budget concern')"
                  value={newMomentLabel}
                  onChange={(e) => setNewMomentLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={newMomentCategory}
                  onChange={(e) => setNewMomentCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 outline-none"
                >
                  <option value="finding">Finding</option>
                  <option value="risk">Risk</option>
                  <option value="question">Question</option>
                  <option value="note">Note</option>
                </select>
                <div className="text-xs text-slate-400">
                  At {formatTime(currentTime)} ({Math.floor(currentTime * 1000)}ms)
                </div>
                <button
                  onClick={markMoment}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                >
                  Save Moment
                </button>
              </div>
            )}

            {recording.moments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recording.moments.map(moment => (
                  <div
                    key={moment.id}
                    onClick={() => seekToMoment(moment.timestampMs)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{moment.label}</p>
                        <div className="flex gap-2 mt-1">
                          {moment.category && (
                            <span className="text-xs bg-slate-600 px-1 py-0.5 rounded">
                              {moment.category}
                            </span>
                          )}
                          {moment.severity && (
                            <span className="text-xs bg-slate-600 px-1 py-0.5 rounded">
                              {moment.severity}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTime(moment.timestampMs / 1000)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-4">
                No moments marked yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Add notes about this recording..."
          className="w-full h-32 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none resize-none text-sm"
        />
        <div className="text-xs text-slate-500 mt-2">Auto-saved</div>
      </div>
    </div>
  );
}
