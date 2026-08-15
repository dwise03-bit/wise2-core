'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Music, Zap, FileAudio, Library, Sparkles, Loader, AlertCircle } from 'lucide-react';

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
  const router = useRouter();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [stats, setStats] = useState<SoundLabsStats>({
    projectCount: 0,
    recordingCount: 0,
    storageUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects
      const projectsRes = await fetch('/api/v1/sound-labs/me/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        const projectList = data.projects || [];
        setProjects(projectList);

        // Calculate stats
        const recordingCount = projectList.reduce(
          (sum: number, p: any) => sum + (p.recordings?.length || 0),
          0
        );
        const storageUsed = projectList.reduce(
          (sum: number, p: any) => sum + (p.projectSize || 0),
          0
        );

        setStats({
          projectCount: projectList.length,
          recordingCount,
          storageUsed: Math.round(storageUsed / 1024 / 1024), // Convert to MB
          lastActive: projectList[0]?.updatedAt,
        });
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

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
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
            <Link
              href="/studio/jingle-lab/new"
              className="px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading Sound Labs</p>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Projects', value: stats.projectCount, icon: '📁', color: 'text-blue-400' },
            { label: 'Recordings', value: stats.recordingCount, icon: '🎙️', color: 'text-purple-400' },
            { label: 'Storage Used', value: `${stats.storageUsed} MB`, icon: '💾', color: 'text-green-400' },
            { label: 'Workspace', value: 'PRO', icon: '⭐', color: 'text-yellow-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-sm text-wise-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Workspace Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Jingle Lab */}
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
                <span className="text-white/50">→</span>
              </div>
            </Link>

            {/* Lyrics Lab */}
            <Link
              href="/studio/lyrics-lab"
              className="group bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 hover:bg-wise-bg-card/80 transition-all cursor-pointer"
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
                <span className="text-white/50">→</span>
              </div>
            </Link>

            {/* Audio Library */}
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
                <span className="text-white/50">→</span>
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
                    href={`/studio/jingle-lab/${project.id}`}
                    className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-wise-primary/10 rounded-lg">
                        <Music className="w-4 h-4 text-wise-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-wise-text-primary group-hover:text-wise-primary-light transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-wise-text-muted mt-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-wise-text-muted">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
              {projects.length > 5 && (
                <Link
                  href="/studio/jingle-lab"
                  className="block p-4 text-center text-wise-primary hover:text-wise-primary-light transition-colors font-semibold bg-wise-bg-secondary/50 border-t border-wise-primary-border"
                >
                  View all {projects.length} projects →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-12 text-center">
            <Music className="w-16 h-16 text-wise-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wise-text-primary mb-2">No Projects Yet</h3>
            <p className="text-wise-text-muted mb-6">Start creating professional audio content with Sound Labs.</p>
            <Link
              href="/studio/jingle-lab/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
