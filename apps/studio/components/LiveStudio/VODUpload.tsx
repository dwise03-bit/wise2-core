'use client';

import React, { useState } from 'react';

interface Recording {
  id: string;
  title: string;
  duration: number;
  size: string;
  timestamp: string;
}

interface VODUploadProps {
  recordings: Recording[];
}

export default function VODUpload({ recordings }: VODUploadProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = () => {
    if (!selectedId) return;
    setUploading(true);
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 0;
        }
        return prev + Math.random() * 20;
      });
    }, 300);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours ? hours + 'h ' : ''}${minutes}m`;
  };

  const unuploadedRecordings = recordings.slice(0, 3);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase text-gray-400">VOD Upload</h3>

      {unuploadedRecordings.length === 0 ? (
        <div className="bg-studio-input border border-studio-line rounded p-4 text-center">
          <div className="text-xs text-gray-500">No recordings to upload</div>
          <div className="text-xs text-gray-600 mt-1">New recordings will appear here</div>
        </div>
      ) : (
        <div className="space-y-2">
          {unuploadedRecordings.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setSelectedId(rec.id)}
              className={`w-full text-left p-2 rounded border transition-all ${
                selectedId === rec.id
                  ? 'bg-wise-accent/10 border-wise-accent/50'
                  : 'bg-studio-input border-studio-line hover:border-wise-accent/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{rec.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {formatDuration(rec.duration)} • {rec.size}
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full border-2 border-gray-600 ml-2 flex-shrink-0"></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-studio-input border border-studio-line rounded p-3 space-y-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-400">Uploading...</span>
            <span className="text-white font-semibold">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-studio-raised rounded overflow-hidden">
            <div
              className="h-full bg-wise-accent transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Platform Selection */}
      {!uploading && selectedId && (
        <div className="bg-studio-input border border-studio-line rounded p-3 space-y-2">
          <span className="text-xs font-semibold text-gray-400 block mb-2">Upload Platform</span>
          {['YouTube', 'Twitch VOD', 'Custom'].map(platform => (
            <button
              key={platform}
              className="w-full px-3 py-1 rounded text-xs bg-studio-raised border border-studio-line text-gray-300 hover:border-wise-accent/50 hover:text-white transition"
            >
              {platform}
            </button>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedId || uploading}
        className={`w-full px-3 py-2 rounded font-semibold text-sm transition-all ${
          !selectedId || uploading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30'
        }`}
      >
        {uploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload Recording'}
      </button>

      {/* Info */}
      <div className="bg-studio-input border border-studio-line rounded p-2 text-xs text-gray-500 space-y-1">
        <div>Max file size: 10 GB</div>
        <div>Supported formats: MP4, MKV, WebM</div>
        <div>Auto-transcoding available</div>
      </div>
    </div>
  );
}
