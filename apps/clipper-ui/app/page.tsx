'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import MediaUpload from '@/components/MediaUpload';
import ClipEditor from '@/components/ClipEditor';
import PublishManager from '@/components/PublishManager';
import SuggestedClips from '@/components/SuggestedClips';
import ResearchDashboard from '@/components/ResearchDashboard';
import {
  AlertIcon,
  CheckIcon,
  PlayIcon,
  ScissorsIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  UploadIcon,
} from '@/components/icons';

type Tab = 'upload' | 'clips' | 'publish' | 'suggested' | 'research';
type ApiStatus = 'checking' | 'online' | 'offline';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'research', label: 'Research', icon: <SearchIcon /> },
  { id: 'upload', label: 'Upload Media', icon: <UploadIcon /> },
  { id: 'clips', label: 'Create Clips', icon: <ScissorsIcon /> },
  { id: 'suggested', label: 'AI Suggestions', icon: <SparklesIcon /> },
  { id: 'publish', label: 'Publish', icon: <SendIcon /> },
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'X (Twitter)', 'Discord', 'LinkedIn'];

const STATUS_COPY: Record<ApiStatus, { label: string; dot: string; text: string }> = {
  checking: { label: 'Checking API', dot: 'bg-wise-gold', text: 'text-wise-gold' },
  online: { label: 'API online', dot: 'bg-wise-neon', text: 'text-wise-neon' },
  offline: { label: 'API unreachable', dot: 'bg-red-400', text: 'text-red-300' },
};

function EmptyPrompt({
  message,
  action,
  onAction,
}: {
  message: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="text-center py-12">
      <p className="text-wise-cyan/70 mb-4">{message}</p>
      <button type="button" onClick={onAction} className="btn-primary">
        {action}
      </button>
    </div>
  );
}

export default function ClipperDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [clipId, setClipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Same-conditions probe: a CORS-blocked, 5xx or unreachable API means this UI's own calls fail too
    fetch(`${API_BASE}/api/health`, { cache: 'no-store', signal: controller.signal })
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
      .finally(() => clearTimeout(timeout));
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [API_BASE]);

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    []
  );

  const flashSuccess = useCallback((message: string) => {
    setSuccess(message);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(null), 3000);
  }, []);

  const handleMediaUploaded = (id: string) => {
    setMediaAssetId(id);
    flashSuccess('Media uploaded successfully!');
    setActiveTab('clips');
  };

  const handleClipCreated = (id: string) => {
    setClipId(id);
    flashSuccess('Clip created successfully!');
    setActiveTab('publish');
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const stepDone: Partial<Record<Tab, boolean>> = {
    upload: !!mediaAssetId,
    clips: !!clipId,
  };

  const status = STATUS_COPY[apiStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-wise-navy via-wise-navy to-black text-white">
      <header className="border-b border-wise-cyan/20 bg-wise-navy/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-wise-cyan/30 bg-wise-cyan/10 text-wise-cyan">
                <PlayIcon size={24} />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight bg-gradient-to-r from-wise-cyan to-wise-neon bg-clip-text text-transparent">
                  WISE² Clipper
                </h1>
                <p className="hidden sm:block text-wise-cyan/70 text-sm truncate">
                  AI-powered video extraction &amp; multi-platform publishing
                </p>
              </div>
            </div>

            <div
              className="shrink-0 flex items-center gap-3 rounded-lg border border-wise-gold/30 bg-wise-gold/10 px-3 py-2"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                {apiStatus === 'online' && (
                  <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-wise-neon opacity-60" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.dot}`} />
              </span>
              <div className="leading-tight">
                <p className={`text-xs font-semibold ${status.text}`}>{status.label}</p>
                <p className="text-[11px] text-wise-gold/80">v2.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div aria-live="assertive">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-500/15 border border-red-500/60 rounded-xl text-red-200 animate-slide-in flex items-center gap-3 justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertIcon className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="min-h-[44px] px-3 text-sm font-semibold rounded-lg hover:text-red-100 hover:bg-red-500/20 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        <div aria-live="polite">
          {success && (
            <div
              role="status"
              className="mb-6 p-4 bg-wise-neon/10 border border-wise-neon/60 rounded-xl text-wise-neon animate-slide-in flex items-center gap-3"
            >
              <CheckIcon className="shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        <div className="mb-8 border-b border-wise-cyan/20">
          <div
            role="tablist"
            aria-label="Clipper workflow"
            className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide"
          >
            {TABS.map((tab, index) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`relative flex min-h-[48px] cursor-pointer items-center gap-2 rounded-t-lg px-4 sm:px-5 py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
                    selected
                      ? 'text-wise-cyan bg-wise-cyan/5'
                      : 'text-wise-cyan/70 hover:text-wise-cyan hover:bg-wise-cyan/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {stepDone[tab.id] && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-wise-neon" aria-hidden="true" />
                      <span className="sr-only">(complete)</span>
                    </>
                  )}
                  {selected && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-wise-cyan via-wise-neon to-wise-cyan" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="bg-wise-navy/40 border border-wise-cyan/10 rounded-2xl p-6 sm:p-8 backdrop-blur animate-fade-in focus-visible:outline-none"
        >
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
            <EmptyPrompt
              message="Upload media first to create clips"
              action="Go to Upload"
              onAction={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'suggested' && mediaAssetId && (
            <SuggestedClips
              mediaAssetId={mediaAssetId}
              onClipSelected={handleClipCreated}
              setError={setError}
            />
          )}

          {activeTab === 'suggested' && !mediaAssetId && (
            <EmptyPrompt
              message="Upload and analyze media to see AI-suggested clips"
              action="Go to Upload"
              onAction={() => setActiveTab('upload')}
            />
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
            <EmptyPrompt
              message="Create a clip first to publish it"
              action="Go to Create Clips"
              onAction={() => setActiveTab('clips')}
            />
          )}
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <section
            aria-labelledby="api-endpoint-heading"
            className="bg-gradient-to-br from-wise-gold/10 to-wise-gold/5 border border-wise-gold/20 rounded-xl p-5 sm:p-6 transition-colors duration-200 hover:border-wise-gold/50"
          >
            <h2 id="api-endpoint-heading" className="text-wise-gold font-semibold mb-2">
              API Endpoint
            </h2>
            <p className="text-xs text-wise-gold/80 font-mono break-all bg-wise-navy/60 p-2 rounded border border-wise-gold/10">
              {API_BASE}/api/v1/clipper
            </p>
          </section>
          <section
            aria-labelledby="platforms-heading"
            className="bg-gradient-to-br from-wise-neon/10 to-wise-neon/5 border border-wise-neon/20 rounded-xl p-5 sm:p-6 transition-colors duration-200 hover:border-wise-neon/50"
          >
            <h2 id="platforms-heading" className="text-wise-neon font-semibold mb-2">
              Supported Platforms
            </h2>
            <ul className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <li
                  key={platform}
                  className="text-xs bg-wise-neon/15 text-wise-neon px-2.5 py-1 rounded-full border border-wise-neon/30"
                >
                  {platform}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
