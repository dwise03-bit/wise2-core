'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [soundLabsProjects, setSoundLabsProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundLabsAvailable, setSoundLabsAvailable] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      const token = getToken();

      try {
        const res = await fetch('/api/v1/sound-labs/me/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const projects = (data.projects || []).map((p: Record<string, unknown>) => ({
            ...p,
            type: 'Sound Labs',
            status: 'Active',
          }));
          setSoundLabsProjects(projects);
          setSoundLabsAvailable(true);
        }
      } catch { /* Sound Labs API may not be available */ }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  const allProjects = [...soundLabsProjects];

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
          <p className="text-text-secondary">Unified view of all your projects across modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: allProjects.length, icon: '📁' },
          { label: 'Sound Labs', value: soundLabsProjects.length, icon: '🎵' },
          { label: 'Live Studio', value: 0, icon: '📻' },
          { label: 'DTF Print', value: 0, icon: '🖨' },
        ].map(s => (
          <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{s.icon}</span>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-wise-electric">{s.value}</p>
          </div>
        ))}
      </div>

      {allProjects.length > 0 ? (
        <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wise-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wise-border">
                {allProjects.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{p.name}</p>
                      {p.description && <p className="text-xs text-text-muted">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 bg-wise-electric/10 text-wise-electric rounded">{p.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-400 rounded">{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-5xl block mb-4 opacity-30">📁</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Projects Yet</h3>
          <p className="text-text-muted mb-6">Create projects in Sound Labs, Live Studio, or DTF Print Studio.</p>
          <Link href="/dashboard/sound-labs"
            className="px-6 py-3 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors inline-block">
            Go to Sound Labs
          </Link>
        </div>
      )}

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Project Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[
            { name: 'Sound Labs', status: soundLabsAvailable ? 'Connected' : 'API Not Available', ok: soundLabsAvailable },
            { name: 'Live Studio', status: 'No Project Storage', ok: false },
            { name: 'DTF Print Studio', status: 'No Project Storage', ok: false },
            { name: 'Gallery', status: 'Assets Only', ok: false },
          ].map(src => (
            <div key={src.name} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${src.ok ? 'bg-green-400' : 'bg-gray-500'}`} />
              <div>
                <p className="text-sm font-medium text-text-primary">{src.name}</p>
                <p className={`text-xs ${src.ok ? 'text-green-400' : 'text-text-muted'}`}>{src.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
