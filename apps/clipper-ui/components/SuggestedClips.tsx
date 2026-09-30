'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Clip {
  id: string;
  title: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  durationSeconds: number;
  momentCount: number;
  momentTypes: string[];
}

interface Props {
  mediaAssetId: string;
  onClipSelected: (id: string) => void;
  setError: (v: string | null) => void;
}

export default function SuggestedClips({
  mediaAssetId,
  onClipSelected,
  setError,
}: Props) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  useEffect(() => {
    fetchSuggestedClips();
  }, [mediaAssetId]);

  const fetchSuggestedClips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/clipper/media/${mediaAssetId}/suggested-clips`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      setClips(response.data.suggestions || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No analysis available. Analyze the media first.');
      } else {
        setError(err.response?.data?.message || 'Failed to load suggested clips');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMedia = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE}/api/v1/clipper/media/${mediaAssetId}/analyze`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      setTimeout(fetchSuggestedClips, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze media');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateFromSuggestion = async (clip: Clip) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/clipper/clips`,
        {
          mediaAssetId,
          title: clip.title,
          startTimeSeconds: clip.startTimeSeconds,
          endTimeSeconds: clip.endTimeSeconds,
          autoCaption: true,
          hashtags: clip.momentTypes.map((t) => t.toLowerCase()),
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      onClipSelected(response.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create clip from suggestion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-wise-neon/5 border border-wise-neon/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-wise-neon">AI-Suggested Clips</h2>
            <p className="text-wise-neon/60 mt-1">
              Automatically detected high-engagement moments
            </p>
          </div>
          <button
            onClick={handleAnalyzeMedia}
            disabled={analyzing || loading}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              analyzing || loading
                ? 'bg-wise-neon/50 cursor-not-allowed'
                : 'bg-wise-neon text-wise-navy hover:bg-wise-neon/80'
            }`}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Media'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-wise-neon/60">Loading suggestions...</p>
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-12 bg-wise-neon/10 rounded-lg border border-wise-neon/20">
            <p className="text-wise-neon/60 mb-4">No suggested clips yet</p>
            <button
              onClick={handleAnalyzeMedia}
              disabled={analyzing}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                analyzing
                  ? 'bg-wise-neon/50 cursor-not-allowed'
                  : 'bg-wise-neon text-wise-navy hover:bg-wise-neon/80'
              }`}
            >
              {analyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {clips.map((clip, index) => (
              <div
                key={clip.id}
                className="p-4 bg-wise-navy/40 border border-wise-neon/20 rounded-lg hover:border-wise-neon/40 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-wise-neon/20 text-wise-neon px-2 py-1 rounded">
                        Suggestion #{index + 1}
                      </span>
                      <span className="text-xs bg-wise-cyan/20 text-wise-cyan px-2 py-1 rounded">
                        {clip.durationSeconds}s
                      </span>
                    </div>
                    <h3 className="font-semibold text-wise-neon">{clip.title}</h3>
                    <p className="text-sm text-wise-neon/60 mt-1">
                      {clip.startTimeSeconds}s - {clip.endTimeSeconds}s (
                      {clip.momentCount} moment{clip.momentCount > 1 ? 's' : ''} detected)
                    </p>
                  </div>
                </div>

                {/* Moment Types */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {clip.momentTypes.map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-wise-gold/20 text-wise-gold px-2 py-1 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <button
                  onClick={() => handleCreateFromSuggestion(clip)}
                  className="w-full px-4 py-2 bg-wise-neon/20 text-wise-neon border border-wise-neon/40 rounded hover:bg-wise-neon hover:text-wise-navy transition font-medium text-sm"
                >
                  Create Clip from This Suggestion
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detection Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-wise-cyan/10 border border-wise-cyan/20 rounded-lg p-4">
          <p className="text-wise-cyan font-semibold mb-2">Detection Methods</p>
          <ul className="space-y-1 text-xs text-wise-cyan/80">
            <li>• Audio energy spikes (excitement)</li>
            <li>• Laughter & applause detection</li>
            <li>• Topic transitions</li>
            <li>• Speech emphasis patterns</li>
            <li>• Silence detection</li>
          </ul>
        </div>
        <div className="bg-wise-gold/10 border border-wise-gold/20 rounded-lg p-4">
          <p className="text-wise-gold font-semibold mb-2">AI Models</p>
          <ul className="space-y-1 text-xs text-wise-gold/80">
            <li>• Librosa: Audio analysis</li>
            <li>• Whisper: Transcription</li>
            <li>• Custom: Moment scoring</li>
            <li>• Clustering: Segment grouping</li>
            <li>• Duration: 15-60s optimal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
