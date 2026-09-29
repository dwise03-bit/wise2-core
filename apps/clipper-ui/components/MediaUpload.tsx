'use client';

import { useState } from 'react';
import axios from 'axios';

interface Props {
  onMediaUploaded: (id: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
}

export default function MediaUpload({
  onMediaUploaded,
  loading,
  setLoading,
  setError,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title) {
      setError('Please enter a title');
      return;
    }

    if (!sourceUrl && !file) {
      setError('Please provide either a URL or upload a file');
      return;
    }

    setLoading(true);
    try {
      // For demo, use sourceUrl. In production, would handle file upload
      const response = await axios.post(
        `${API_BASE}/api/v1/clipper/media/upload`,
        {
          title,
          description,
          sourceUrl: sourceUrl || file?.name,
          sourceType: 'UPLOAD',
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      onMediaUploaded(response.data.id);
      setTitle('');
      setDescription('');
      setSourceUrl('');
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-wise-cyan/5 border border-wise-cyan/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-wise-cyan mb-4">Upload Media</h2>
        <p className="text-wise-cyan/60 mb-6">
          Upload video or audio to begin the clipping process. The system will analyze for moments, transcribe, and generate suggested clips.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-wise-cyan mb-2">
              Media Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Marketing Strategy Webinar"
              className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-cyan/20 rounded-lg text-white placeholder-wise-cyan/40 focus:outline-none focus:border-wise-cyan focus:ring-1 focus:ring-wise-cyan/50 transition"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-wise-cyan mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Add context for better clip analysis..."
              rows={3}
              className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-cyan/20 rounded-lg text-white placeholder-wise-cyan/40 focus:outline-none focus:border-wise-cyan focus:ring-1 focus:ring-wise-cyan/50 transition"
              disabled={loading}
            />
          </div>

          {/* URL or File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wise-cyan mb-2">
                Media URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-cyan/20 rounded-lg text-white placeholder-wise-cyan/40 focus:outline-none focus:border-wise-cyan focus:ring-1 focus:ring-wise-cyan/50 transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wise-cyan mb-2">
                Or Upload File
              </label>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-wise-navy/50 border border-wise-cyan/20 rounded-lg text-wise-cyan/60 file:bg-wise-cyan file:text-wise-navy file:border-0 file:px-3 file:py-1 file:rounded file:font-medium file:cursor-pointer hover:file:bg-wise-cyan/80 transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
              loading
                ? 'bg-wise-cyan/50 cursor-not-allowed'
                : 'bg-wise-cyan text-wise-navy hover:bg-wise-cyan/80'
            }`}
          >
            {loading ? '⏳ Uploading...' : '📤 Upload Media'}
          </button>
        </form>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-wise-neon/10 border border-wise-neon/20 rounded-lg p-4">
          <p className="text-wise-neon font-semibold mb-2">🎯 AI Analysis</p>
          <p className="text-xs text-wise-neon/60">
            Automatically detect moments, transcribe audio, identify high-engagement segments
          </p>
        </div>
        <div className="bg-wise-gold/10 border border-wise-gold/20 rounded-lg p-4">
          <p className="text-wise-gold font-semibold mb-2">⚡ Fast Processing</p>
          <p className="text-xs text-wise-gold/60">
            GPU-accelerated video extraction with NVIDIA NVENC + CPU fallback
          </p>
        </div>
        <div className="bg-wise-cyan/10 border border-wise-cyan/20 rounded-lg p-4">
          <p className="text-wise-cyan font-semibold mb-2">📊 Metrics</p>
          <p className="text-xs text-wise-cyan/60">
            Engagement scoring, moment detection confidence, quality metrics
          </p>
        </div>
      </div>
    </div>
  );
}
