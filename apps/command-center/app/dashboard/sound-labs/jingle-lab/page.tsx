'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface SoundLabsProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount?: number;
}

export default function JingleLabPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const res = await fetch(`${API_URL}/v1/sound-labs/me/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchProjects();
  }, [user?.id, fetchProjects]);

  const handleQuickCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/v1/sound-labs/me/projects`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Jingle ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          description: 'Created from Jingle Lab',
        }),
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Create failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="wise-skeleton h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="wise-breadcrumb mb-2">
            <Link href="/dashboard/sound-labs">Sound Labs</Link>
            <span className="opacity-30">/</span>
            <span className="text-text-secondary">Jingle Lab</span>
          </div>
          <h1 className="wise-page-title">Jingle Lab</h1>
          <p className="wise-page-subtitle">Create professional jingles and sonic logos</p>
        </div>
        <button onClick={handleQuickCreate} disabled={creating} className="wise-btn-primary disabled:opacity-50">
          {creating ? 'Creating...' : '+ New Jingle Project'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {/* Workflow */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Jingle Creation Workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Create Project', desc: 'Start a new jingle project', status: 'READY' },
            { step: '2', label: 'Generate / Import', desc: 'AI generation or import audio', status: 'READY' },
            { step: '3', label: 'Edit & Mix', desc: 'Refine your audio creation', status: 'COMING SOON' },
            { step: '4', label: 'Export & Use', desc: 'Send to Live Studio or download', status: 'READY' },
          ].map(item => (
            <div key={item.step} className="flex flex-col items-center text-center p-4 rounded-lg bg-wise-black/40">
              <div className="w-9 h-9 rounded-full bg-wise-electric/15 border border-wise-electric/30 flex items-center justify-center text-wise-electric font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-0.5">{item.label}</h3>
              <p className="text-xs text-text-muted mb-2">{item.desc}</p>
              <span className={item.status === 'READY' ? 'wise-badge-success' : 'wise-badge-warning'}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h2 className="wise-section-title mb-3">Your Jingle Projects</h2>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(project => (
              <div key={project.id} className="wise-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{project.name}</h3>
                  <span className="text-xs text-text-muted">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                {project.description && <p className="text-xs text-text-muted mb-3">{project.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted tabular-nums">{project.recordingCount || 0} recordings</span>
                  <Link href="/dashboard/sound-labs/library" className="text-xs text-wise-electric hover:underline">
                    Open in Library &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wise-empty wise-card">
            <div className="wise-empty-icon">&#127925;</div>
            <h3 className="wise-empty-title">No Jingle Projects</h3>
            <p className="wise-empty-desc">Click "New Jingle Project" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
