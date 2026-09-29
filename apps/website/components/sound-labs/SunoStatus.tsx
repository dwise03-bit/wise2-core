'use client';

import React, { useEffect, useState } from 'react';
import { Music, Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface GenerationStatusProps {
  projectId: string;
  status?: string;
  audioUrl?: string;
  engine?: string;
  onStatusChange?: (status: string, audioUrl?: string) => void;
}

export function GenerationStatus({ projectId, status = 'draft', audioUrl, engine = 'unknown', onStatusChange }: GenerationStatusProps) {
  const [generationStatus, setGenerationStatus] = useState(status);
  const [audioUrl_internal, setAudioUrl] = useState(audioUrl);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (generationStatus === 'processing' || generationStatus === 'queued') {
      setPolling(true);
      const interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}/generate`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setGenerationStatus(data.status);
          if (data.audioUrl) {
            setAudioUrl(data.audioUrl);
            setPolling(false);
            onStatusChange?.(data.status, data.audioUrl);
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [generationStatus, projectId, onStatusChange]);

  const getStatusColor = () => {
    switch (generationStatus) {
      case 'draft':
        return 'text-wise-text-muted';
      case 'queued':
      case 'processing':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-wise-text-muted';
    }
  };

  const getStatusIcon = () => {
    switch (generationStatus) {
      case 'draft':
        return <Music className="w-5 h-5" />;
      case 'queued':
      case 'processing':
        return <Loader className="w-5 h-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Music className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
      <h3 className="text-xl font-bold text-wise-text-primary mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-wise-primary" />
        Track Generation {engine && engine !== 'unknown' && <span className="text-sm text-wise-text-secondary ml-2">({engine})</span>}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-wise-text-secondary">Status</span>
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize font-medium">{generationStatus}</span>
          </div>
        </div>

        {generationStatus === 'draft' && (
          <p className="text-sm text-wise-text-muted">
            Ready to generate. Add lyrics and click "Generate Track" to create your song.
          </p>
        )}

        {(generationStatus === 'queued' || generationStatus === 'processing') && (
          <div className="space-y-2">
            <p className="text-sm text-blue-400">Generating your track...</p>
            <div className="w-full bg-wise-bg-secondary rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: generationStatus === 'processing' ? '75%' : '25%' }}
              />
            </div>
            <p className="text-xs text-wise-text-muted">This typically takes 1-5 minutes</p>
          </div>
        )}

        {generationStatus === 'completed' && audioUrl_internal && (
          <div className="space-y-3">
            <p className="text-sm text-green-400">Track generated successfully!</p>
            <div className="bg-wise-bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-wise-primary" />
                <span className="text-sm font-medium text-wise-text-primary">Listen to your track</span>
              </div>
              <audio
                controls
                className="w-full rounded"
                src={audioUrl_internal}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            <a
              href={audioUrl_internal}
              download
              className="inline-block px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded font-medium transition-colors text-sm"
            >
              Download Track
            </a>
          </div>
        )}

        {generationStatus === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <p className="text-sm text-red-400">Track generation failed. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export old name for backwards compatibility
export { GenerationStatus as SunoStatus };
