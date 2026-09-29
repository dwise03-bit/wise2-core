'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { getSoundLabApiBase, getSoundLabToken } from '../../../src/lib/sound-lab/api';

interface Persona {
  id: string;
  filename: string;
  originalName: string;
  metadata: {
    personaName?: string;
    owner?: string;
    authorization?: boolean;
    permittedUses?: string;
    status?: string;
  } | null;
  createdAt: string;
}

export default function PersonasPage() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [name, setName] = useState('');
  const [uses, setUses] = useState('project-internal production');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    const token = getSoundLabToken();
    const res = await fetch(
      `${getSoundLabApiBase()}/v1/gallery?userId=${user.id}&sourceModule=sound-lab-persona`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      const data = await res.json();
      setPersonas(data.assets || []);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const create = async () => {
    if (!authorized) {
      setError('Explicit ownership/authorization is required. WISE² will not create unauthorized voice personas.');
      return;
    }
    if (!name.trim()) return;
    const token = getSoundLabToken();
    const blob = new Blob([JSON.stringify({ personaName: name, owner: user?.email, authorized: true })], { type: 'application/json' });
    const form = new FormData();
    form.append('file', blob, `${name.replace(/\s+/g, '-')}.json`);
    form.append('sourceModule', 'sound-lab-persona');
    form.append('metadata', JSON.stringify({
      personaName: name,
      owner: user?.id,
      authorization: true,
      permittedUses: uses,
      status: 'authorized',
    }));
    const res = await fetch(`${getSoundLabApiBase()}/v1/gallery/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      setError('Upload failed');
      return;
    }
    setName('');
    setAuthorized(false);
    await load();
  };

  return (
    <div className="p-6">
      <div className="wise-breadcrumb mb-3"><Link href="/sound-lab">Sound Lab</Link><span className="opacity-30">/</span><span>Personas</span></div>
      <h1 className="sl-title" style={{ fontSize: 32 }}>Personas</h1>
      <p className="text-sm text-text-secondary max-w-xl mt-2">
        Voice cloning lives in Voice Lab. This page only stores authorized personas you own. Impersonation of people without consent is not supported.
      </p>
      {error && <div className="sl-card text-warning text-sm mt-3">{error}</div>}
      <div className="sl-card mt-4 max-w-lg space-y-2">
        <input className="wise-input" placeholder="Persona name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="wise-input" placeholder="Permitted uses" value={uses} onChange={(e) => setUses(e.target.value)} />
        <label className="text-xs flex gap-2 items-start">
          <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} />
          I own this voice or have written authorization to adapt it.
        </label>
        <button className="sl-btn sl-btn-primary" onClick={create}>REGISTER PERSONA</button>
        <Link href="/dashboard/ai" className="sl-btn">Open Voice / Hermes tools</Link>
      </div>
      <div className="mt-4 space-y-2">
        {personas.map((p) => (
          <div key={p.id} className="sl-card">
            <div className="font-semibold">{p.metadata?.personaName || p.originalName}</div>
            <p className="text-xs text-text-muted">Status {p.metadata?.status || 'authorized'} · {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
