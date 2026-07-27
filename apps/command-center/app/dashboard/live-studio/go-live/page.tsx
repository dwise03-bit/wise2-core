'use client';

import React from 'react';
import Link from 'next/link';

export default function GoLivePage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="wise-breadcrumb mb-2">
          <Link href="/dashboard/live-studio">Live Studio</Link>
          <span className="opacity-30">/</span>
          <span className="text-text-secondary">Go Live</span>
        </div>
        <h1 className="wise-page-title">Go Live</h1>
        <p className="wise-page-subtitle">Live streaming to platforms</p>
      </div>

      {/* Status */}
      <div className="wise-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Setup Required</h2>
          <span className="wise-badge-warning">Not Available</span>
        </div>
        <p className="text-xs text-text-muted mb-4">Live streaming requires RTMP backend infrastructure.</p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-wise-black/30">
            <h3 className="text-xs font-semibold text-text-primary mb-2">What's needed to go live:</h3>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {[
                { ok: false, text: 'RTMP server (Nginx RTMP module or Node RTMP)' },
                { ok: false, text: 'Stream key management and validation' },
                { ok: false, text: 'Platform OAuth (YouTube, Twitch, Facebook, LinkedIn)' },
                { ok: false, text: 'HLS transcoding for viewer playback' },
                { ok: true, text: 'Camera capture (getUserMedia) - WORKING' },
                { ok: true, text: 'Screen capture (getDisplayMedia) - WORKING' },
                { ok: true, text: 'Local recording to Gallery - WORKING' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={`wise-status-dot ${item.ok ? 'bg-green-400' : 'bg-danger'}`} />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-wise-black/30">
            <h3 className="text-xs font-semibold text-text-primary mb-2">Existing implementations (in Studio app):</h3>
            <ul className="space-y-1 text-xs text-text-muted">
              <li><code className="text-wise-electric">RtmpServer</code> - Class structure exists, no actual RTMP server wired</li>
              <li><code className="text-wise-electric">MultistreamEngine</code> - UI + types, no real platform connections</li>
              <li><code className="text-wise-electric">StreamPipeline</code> - WebRTC + Canvas composition, no outbound RTMP</li>
              <li><code className="text-wise-electric">useStreaming</code> - State management hook, API calls are stubs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* What You Can Do Now */}
      <div>
        <h2 className="wise-section-title mb-3">What you can do now</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Record Camera', desc: 'Capture webcam video with audio', href: '/dashboard/live-studio' },
            { title: 'Record Screen', desc: 'Capture screen or window with audio', href: '/dashboard/live-studio' },
            { title: 'View Recordings', desc: 'Play, download, or manage saved recordings', href: '/dashboard/live-studio/recordings' },
          ].map(card => (
            <Link key={card.title} href={card.href} className="wise-card-interactive p-4 group">
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors mb-0.5">{card.title}</h3>
              <p className="text-xs text-text-muted">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
