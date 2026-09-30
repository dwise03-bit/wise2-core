'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import MediaUpload from '@/components/MediaUpload';
import ClipEditor from '@/components/ClipEditor';
import PublishManager from '@/components/PublishManager';
import SuggestedClips from '@/components/SuggestedClips';
import ResearchDashboard from '@/components/ResearchDashboard';

type Tab = 'upload' | 'clips' | 'publish' | 'suggested' | 'research';

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
      {/* Enhanced Header */}
      <header className="border-b border-wise-cyan/20 bg-gradient-to-r from-wise-navy/95 to-wise-navy/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-pulse">🎬</span>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-wise-cyan to-wise-neon bg-clip-text text-transparent">
                  WISE² Clipper
                </h1>
              </div>
              <p className="text-wise-cyan/60 text-sm sm:text-base">
                AI-powered video extraction & multi-platform publishing
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="px-4 py-2 bg-wise-gold/20 border border-wise-gold/40 rounded-lg">
                <p className="text-xs text-wise-gold/60">PRODUCTION READY</p>
                <p className="text-lg font-bold text-wise-gold">v2.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Animated Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 animate-slide-in flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">✕</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-sm font-semibold hover:text-red-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-wise-neon/20 border border-wise-neon rounded-xl text-wise-neon animate-slide-in flex items-center gap-3">
            <span className="text-lg animate-bounce">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="mb-8 border-b border-wise-cyan/20 backdrop-blur-sm">
          <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
            {[
              { id: 'research' as Tab, label: '🤖 Research', icon: '🤖' },
              { id: 'upload' as Tab, label: '📤 Upload Media', icon: '📤' },
              { id: 'clips' as Tab, label: '✂️ Create Clips', icon: '✂️' },
              { id: 'suggested' as Tab, label: '✨ AI Suggestions', icon: '✨' },
              { id: 'publish' as Tab, label: '📱 Publish', icon: '📱' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-wise-cyan'
                    : 'text-wise-cyan/60 hover:text-wise-cyan/80'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-wise-cyan via-wise-neon to-wise-cyan animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded-2xl p-6 sm:p-8 backdrop-blur animate-fade-in">
          {activeTab === 'research' && <ResearchDashboard />}

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

        {/* Enhanced Status Info */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group bg-gradient-to-br from-wise-gold/10 to-wise-gold/5 border border-wise-gold/20 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-wise-gold/40 hover:shadow-lg hover:shadow-wise-gold/20 transform hover:scale-102">
            <p className="text-wise-gold font-semibold mb-2 flex items-center gap-2">
              <span>🔌</span>
              API Endpoint
            </p>
            <p className="text-xs text-wise-gold/60 font-mono break-all bg-wise-navy/50 p-2 rounded border border-wise-gold/10">
              {API_BASE}/api/v1/clipper
            </p>
          </div>
          <div className="group bg-gradient-to-br from-wise-neon/10 to-wise-neon/5 border border-wise-neon/20 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-wise-neon/40 hover:shadow-lg hover:shadow-wise-neon/20 transform hover:scale-102">
            <p className="text-wise-neon font-semibold mb-2 flex items-center gap-2">
              <span>📱</span>
              Supported Platforms
            </p>
            <div className="flex flex-wrap gap-2">
              {['📷 Instagram', '🎵 TikTok', '▶️ YouTube', '𝕏 Twitter', '💜 Discord', '💼 LinkedIn'].map((platform) => (
                <span key={platform} className="text-xs bg-wise-neon/20 text-wise-neon px-2.5 py-1 rounded-full border border-wise-neon/30">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        .scale-102 {
          transform: scale(1.02);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
