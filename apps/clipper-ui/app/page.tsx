'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import MediaUpload from '@/components/MediaUpload';
import ClipEditor from '@/components/ClipEditor';
import PublishManager from '@/components/PublishManager';
import SuggestedClips from '@/components/SuggestedClips';

type Tab = 'upload' | 'clips' | 'publish' | 'suggested';

export default function ClipperDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [clipId, setClipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  const handleMediaUploaded = (id: string) => {
    setMediaAssetId(id);
    setSuccess('Media uploaded successfully!');
    setActiveTab('clips');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleClipCreated = (id: string) => {
    setClipId(id);
    setSuccess('Clip created successfully!');
    setActiveTab('publish');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wise-navy via-wise-navy to-black">
      {/* Header */}
      <header className="border-b border-wise-cyan/20 bg-wise-navy/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-wise-cyan">
                WISE² Video Clipper
              </h1>
              <p className="text-wise-cyan/60 mt-1">
                AI-powered video extraction & multi-platform publishing
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-wise-gold">🎬</div>
              <p className="text-xs text-wise-cyan/60">Beta v1.0</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-wise-neon/20 border border-wise-neon rounded-lg text-wise-neon">
            ✓ {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-wise-cyan/20">
          {[
            { id: 'upload' as Tab, label: '📤 Upload Media', icon: '📤' },
            { id: 'clips' as Tab, label: '✂️ Create Clips', icon: '✂️' },
            { id: 'suggested' as Tab, label: '🤖 AI Suggestions', icon: '🤖' },
            { id: 'publish' as Tab, label: '📱 Publish', icon: '📱' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-wise-cyan text-wise-cyan'
                  : 'border-transparent text-wise-cyan/60 hover:text-wise-cyan/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded-2xl p-8 backdrop-blur">
          {activeTab === 'upload' && (
            <MediaUpload
              onMediaUploaded={handleMediaUploaded}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          )}

          {activeTab === 'clips' && mediaAssetId && (
            <ClipEditor
              mediaAssetId={mediaAssetId}
              onClipCreated={handleClipCreated}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          )}

          {activeTab === 'clips' && !mediaAssetId && (
            <div className="text-center py-12">
              <p className="text-wise-cyan/60 mb-4">
                Upload media first to create clips
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-2 bg-wise-cyan text-wise-navy rounded-lg font-medium hover:bg-wise-cyan/80 transition"
              >
                Go to Upload
              </button>
            </div>
          )}

          {activeTab === 'suggested' && mediaAssetId && (
            <SuggestedClips
              mediaAssetId={mediaAssetId}
              onClipSelected={handleClipCreated}
              setError={setError}
            />
          )}

          {activeTab === 'suggested' && !mediaAssetId && (
            <div className="text-center py-12">
              <p className="text-wise-cyan/60 mb-4">
                Upload and analyze media to see AI-suggested clips
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-2 bg-wise-cyan text-wise-navy rounded-lg font-medium hover:bg-wise-cyan/80 transition"
              >
                Go to Upload
              </button>
            </div>
          )}

          {activeTab === 'publish' && clipId && (
            <PublishManager
              clipId={clipId}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              setSuccess={setSuccess}
            />
          )}

          {activeTab === 'publish' && !clipId && (
            <div className="text-center py-12">
              <p className="text-wise-cyan/60 mb-4">
                Create a clip first to publish it
              </p>
              <button
                onClick={() => setActiveTab('clips')}
                className="px-6 py-2 bg-wise-cyan text-wise-navy rounded-lg font-medium hover:bg-wise-cyan/80 transition"
              >
                Go to Create Clips
              </button>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-wise-navy/40 border border-wise-gold/20 rounded-lg p-4">
            <p className="text-wise-gold font-semibold mb-2">API Endpoint</p>
            <p className="text-xs text-wise-gold/60 font-mono break-all">{API_BASE}/api/v1/clipper</p>
          </div>
          <div className="bg-wise-navy/40 border border-wise-neon/20 rounded-lg p-4">
            <p className="text-wise-neon font-semibold mb-2">Platforms</p>
            <p className="text-xs text-wise-neon/60">
              Instagram • TikTok • YouTube • Twitter • Discord • LinkedIn
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
