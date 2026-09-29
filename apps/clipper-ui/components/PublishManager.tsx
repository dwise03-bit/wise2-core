'use client';

import { useState } from 'react';
import axios from 'axios';

interface Props {
  clipId: string;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setSuccess: (v: string | null) => void;
}

const PLATFORMS = [
  { id: 'INSTAGRAM', name: 'Instagram Reels', icon: '📷', color: 'from-pink-500 to-rose-500' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: 'from-black to-gray-900' },
  { id: 'YOUTUBE', name: 'YouTube Shorts', icon: '▶️', color: 'from-red-500 to-red-600' },
  { id: 'TWITTER', name: 'Twitter/X', icon: '𝕏', color: 'from-gray-900 to-black' },
  { id: 'DISCORD', name: 'Discord', icon: '💜', color: 'from-indigo-600 to-indigo-700' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' },
];

export default function PublishManager({
  clipId,
  loading,
  setLoading,
  setError,
  setSuccess,
}: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['DISCORD']);
  const [scheduleTime, setScheduleTime] = useState('');
  const [publishingJobs, setPublishingJobs] = useState<any[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePublish = async () => {
    setError(null);

    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform');
      return;
    }

    setLoading(true);
    try {
      for (const platform of selectedPlatforms) {
        const response = await axios.post(
          `${API_BASE}/api/v1/clipper/clips/${clipId}/publish`,
          {
            platform,
            scheduledAt: scheduleTime ? new Date(scheduleTime).toISOString() : null,
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );
        setPublishingJobs((prev) => [...prev, response.data]);
      }
      setSuccess(
        `✓ Publishing to ${selectedPlatforms.length} platform${
          selectedPlatforms.length > 1 ? 's' : ''
        } initiated!`
      );
      setScheduleTime('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish clip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-wise-gold/5 border border-wise-gold/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-wise-gold mb-4">Publish Clip</h2>
        <p className="text-wise-gold/60 mb-6">
          Select platforms and publish your clip. Each platform receives an optimized version with proper dimensions, codec, and format.
        </p>

        {/* Platform Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-wise-gold mb-4">
            Select Platforms ({selectedPlatforms.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedPlatforms.includes(platform.id)
                    ? `border-wise-gold bg-gradient-to-br ${platform.color} text-white shadow-lg`
                    : 'border-wise-gold/20 bg-wise-navy/40 text-wise-gold/60 hover:border-wise-gold/40'
                }`}
              >
                <div className="text-3xl mb-2">{platform.icon}</div>
                <p className="text-sm font-semibold">{platform.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-wise-gold mb-2">
            Schedule Publishing (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-gold/20 rounded-lg text-white focus:outline-none focus:border-wise-gold focus:ring-1 focus:ring-wise-gold/50 transition"
            disabled={loading}
          />
          <p className="text-xs text-wise-gold/60 mt-2">
            Leave empty to publish immediately
          </p>
        </div>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={loading || selectedPlatforms.length === 0}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
            loading || selectedPlatforms.length === 0
              ? 'bg-wise-gold/50 cursor-not-allowed'
              : 'bg-wise-gold text-wise-navy hover:bg-wise-gold/80'
          }`}
        >
          {loading
            ? `⏳ Publishing to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}...`
            : `📱 Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Publishing Jobs */}
      {publishingJobs.length > 0 && (
        <div className="bg-wise-navy/40 border border-wise-cyan/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-wise-cyan mb-4">Publishing Status</h3>
          <div className="space-y-3">
            {publishingJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-wise-navy/40 border border-wise-cyan/10 rounded"
              >
                <div>
                  <p className="font-medium text-wise-cyan">{job.platform}</p>
                  <p className="text-xs text-wise-cyan/60">ID: {job.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    job.status === 'PUBLISHED'
                      ? 'bg-wise-neon/20 text-wise-neon'
                      : job.status === 'FAILED'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-wise-cyan/20 text-wise-cyan'
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-wise-neon/5 border border-wise-neon/20 rounded-lg p-4">
        <h4 className="font-semibold text-wise-neon mb-3">📋 Publishing Best Practices</h4>
        <ul className="space-y-2 text-sm text-wise-neon/80">
          <li>• <strong>Captions required</strong> - 85% higher engagement with captions</li>
          <li>• <strong>Hook early</strong> - Grab attention in first 3 seconds</li>
          <li>• <strong>Platform timing</strong> - Publish during peak hours for your audience</li>
          <li>• <strong>Hashtags</strong> - 5-10 relevant hashtags per platform</li>
          <li>• <strong>Consistency</strong> - Maintain brand voice across all platforms</li>
        </ul>
      </div>
    </div>
  );
}
