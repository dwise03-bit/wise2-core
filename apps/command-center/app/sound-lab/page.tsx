'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { createProject, listProjects } from '../../src/lib/sound-lab/api';
import { SoundLabsProject } from '../../src/lib/sound-lab/types';
import '../../src/styles/sound-lab.css';

export default function SoundLabCommandCenterPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [storage, setStorage] = useState(0);

  const load = useCallback(async () => {
    try {
      const list = await listProjects();
      setProjects(list);
      setStorage(list.reduce((n, p) => n + (p.recordings || []).reduce((s, r) => s + (r.fileSize || 0), 0), 0));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sound Lab API unavailable');
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [user?.id, load]);

  const startNew = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/sound-lab');
      return;
    }
    setCreating(true);
    try {
      const project = await createProject(`Production ${new Date().toLocaleDateString()}`, 'Sound Lab session');
      router.push(`/sound-lab/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <div className="p-8 sl-kicker">Loading Sound Lab…</div>;

  return (
    <div className="p-6 lg:p-8">
      {!isAuthenticated && (
        <div className="sl-card mb-4 text-sm">
          Sign in to create productions and save to your account.{' '}
          <Link href="/login?redirect=/sound-lab" className="text-wise-electric hover:underline">Log in</Link>
        </div>
      )}
      <section className="sl-hero">
        <div className="sl-kicker">WISE²</div>
        <h1 className="sl-title">SOUND LAB</h1>
        <div className="sl-sub">AI POWERED PRODUCTION STUDIO</div>
        <p className="text-sm text-text-secondary max-w-xl mt-3">
          Recording, editing, mixing, mastering, voice, MIDI, and delivery — native to the WISE² production console.
        </p>
        <div className="sl-actions">
          <button className="sl-btn sl-btn-primary" onClick={startNew} disabled={creating || !isAuthenticated}>{creating ? 'CREATING…' : 'NEW PROJECT'}</button>
          <Link href="/sound-lab/projects" className="sl-btn">OPEN PROJECT</Link>
          <Link href="/sound-lab/projects" className="sl-btn">IMPORT AUDIO</Link>
          <Link href="/sound-lab/projects" className="sl-btn">RECORD</Link>
          <Link href="/sound-lab/plugins" className="sl-btn">ASK AI PRODUCER</Link>
        </div>
      </section>

      {error && <div className="sl-card mt-4 text-sm text-warning">{error}</div>}

      <div className="sl-grid">
        <div className="sl-card">
          <h3>Recent projects</h3>
          {projects.slice(0, 6).map((p) => (
            <Link key={p.id} href={`/sound-lab/projects/${p.id}`} className="block text-sm py-1 hover:text-wise-green-neon">
              {p.name}
            </Link>
          ))}
          {projects.length === 0 && <p className="text-xs text-text-muted">No productions yet.</p>}
        </div>
        <div className="sl-card">
          <h3>Recording / sessions</h3>
          <p className="text-sm">Idle — open a project to arm a track.</p>
          <p className="text-xs text-text-muted mt-2">{projects.length} active productions</p>
        </div>
        <div className="sl-card">
          <h3>Storage</h3>
          <p className="text-2xl font-mono text-wise-green-neon">{(storage / (1024 * 1024)).toFixed(1)} MB</p>
          <p className="text-xs text-text-muted">Gallery-backed audio, not database blobs</p>
        </div>
        <div className="sl-card">
          <h3>Processing</h3>
          <p className="text-sm">MusicGen {process.env.NEXT_PUBLIC_API_URL ? 'via API' : 'local'} · stems BLOCKED</p>
        </div>
        <div className="sl-card">
          <h3>Exports / releases</h3>
          <Link href="/sound-lab/releases" className="text-xs text-wise-electric">Open release center →</Link>
        </div>
        <div className="sl-card">
          <h3>Modules</h3>
          <Link href="/sound-lab/jingle" className="block text-sm">Jingle Production</Link>
          <Link href="/sound-lab/personas" className="block text-sm">Personas / Voice Lab</Link>
          <Link href="/dashboard/live-studio" className="block text-sm">Live Studio</Link>
          <Link href="/dashboard/gallery" className="block text-sm">Gallery</Link>
        </div>
      </div>
    </div>
  );
}
