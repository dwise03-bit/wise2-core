'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserAuthToken } from '@/lib/auth-session';
import {
  Music,
  FileAudio,
  Library,
  Sparkles,
  Loader,
  AlertCircle,
  BarChart3,
  Trash2,
} from 'lucide-react';
import { StatCard } from '@/components/sound-labs/StatCard';
import { MeterGauge } from '@/components/sound-labs/MeterGauge';
import { ActivityChart } from '@/components/sound-labs/ActivityChart';
import { CreateProjectModal } from '@/components/sound-labs/CreateProjectModal';

interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount: number;
  recordings: Array<{ id: string; name: string; duration?: number }>;
  projectSize: number;
}

interface SoundLabsStats {
  projectCount: number;
  recordingCount: number;
  storageUsed: number;
}

const MAX_STORAGE = 10 * 1024 * 1024 * 1024; // 10 GB

export default function SoundLabsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [stats, setStats] = useState<SoundLabsStats>({
    projectCount: 0,
    recordingCount: 0,
    storageUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/sound-labs/me/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setProjects([]);
        setStats({ projectCount: 0, recordingCount: 0, storageUsed: 0 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Sound Labs data';
      setError(message);
      console.error('Error loading Sound Labs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getBrowserAuthToken();
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    fetchData(token);
  }, [router, fetchData]);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setDeletingId(projectId);
      const token = getBrowserAuthToken();

      const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSuccess = () => {
    const token = getBrowserAuthToken();
    if (token) {
      fetchData(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-wise-primary mx-auto mb-4 animate-spin" />
          <p className="text-wise-text-secondary">Loading Sound Labs...</p>
        </div>
      </div>
    );
  }

  const storagePercentage = (stats.storageUsed / MAX_STORAGE) * 100;
  const activityData = [
    { date: 'Mon', projects: 2, recordings: 4 },
    { date: 'Tue', projects: 3, recordings: 6 },
    { date: 'Wed', projects: 2, recordings: 3 },
    { date: 'Thu', projects: 4, recordings: 8 },
    { date: 'Fri', projects: 3, recordings: 5 },
    { date: 'Sat', projects: 1, recordings: 2 },
    { date: 'Sun', projects: 0, recordings: 1 },
  ];

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-wise-primary/10 border border-wise-primary-border rounded-lg">
                  <Music className="w-6 h-6 text-wise-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-wise-primary">Sound Labs</h1>
                  <p className="text-wise-text-secondary mt-1">Professional audio production workspace</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Projects"
            value={stats.projectCount}
            icon="📁"
            color="text-blue-400"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            label="Recordings"
            value={stats.recordingCount}
            icon="🎙️"
            color="text-purple-400"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            label="Storage Used"
            value={(stats.storageUsed / (1024 * 1024)).toFixed(1)}
            unit="MB"
            icon="💾"
            color="text-green-400"
          />
          <StatCard
            label="Workspace"
            value="PRO"
            icon="⭐"
            color="text-yellow-400"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Meter */}
          <div className="lg:col-span-2 bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-wise-primary" />
              <h3 className="text-lg font-semibold text-wise-text-primary">Storage Analytics</h3>
            </div>
            <div className="space-y-6">
              <MeterGauge
                label="Total Storage Used"
                value={stats.storageUsed / (1024 * 1024)}
                max={MAX_STORAGE / (1024 * 1024)}
                unit="MB"
                color={storagePercentage > 80 ? 'red' : storagePercentage > 50 ? 'orange' : 'blue'}
              />
              <MeterGauge
                label="Recordings"
                value={stats.recordingCount}
                max={Math.max(stats.recordingCount * 2, 50)}
                unit="items"
                color="purple"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-wise-text-primary mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-3 bg-wise-bg-secondary/50 rounded-lg">
                <p className="text-sm text-wise-text-muted">Avg. Project Size</p>
                <p className="text-xl font-bold text-wise-primary">
                  {stats.projectCount > 0
                    ? ((stats.storageUsed / stats.projectCount) / (1024 * 1024)).toFixed(1)
                    : '0'}
                  MB
                </p>
              </div>
              <div className="p-3 bg-wise-bg-secondary/50 rounded-lg">
                <p className="text-sm text-wise-text-muted">Avg. Recordings/Project</p>
                <p className="text-xl font-bold text-wise-primary">
                  {stats.projectCount > 0
                    ? (stats.recordingCount / stats.projectCount).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div className="p-3 bg-wise-bg-secondary/50 rounded-lg">
                <p className="text-sm text-wise-text-muted">Storage Available</p>
                <p className="text-xl font-bold text-green-400">
                  {((MAX_STORAGE - stats.storageUsed) / (1024 * 1024 * 1024)).toFixed(1)}
                  GB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-wise-text-primary mb-6">Weekly Activity</h3>
          <ActivityChart data={activityData} height={250} />
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Workspace Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/studio/jingle-lab"
              className="group bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 hover:bg-wise-bg-card/80 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Music className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-wise-text-primary mb-2">Jingle Lab</h3>
              <p className="text-sm text-wise-text-muted mb-4">
                Create professional jingles and sonic logos with AI-powered music composition.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-wise-primary">View Projects</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/studio/lyrics-lab"
              className="group bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 hover:bg-wise-bg-card/80 transition-all cursor-pointer opacity-60"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <FileAudio className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-wise-text-primary mb-2">Lyrics Lab</h3>
              <p className="text-sm text-wise-text-muted mb-4">
                Generate and refine lyrics with AI assistance. Perfect for songwriting and content creation.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-wise-primary">Coming Soon</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/gallery"
              className="group bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 hover:bg-wise-bg-card/80 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Library className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-wise-text-primary mb-2">Audio Library</h3>
              <p className="text-sm text-wise-text-muted mb-4">
                Browse, organize, and manage all your audio assets in one central location.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-wise-primary">Browse Assets</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Projects</h2>
            <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg overflow-hidden">
              <div className="divide-y divide-wise-primary-border">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/sound-labs/${project.id}`}
                    className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-wise-primary/10 rounded-lg flex-shrink-0">
                        <Music className="w-4 h-4 text-wise-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-wise-text-primary group-hover:text-wise-primary-light transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-sm text-wise-text-muted mt-1">
                          {project.recordingCount} recording{project.recordingCount !== 1 ? 's' : ''}
                          {' • '}
                          {(project.projectSize / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        {project.description && (
                          <p className="text-xs text-wise-text-muted mt-0.5 line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <div className="text-sm text-wise-text-muted">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project.id);
                        }}
                        disabled={deletingId === project.id}
                        className="p-2 hover:bg-red-500/20 text-wise-text-muted hover:text-red-400 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
              {projects.length > 5 && (
                <div className="p-4 text-center bg-wise-bg-secondary/50 border-t border-wise-primary-border">
                  <p className="text-wise-primary font-semibold">
                    View all {projects.length} projects →
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-12 text-center">
            <Music className="w-16 h-16 text-wise-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wise-text-primary mb-2">No Projects Yet</h3>
            <p className="text-wise-text-muted mb-6">
              Start creating professional audio content with Sound Labs.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
