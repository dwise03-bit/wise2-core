'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, StatusDot } from '../../../src/components/ui';

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
        <div className="h-6 w-32 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
        <p className="text-sm text-text-muted mt-1">Unified view of all your projects across modules</p>
      </div>

      {/* Stats Strip */}
      <Card className="p-1">
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
      </Card>

      {/* Projects Table */}
      {allProjects.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allProjects.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-text-primary">{p.name}</p>
                      {p.description && <p className="text-xs text-text-muted mt-0.5">{p.description}</p>}
                    </TableCell>
                    <TableCell><Badge variant="info">{p.type}</Badge></TableCell>
                    <TableCell><Badge variant="success">{p.status}</Badge></TableCell>
                    <TableCell className="text-text-muted">{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">&#128193;</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Projects Yet</h3>
          <p className="text-sm text-text-muted mb-6">Create projects in Sound Labs, Live Studio, or DTF Print Studio.</p>
          <Link href="/sound-lab">
            <Button variant="primary">Go to Sound Labs</Button>
          </Link>
        </Card>
      )}

      {/* Project Sources */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Project Sources</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Sound Labs', status: soundLabsAvailable ? 'Connected' : 'API Not Available', ok: soundLabsAvailable },
            { name: 'Live Studio', status: 'No Project Storage', ok: false },
            { name: 'DTF Print Studio', status: 'No Project Storage', ok: false },
            { name: 'Gallery', status: 'Assets Only', ok: false },
          ].map(src => (
            <div key={src.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-wise-black/30">
              <StatusDot status={src.ok ? 'success' : 'neutral'} />
              <div>
                <p className="text-xs font-medium text-text-secondary">{src.name}</p>
                <p className={`text-[10px] ${src.ok ? 'text-success' : 'text-text-muted'}`}>{src.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
