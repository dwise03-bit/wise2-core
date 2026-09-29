'use client';

import { useState } from 'react';
import axios from 'axios';

interface Props {
  mediaAssetId: string;
  onClipCreated: (id: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
}

export default function ClipEditor({
  mediaAssetId,
  onClipCreated,
  loading,
  setLoading,
  setError,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [hashtags, setHashtags] = useState('');
  const [autoCaption, setAutoCaption] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  const handleCreateClip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title) {
      setError('Please enter a clip title');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/clipper/clips`,
        {
          mediaAssetId,
          title,
          description,
          startTimeSeconds: startTime,
          endTimeSeconds: endTime,
          hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean),
          autoCaption,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      onClipCreated(response.data.id);
      setTitle('');
      setDescription('');
      setStartTime(0);
      setEndTime(30);
      setHashtags('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create clip');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractClip = async (clipId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE}/api/v1/clipper/clips/${clipId}/extract`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      alert('✓ Clip extracted successfully! Ready for publishing.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extract clip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-wise-neon/5 border border-wise-neon/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-wise-neon mb-4">Create Clips</h2>
        <p className="text-wise-neon/60 mb-6">
          Define time ranges to extract from your media. Each clip can be published to multiple platforms with platform-specific optimizations.
        </p>

        <form onSubmit={handleCreateClip} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-wise-neon mb-2">
              Clip Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Growth Strategy Explained"
              className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-neon/20 rounded-lg text-white placeholder-wise-neon/40 focus:outline-none focus:border-wise-neon focus:ring-1 focus:ring-wise-neon/50 transition"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-wise-neon mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this clip about?"
              rows={2}
              className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-neon/20 rounded-lg text-white placeholder-wise-neon/40 focus:outline-none focus:border-wise-neon focus:ring-1 focus:ring-wise-neon/50 transition"
              disabled={loading}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wise-neon mb-2">
                Start Time (seconds)
              </label>
              <input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-neon/20 rounded-lg text-white focus:outline-none focus:border-wise-neon focus:ring-1 focus:ring-wise-neon/50 transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wise-neon mb-2">
                End Time (seconds)
              </label>
              <input
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                min={startTime + 1}
                className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-neon/20 rounded-lg text-white focus:outline-none focus:border-wise-neon focus:ring-1 focus:ring-wise-neon/50 transition"
                disabled={loading}
              />
            </div>
          </div>

          <div className="bg-wise-neon/10 border border-wise-neon/20 rounded p-3">
            <p className="text-sm text-wise-neon">
              ⏱️ Duration: <span className="font-bold">{endTime - startTime} seconds</span>
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-wise-neon mb-2">
              Hashtags
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#growth, #marketing, #business"
              className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-neon/20 rounded-lg text-white placeholder-wise-neon/40 focus:outline-none focus:border-wise-neon focus:ring-1 focus:ring-wise-neon/50 transition"
              disabled={loading}
            />
          </div>

          {/* Auto Caption */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoCaption"
              checked={autoCaption}
              onChange={(e) => setAutoCaption(e.target.checked)}
              className="w-5 h-5 accent-wise-neon"
              disabled={loading}
            />
            <label htmlFor="autoCaption" className="text-sm text-wise-neon">
              ✓ Auto-generate captions from transcript
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
              loading
                ? 'bg-wise-neon/50 cursor-not-allowed'
                : 'bg-wise-neon text-wise-navy hover:bg-wise-neon/80'
            }`}
          >
            {loading ? '⏳ Creating...' : '✂️ Create Clip'}
          </button>
        </form>
      </div>

      {/* Platform Specs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">Instagram</p>
          <p className="text-xs text-wise-cyan/60">1080×1350 (Reels)</p>
        </div>
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">TikTok</p>
          <p className="text-xs text-wise-cyan/60">1080×1920 (Full)</p>
        </div>
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">YouTube</p>
          <p className="text-xs text-wise-cyan/60">1280×720 (HD)</p>
        </div>
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">Twitter/X</p>
          <p className="text-xs text-wise-cyan/60">1200×675 (16:9)</p>
        </div>
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">Discord</p>
          <p className="text-xs text-wise-cyan/60">8MB Max</p>
        </div>
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded p-3">
          <p className="text-xs font-semibold text-wise-cyan">LinkedIn</p>
          <p className="text-xs text-wise-cyan/60">1200×675</p>
        </div>
      </div>
    </div>
  );
}
