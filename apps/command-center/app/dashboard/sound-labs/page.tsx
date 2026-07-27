'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

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

interface PlanEntitlements {
  canAccessSoundLabs: boolean;
  canGenerateMusic: boolean;
  canUseVoiceTools: boolean;
  canExportAudio: boolean;
  monthlyGenerations: number | null;
  projectLimit: number | null;
  storageGbLimit: number | null;
}

interface CustomerProfile {
  subscription: { plan: string; status: string };
  entitlements: PlanEntitlements;
  upgradeUrl: string;
}

export default function SoundLabsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const headers = { Authorization: `Bearer ${token}` };

      const [projectsRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/v1/sound-labs/me/projects`, { headers }),
        fetch(`${API_URL}/v1/billing/customer/me`, { headers }).catch(() => null),
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
        setApiAvailable(true);
      }

      if (profileRes?.ok) {
        setProfile(await profileRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchData();
  }, [user?.id, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="wise-skeleton h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const plan = profile?.subscription?.plan || 'FREE';
  const entitlements = profile?.entitlements;
  const projectCount = projects.length;
  const projectLimit = entitlements?.projectLimit;
  const monthlyGens = entitlements?.monthlyGenerations;
  const recordingCount = projects.reduce((sum, p) => sum + (p.recordingCount || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="wise-page-title">Sound Labs</h1>
          <p className="wise-page-subtitle">Professional audio production workspace</p>
        </div>
        <Link href="/dashboard/sound-labs/projects" className="wise-btn-primary">
          + New Project
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {!apiAvailable && !error && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Not Connected</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Sound Labs API Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">The Sound Labs API runs on port 3011. Start the platform container to connect.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Plan', value: plan },
            { label: 'Projects', value: projectLimit != null ? `${projectCount} / ${projectLimit}` : String(projectCount) },
            { label: 'Generations', value: monthlyGens != null ? String(monthlyGens) : 'Unlimited' },
            { label: 'Recordings', value: String(recordingCount) },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {plan === 'FREE' && (
        <div className="wise-card p-5 border-wise-electric/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-0.5">Unlock Sound Labs</h3>
              <p className="text-xs text-text-muted">Upgrade to Starter or Pro to access music generation, voice tools, and audio export.</p>
            </div>
            <Link href={profile?.upgradeUrl || '/pricing?target=STARTER'} className="wise-btn-primary flex-shrink-0">
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Workspace Modules */}
      <div>
        <h2 className="wise-section-title mb-3">Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Jingle Lab', desc: 'Create professional jingles and sonic logos with AI-powered composition.', href: '/dashboard/sound-labs/jingle-lab', badge: entitlements?.canGenerateMusic ? 'READY' : 'LOCKED', badgeClass: entitlements?.canGenerateMusic ? 'wise-badge-success' : 'wise-badge-warning' },
            { title: 'Projects', desc: 'Manage your audio production projects. Create, organize, and collaborate.', href: '/dashboard/sound-labs/projects', badge: apiAvailable ? 'WORKING' : 'NOT CONNECTED', badgeClass: apiAvailable ? 'wise-badge-success' : 'wise-badge-danger' },
            { title: 'Audio Library', desc: 'Browse, organize, and manage all your audio assets in one location.', href: '/dashboard/sound-labs/library', badge: 'READY', badgeClass: 'wise-badge-success' },
          ].map(mod => (
            <Link key={mod.title} href={mod.href} className="wise-card-interactive p-5 group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-text-primary group-hover:text-wise-electric transition-colors">{mod.title}</h3>
                <span className={mod.badgeClass}>{mod.badge}</span>
              </div>
              <p className="text-sm text-text-muted mb-3">{mod.desc}</p>
              <span className="text-xs text-wise-electric">Open &rarr;</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="wise-section-title">Recent Projects</h2>
            <Link href="/dashboard/sound-labs/projects" className="text-xs text-wise-electric hover:underline">View All &rarr;</Link>
          </div>
          <div className="wise-card overflow-hidden">
            <div className="divide-y divide-border-subtle">
              {projects.slice(0, 5).map(project => (
                <div key={project.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-text-primary">{project.name}</h3>
                    {project.description && <p className="text-xs text-text-muted mt-0.5">{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted tabular-nums">{project.recordingCount || 0} recordings</span>
                    <span className="text-xs text-text-muted">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !error && apiAvailable ? (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#127925;</div>
          <h3 className="wise-empty-title">No Projects Yet</h3>
          <p className="wise-empty-desc">Start creating professional audio content with Sound Labs.</p>
          <Link href="/dashboard/sound-labs/projects" className="wise-btn-primary">+ Create Your First Project</Link>
        </div>
      ) : null}
    </div>
  );
}
