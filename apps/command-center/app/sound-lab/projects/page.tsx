'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/contexts/AuthContext';
import { createProject, deleteProject, listProjects, createReviewLink } from '../../../src/lib/sound-lab/api';
import { SoundLabsProject } from '../../../src/lib/sound-lab/types';

export default function SoundLabProjectsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProjects(await listProjects());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, []);

  useEffect(() => { if (user?.id) load(); }, [user?.id, load]);

  if (isLoading) return <div className="p-8 sl-kicker">Loading…</div>;

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="sl-card">
          <h1 className="sl-title" style={{ fontSize: 32 }}>Productions</h1>
          <p className="text-sm text-text-secondary mt-2">
            Sign in to manage Sound Lab projects.{' '}
            <Link href="/login?redirect=/sound-lab/projects" className="text-wise-electric hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="wise-breadcrumb mb-3">
        <Link href="/sound-lab">Sound Lab</Link>
        <span className="opacity-30">/</span>
        <span>Projects</span>
      </div>
      <h1 className="sl-title" style={{ fontSize: 32 }}>Productions</h1>
      {error && <div className="sl-card text-warning text-sm mb-3">{error}</div>}
      <div className="flex gap-2 mb-4">
        <input className="wise-input" placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="sl-btn sl-btn-primary" onClick={async () => {
          if (!name.trim()) return;
          const p = await createProject(name.trim());
          router.push(`/sound-lab/projects/${p.id}`);
        }}>NEW PROJECT</button>
      </div>
      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="sl-card flex items-center justify-between">
            <div>
              <Link href={`/sound-lab/projects/${p.id}`} className="font-semibold hover:text-wise-green-neon">{p.name}</Link>
              <p className="text-xs text-text-muted">{(p.recordings || []).length} recordings · {new Date(p.updatedAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/sound-lab/projects/${p.id}`} className="sl-btn">OPEN</Link>
              <Link href={`/sound-lab/projects/${p.id}/review`} className="sl-btn">CLIENT</Link>
              <button className="sl-btn" onClick={async () => {
                const data = await createReviewLink(p.id);
                const path = data.path || `/sound-lab/share/${data.token}`;
                await navigator.clipboard.writeText(`${window.location.origin}${path}`);
              }}>SHARE</button>
              <button className="sl-btn" onClick={async () => { await deleteProject(p.id); load(); }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
