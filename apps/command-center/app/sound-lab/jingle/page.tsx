'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/contexts/AuthContext';
import { createProject, listProjects, saveMixerState } from '../../../src/lib/sound-lab/api';
import { DEFAULT_MIXER_STATE, SoundLabsProject, normalizeMixerState } from '../../../src/lib/sound-lab/types';

const STAGES = ['Brief', 'Concept', 'Lyrics', 'Composition', 'Voice', 'Production', 'Mix', 'Master', 'Approval', 'Delivery'];

export default function JingleModulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<SoundLabsProject[]>([]);
  const [brief, setBrief] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    listProjects().then(setProjects).catch(() => setProjects([]));
  }, [user?.id]);

  const start = async () => {
    const project = await createProject(`Jingle ${new Date().toLocaleDateString()}`, brief || 'Jingle production');
    await saveMixerState(project.id, {
      ...DEFAULT_MIXER_STATE,
      jingle: { stage: 'Brief', brief, lyrics: '' },
    });
    router.push(`/sound-lab/projects/${project.id}`);
  };

  return (
    <div className="p-6">
      <div className="wise-breadcrumb mb-3"><Link href="/sound-lab">Sound Lab</Link><span className="opacity-30">/</span><span>Jingle Production</span></div>
      <h1 className="sl-title" style={{ fontSize: 32 }}>Jingle Production</h1>
      <p className="text-sm text-text-secondary mt-2">Jingle Lab is a workflow inside Sound Lab — same engine, same projects, no duplicate DAW.</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
        {STAGES.map((s, i) => (
          <div key={s} className="sl-card text-center">
            <div className="text-wise-green-neon text-xs">{i + 1}</div>
            <div className="text-sm font-semibold">{s}</div>
          </div>
        ))}
      </div>
      <div className="sl-card mt-4 max-w-xl">
        <textarea className="wise-input w-full h-24" placeholder="Brief: 15s radio sting, upbeat, brand name…" value={brief} onChange={(e) => setBrief(e.target.value)} />
        <button className="sl-btn sl-btn-primary mt-2" onClick={start}>START JINGLE PROJECT</button>
      </div>
      <div className="mt-4 space-y-2">
        {projects.filter((p) => normalizeMixerState(p.mixerState).jingle || p.description?.toLowerCase().includes('jingle')).map((p) => (
          <Link key={p.id} href={`/sound-lab/projects/${p.id}`} className="sl-card block">{p.name}</Link>
        ))}
      </div>
    </div>
  );
}
