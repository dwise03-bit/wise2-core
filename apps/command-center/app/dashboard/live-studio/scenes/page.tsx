'use client';

import React from 'react';
import Link from 'next/link';

export default function LiveStudioScenesPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="wise-breadcrumb mb-2">
          <Link href="/dashboard/live-studio">Live Studio</Link>
          <span className="opacity-30">/</span>
          <span className="text-text-secondary">Scenes</span>
        </div>
        <h1 className="wise-page-title">Scenes</h1>
        <p className="wise-page-subtitle">Manage stream scenes, sources, and layouts</p>
      </div>

      {/* Scene Manager Status */}
      <div className="wise-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Scene Manager</h2>
          <span className="wise-badge-warning">UI Only</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Scene management exists in the Studio app (apps/studio) with components for scene creation,
          source management, transitions, and preview canvas. These need integration into the Command Center.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Scene Creation', status: 'UI ONLY', desc: 'Create/switch between scenes' },
            { label: 'Source Manager', status: 'UI ONLY', desc: 'Add camera, screen, browser sources' },
            { label: 'Transitions', status: 'UI ONLY', desc: 'Cut, fade, slide between scenes' },
            { label: 'Preview Canvas', status: 'UI ONLY', desc: 'Live canvas composition preview' },
            { label: 'Audio Mixer', status: 'PARTIAL', desc: 'Web Audio API mixer with gain nodes' },
            { label: 'Source Capture', status: 'PARTIAL', desc: 'getUserMedia/getDisplayMedia capture' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-wise-black/30">
              <span className={item.status === 'PARTIAL' ? 'wise-badge-info' : 'wise-badge-warning'}>{item.status}</span>
              <div>
                <p className="text-xs font-medium text-text-secondary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Studio Reference */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Studio Implementation Reference</h2>
        <p className="text-xs text-text-muted mb-3">
          Components in <code className="text-wise-electric">apps/studio/components/LiveStudio/</code> available for integration:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'SceneManager', 'SourceManager', 'PreviewCanvas', 'AddSourceModal',
            'AudioMixer', 'MasterChannel', 'StreamControl', 'StreamStats',
            'ChatOverlay', 'MultistreamConfig', 'RecordingControl', 'ReplayBuffer',
          ].map(comp => (
            <div key={comp} className="px-3 py-2 bg-wise-black/30 rounded text-text-muted font-mono text-[10px]">{comp}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
