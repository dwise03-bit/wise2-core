'use client';

import Link from 'next/link';

const PROCESSORS = [
  { name: 'EQ', status: 'WORKING', note: '3-band Web Audio BiquadFilter' },
  { name: 'Compressor', status: 'WORKING', note: 'DynamicsCompressorNode' },
  { name: 'Limiter', status: 'WORKING', note: 'High-ratio compressor on master' },
  { name: 'Gate / HPF', status: 'PARTIAL', note: 'Implemented as high-pass cleanup, not a true expander' },
  { name: 'Reverb', status: 'WORKING', note: 'Generated impulse + ConvolverNode' },
  { name: 'Delay', status: 'WORKING', note: 'DelayNode with feedback' },
  { name: 'Filter', status: 'WORKING', note: 'BiquadFilter high-pass' },
  { name: 'Distortion / saturation', status: 'WORKING', note: 'WaveShaper' },
  { name: 'Stereo width', status: 'PARTIAL', note: 'Passthrough / pan; true M/S not implemented' },
  { name: 'Gain', status: 'WORKING', note: 'GainNode' },
  { name: 'Pitch', status: 'PARTIAL', note: 'Not time-stretch; avoid claiming Elastic-style pitch' },
  { name: 'Noise reduction', status: 'PARTIAL', note: 'Gate + HPF only' },
  { name: 'Stem separation', status: 'BLOCKED', note: 'No Demucs/GPU adapter connected' },
];

export default function PluginsPage() {
  return (
    <div className="p-6">
      <div className="wise-breadcrumb mb-3"><Link href="/sound-lab">Sound Lab</Link><span className="opacity-30">/</span><span>Plugins</span></div>
      <h1 className="sl-title" style={{ fontSize: 32 }}>Processors</h1>
      <p className="text-sm text-text-secondary mt-2">Browser-native rack. No fake plugin store. Add inserts on a track in the studio.</p>
      <div className="grid md:grid-cols-2 gap-2 mt-4">
        {PROCESSORS.map((p) => (
          <div key={p.name} className="sl-card">
            <div className="flex justify-between">
              <strong>{p.name}</strong>
              <span className="text-[10px] tracking-widest" style={{ color: p.status === 'WORKING' ? '#39FF14' : p.status === 'BLOCKED' ? '#ff3b5c' : '#F2B632' }}>{p.status}</span>
            </div>
            <p className="text-xs text-text-muted mt-1">{p.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
