'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

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
        const res = await fetch(`${API_URL}/v1/sound-labs/me/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSoundLabsProjects((data.projects || []).map((p: Record<string, unknown>) => ({ ...p, type: 'Sound Labs', status: 'Active' })));
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
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-32" />
        <div className="wise-skeleton h-3 w-56" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">Projects</h1>
        <p className="wise-page-subtitle">Unified view of all your projects across modules</p>
      </div>

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Total', value: allProjects.length },
            { label: 'Sound Labs', value: soundLabsProjects.length },
            { label: 'Live Studio', value: 0 },
            { label: 'DTF Print', value: 0 },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      {allProjects.length > 0 ? (
        <div className="wise-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="wise-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {allProjects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-medium text-text-primary">{p.name}</p>
                      {p.description && <p className="text-xs text-text-muted mt-0.5">{p.description}</p>}
                    </td>
                    <td><span className="wise-badge-info">{p.type}</span></td>
                    <td><span className="wise-badge-success">{p.status}</span></td>
                    <td className="text-text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#128193;</div>
          <h3 className="wise-empty-title">No Projects Yet</h3>
          <p className="wise-empty-desc">Create projects in Sound Labs, Live Studio, or DTF Print Studio.</p>
          <Link href="/dashboard/sound-labs" className="wise-btn-primary">Go to Sound Labs</Link>
        </div>
      )}

      {/* Project Sources */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Project Sources</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Sound Labs', status: soundLabsAvailable ? 'Connected' : 'API Not Available', ok: soundLabsAvailable },
            { name: 'Live Studio', status: 'No Project Storage', ok: false },
            { name: 'DTF Print Studio', status: 'No Project Storage', ok: false },
            { name: 'Gallery', status: 'Assets Only', ok: false },
          ].map(src => (
            <div key={src.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-wise-black/30">
              <span className={`wise-status-dot ${src.ok ? 'bg-green-400' : 'bg-text-muted'}`} />
              <div>
                <p className="text-xs font-medium text-text-secondary">{src.name}</p>
                <p className={`text-[10px] ${src.ok ? 'text-green-400' : 'text-text-muted'}`}>{src.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
