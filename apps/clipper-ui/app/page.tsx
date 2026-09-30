'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import MediaUpload from '@/components/MediaUpload';
import ClipEditor from '@/components/ClipEditor';
import PublishManager from '@/components/PublishManager';
import SuggestedClips from '@/components/SuggestedClips';
import ResearchDashboard from '@/components/ResearchDashboard';
import {
  AlertIcon,
  CheckIcon,
} from '@/components/icons';

type Tab = 'upload' | 'clips' | 'publish' | 'suggested' | 'research';
type ApiStatus = 'checking' | 'online' | 'offline';

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'upload', label: 'Upload', hint: 'Podcast, interview or livestream' },
  { id: 'clips', label: 'Create clips', hint: 'Pick the moment, add captions' },
  { id: 'suggested', label: 'AI suggestions', hint: 'AI finds your best moments' },
  { id: 'publish', label: 'Approve & publish', hint: 'Send to your channels' },
  { id: 'research', label: 'Research & growth', hint: 'Creators, trends, results' },
];

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X (Twitter)', 'Discord'];
const COMING_SOON = ['LinkedIn', 'Facebook'];

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
    <div className="min-h-screen bg-wise-navy text-white">
      <header className="border-b border-wise-cyan/15 bg-wise-navy/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <p className="wordmark text-3xl sm:text-4xl" aria-label="WISE squared">
                WISE<sup className="text-wise-cyan">2</sup>
              </p>
              <div className="min-w-0 border-l border-wise-cyan/20 pl-4">
                <h1 className="text-base sm:text-lg font-bold leading-tight tracking-wide text-white">
                  Clipper
                </h1>
                <p className="hidden sm:block text-wise-cyan/70 text-xs truncate">
                  Turn one video into a full content engine
                </p>
              </div>
            </div>

            <div
              className="shrink-0 flex items-center gap-3 rounded-lg border border-wise-gold/30 bg-wise-gold/10 p-2.5 sm:px-3 sm:py-2"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                {apiStatus === 'online' && (
                  <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-wise-neon opacity-60" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.dot}`} />
              </span>
              <div className="leading-tight sr-only sm:not-sr-only">
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

        <div
          role="tablist"
          aria-label="Clipper workflow"
          className="mb-8 flex gap-3 overflow-x-auto scrollbar-hide snap-x lg:grid lg:grid-cols-5 lg:overflow-visible pb-1"
        >
          {TABS.map((tab, index) => {
            const selected = activeTab === tab.id;
            const done = !!stepDone[tab.id];
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
                style={{ animationDelay: `${index * 60}ms` }}
                className={`step-card step-in relative min-w-[210px] snap-start lg:min-w-0 flex min-h-[88px] cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${
                  selected
                    ? 'border-wise-cyan bg-wise-cyan/10'
                    : 'border-wise-cyan/15 bg-wise-navy/60 hover:border-wise-cyan/50 hover:bg-wise-cyan/5'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold ${
                    done
                      ? 'border-wise-neon bg-wise-neon/15 text-wise-neon'
                      : selected
                        ? 'border-wise-cyan bg-wise-cyan text-wise-navy'
                        : 'border-wise-cyan/50 text-wise-cyan'
                  }`}
                  aria-hidden="true"
                >
                  {done ? <CheckIcon size={18} /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={`flex items-center gap-2 text-sm font-bold ${
                      selected ? 'text-white' : 'text-white/90'
                    }`}
                  >
                    {tab.label}
                    {done && <span className="sr-only">(complete)</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-wise-cyan/70">
                    {tab.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="bg-wise-navy/60 border border-wise-cyan/15 rounded-2xl p-6 sm:p-8 animate-fade-in focus-visible:outline-none"
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
            className="bg-wise-navy/60 border border-wise-gold/25 rounded-2xl p-5 sm:p-6 transition-colors duration-200 hover:border-wise-gold/60"
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
            className="bg-wise-navy/60 border border-wise-neon/25 rounded-2xl p-5 sm:p-6 transition-colors duration-200 hover:border-wise-neon/60"
          >
            <h2 id="platforms-heading" className="text-wise-neon font-semibold mb-2">
              Publishing to
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
            <p className="mt-3 text-xs text-wise-cyan/70">
              Coming soon: {COMING_SOON.join(', ')}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
