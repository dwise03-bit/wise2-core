'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { listProjects, saveMixerState } from '../../../src/lib/sound-lab/api';
import { SoundLabsProject, normalizeMixerState } from '../../../src/lib/sound-lab/types';

export default function ReleasesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    listProjects().then(setProjects).catch(() => setProjects([]));
  }, [user?.id]);

  return (
    <div className="p-6">
      <div className="wise-breadcrumb mb-3"><Link href="/sound-lab">Sound Lab</Link><span className="opacity-30">/</span><span>Releases</span></div>
      <h1 className="sl-title" style={{ fontSize: 32 }}>Release Center</h1>
      <p className="text-sm text-text-secondary mt-2">Delivery management. WISE² does not distribute to Spotify/Apple unless a real integration exists (none connected).</p>
      <div className="space-y-2 mt-4">
        {projects.map((p) => {
          const mix = normalizeMixerState(p.mixerState);
          const approval = mix.approval?.status || 'draft';
          return (
            <div key={p.id} className="sl-card flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <p className="text-xs text-text-muted">
                  Master: {(p.recordings || []).length} assets · approval {approval} · {mix.release?.status || 'draft'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/sound-lab/projects/${p.id}`} className="sl-btn">OPEN</Link>
                <button className="sl-btn" onClick={async () => {
                  await saveMixerState(p.id, { ...mix, release: { status: 'ready', title: p.name } });
                  setProjects(await listProjects());
                }}>MARK READY</button>
                <Link href={`/sound-lab/projects/${p.id}/review`} className="sl-btn">CLIENT REVIEW</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
