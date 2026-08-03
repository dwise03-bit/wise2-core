'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount?: number;
}

export default function SoundLabsProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchProjects();
  }, [user?.id, fetchProjects]);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/v1/sound-labs/me/projects`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim(), description: newProjectDesc.trim() || undefined }),
      });
      if (res.ok) {
        setNewProjectName('');
        setNewProjectDesc('');
        setShowCreateForm(false);
        await fetchProjects();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || `Create failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    setDeletingId(projectId);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/v1/sound-labs/me/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || `Delete failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {[1, 2].map(i => <div key={i} className="wise-skeleton h-24 rounded-lg" />)}
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
            <span className="text-text-secondary">Projects</span>
          </div>
          <h1 className="wise-page-title">Projects</h1>
          <p className="wise-page-subtitle">Manage your audio production projects</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="wise-btn-primary">
          + New Project
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="wise-card p-5 border-wise-electric/30">
          <h3 className="text-sm font-semibold text-text-primary mb-4">New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Project Name *</label>
              <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                placeholder="My Audio Project" className="wise-input" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Description (optional)</label>
              <input type="text" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}
                placeholder="Brief description" className="wise-input" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={creating || !newProjectName.trim()}
              className="wise-btn-primary disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Project'}
            </button>
            <button onClick={() => { setShowCreateForm(false); setNewProjectName(''); setNewProjectDesc(''); }}
              className="wise-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="wise-card overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {projects.map(project => (
              <div key={project.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-text-primary">{project.name}</h3>
                  {project.description && <p className="text-xs text-text-muted mt-0.5">{project.description}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-muted tabular-nums">{project.recordingCount || 0} recordings</span>
                  <span className="text-xs text-text-muted">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  <button onClick={() => handleDelete(project.id)} disabled={deletingId === project.id}
                    className="text-xs text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                    {deletingId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !showCreateForm ? (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#127925;</div>
          <h3 className="wise-empty-title">No Projects Yet</h3>
          <p className="wise-empty-desc">Create your first audio production project.</p>
          <button onClick={() => setShowCreateForm(true)} className="wise-btn-primary">+ Create Project</button>
        </div>
      ) : null}
    </div>
  );
}
