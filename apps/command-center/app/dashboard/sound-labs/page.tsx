'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount?: number;
}

interface SoundLabsStats {
  projectCount: number;
  recordingCount: number;
  storageUsed: number;
  lastActive?: string;
}

export default function SoundLabsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [stats, setStats] = useState<SoundLabsStats>({
    projectCount: 0,
    recordingCount: 0,
    storageUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setProjects([]);
        setStats({ projectCount: 0, recordingCount: 0, storageUsed: 0 });
        setLoading(false);
        return;
      }

      const projectsRes = await fetch('/api/v1/sound-labs/me/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        const projectList = data.projects || [];
        setProjects(projectList);

        const recordingCount = projectList.reduce(
          (sum: number, p: SoundLabsProject) => sum + (p.recordingCount || 0),
          0
        );

        setStats({
          projectCount: projectList.length,
          recordingCount,
          storageUsed: 0,
          lastActive: projectList[0]?.updatedAt,
        });
      } else {
        setProjects([]);
        setStats({ projectCount: 0, recordingCount: 0, storageUsed: 0 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Sound Labs data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user?.id, fetchData]);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('/api/v1/sound-labs/me/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewProjectName('');
        setNewProjectDesc('');
        setShowCreateForm(false);
        await fetchData();
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
      const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Sound Labs</h1>
          <p className="text-text-secondary">Professional audio production workspace</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <span>+</span> New Project
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg flex-shrink-0">!</span>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-wise-surface border border-wise-electric/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Audio Project"
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary placeholder-text-muted focus:border-wise-electric focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Description (optional)</label>
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief description of this project"
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary placeholder-text-muted focus:border-wise-electric focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating || !newProjectName.trim()}
                className="px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setNewProjectName(''); setNewProjectDesc(''); }}
                className="px-4 py-2 border border-wise-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: stats.projectCount, icon: '📁' },
          { label: 'Recordings', value: stats.recordingCount, icon: '🎙️' },
          { label: 'Storage Used', value: `${stats.storageUsed} MB`, icon: '💾' },
          { label: 'Workspace', value: 'PRO', icon: '⭐' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold text-wise-electric mb-2">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-text-primary">Workspace Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jingle Lab */}
          <div className="group bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
                <span className="text-2xl">🎵</span>
              </div>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">READY</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Jingle Lab</h3>
            <p className="text-sm text-text-muted mb-4">
              Create professional jingles and sonic logos with AI-powered music composition.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-sm text-wise-electric hover:text-wise-electric_hover transition-colors"
            >
              Create Project &rarr;
            </button>
          </div>

          {/* Lyrics Lab */}
          <div className="group bg-wise-surface border border-wise-border rounded-lg p-6 opacity-80">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full font-medium">COMING SOON</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Lyrics Lab</h3>
            <p className="text-sm text-text-muted mb-4">
              Generate and refine lyrics with AI assistance. Perfect for songwriting and content creation.
            </p>
            <span className="text-sm text-amber-400">Coming Soon</span>
          </div>

          {/* Audio Library */}
          <Link
            href="/dashboard/gallery"
            className="group bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">READY</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Audio Library</h3>
            <p className="text-sm text-text-muted mb-4">
              Browse, organize, and manage all your audio assets in one central location.
            </p>
            <span className="text-sm text-wise-electric">Browse Assets &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Recent Projects</h2>
          <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
            <div className="divide-y divide-wise-border">
              {projects.slice(0, 10).map((project) => (
                <div
                  key={project.id}
                  className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-wise-electric/10 rounded-lg">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-text-muted mt-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="text-sm text-red-400/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === project.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && !showCreateForm && (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-6xl block mx-auto mb-4 opacity-30">🎵</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Projects Yet</h3>
          <p className="text-text-muted mb-6">Start creating professional audio content with Sound Labs.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors"
          >
            <span>+</span>
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
