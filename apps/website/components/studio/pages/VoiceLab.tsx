'use client';

import { useState } from 'react';

interface Voice {
  id: string;
  name: string;
  gender: string;
  accent: string;
  speed: number;
}

export default function VoiceLab() {
  const [tab, setTab] = useState('generate');
  const [text, setText] = useState('Welcome to WISE² Voice Lab. Generate, clone, and master your brand voice.');
  const [selectedVoice, setSelectedVoice] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoices, setGeneratedVoices] = useState<Voice[]>([
    { id: '1', name: 'Alex', gender: 'Male', accent: 'American', speed: 1 },
    { id: '2', name: 'Nova', gender: 'Female', accent: 'British', speed: 1 },
    { id: '3', name: 'River', gender: 'Neutral', accent: 'Australian', speed: 1 },
    { id: '4', name: 'Jordan', gender: 'Male', accent: 'Southern', speed: 1 },
    { id: '5', name: 'Echo', gender: 'Female', accent: 'Neutral', speed: 1 },
  ]);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [brandVoices, setBrandVoices] = useState([
    { name: 'WISE² Official', samples: 5, quality: '99%' },
    { name: 'CEO Tone', samples: 3, quality: '95%' },
    { name: 'Support Agent', samples: 2, quality: '92%' },
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('✅ Audio generated! Playing preview...');
    }, 2000);
  };

  const handleStartClone = () => {
    setCloneProgress(0);
    const interval = setInterval(() => {
      setCloneProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          alert('✅ Voice cloning complete!');
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', color: '#e6e6e6' }}>
      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
        {['generate', 'clone', 'library'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', borderRadius: '4px', border: 'none',
              background: tab === t ? 'rgba(57,255,20,.1)' : 'transparent',
              color: tab === t ? '#39FF14' : '#888',
              cursor: 'pointer', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700,
              textTransform: 'capitalize'
            }}
          >
            {t === 'generate' && '🎙️ Generate'} {t === 'clone' && '🧬 Clone'} {t === 'library' && '📚 Library'}
          </button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {tab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', flex: 1 }}>
          {/* INPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  width: '100%', height: '100px', padding: '12px', borderRadius: '6px',
                  background: '#0a0a0a', border: '1px solid #222', color: '#eee',
                  fontFamily: '"Rajdhani", sans-serif', fontSize: '13px', resize: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Voice Speed</label>
              <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" style={{ width: '100%', cursor: 'pointer' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Normal (1.0x)</div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                padding: '12px', borderRadius: '6px', border: '1px solid #39FF14', background: isGenerating ? 'rgba(57,255,20,.1)' : 'transparent',
                color: '#39FF14', cursor: 'pointer', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {isGenerating ? '⏳ Generating...' : '▶ Generate Audio'}
            </button>
          </div>

          {/* VOICE SELECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0d0d0d', padding: '12px', borderRadius: '6px', border: '1px solid #222', overflow: 'auto' }}>
            <div style={{ fontSize: '11px', color: '#39FF14', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Available Voices</div>
            {generatedVoices.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                style={{
                  textAlign: 'left', padding: '10px', borderRadius: '4px', border: selectedVoice === v.id ? '1px solid #39FF14' : '1px solid #222',
                  background: selectedVoice === v.id ? 'rgba(57,255,20,.1)' : '#0a0a0a',
                  cursor: 'pointer', color: '#aaa', fontSize: '12px', fontFamily: '"Rajdhani", sans-serif'
                }}
              >
                <div style={{ fontWeight: 700, color: '#fff' }}>{v.name}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{v.gender} • {v.accent}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CLONE TAB */}
      {tab === 'clone' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0d0d0d', padding: '16px', borderRadius: '6px', border: '1px solid #222' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Upload Voice Sample (WAV, MP3)</label>
              <div style={{
                width: '100%', height: '80px', borderRadius: '6px', border: '2px dashed #39FF14',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: 'rgba(57,255,20,.05)'
              }}>
                <div style={{ textAlign: 'center', color: '#39FF14' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
                  <div style={{ fontSize: '12px' }}>Drop file or click to upload</div>
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Voice Name</label>
              <input
                type="text" placeholder="e.g., My Brand Voice"
                style={{
                  width: '100%', padding: '10px', borderRadius: '4px', background: '#0a0a0a',
                  border: '1px solid #222', color: '#eee', fontFamily: '"Rajdhani", sans-serif', fontSize: '13px'
                }}
              />
            </div>
            {cloneProgress > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#39FF14', marginBottom: '6px' }}>Cloning Progress</div>
                <div style={{ width: '100%', height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${cloneProgress}%`, height: '100%', background: '#39FF14', transition: 'width 0.2s' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{cloneProgress}% Complete</div>
              </div>
            )}
            <button
              onClick={handleStartClone}
              disabled={cloneProgress > 0}
              style={{
                marginTop: '12px', padding: '10px', width: '100%', borderRadius: '4px',
                border: '1px solid #39FF14', background: 'transparent', color: '#39FF14',
                cursor: 'pointer', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, textTransform: 'uppercase'
              }}
            >
              {cloneProgress > 0 ? '⏳ Processing...' : '🧬 Start Cloning'}
            </button>
          </div>
        </div>
      )}

      {/* LIBRARY TAB */}
      {tab === 'library' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {brandVoices.map((v, i) => (
            <div key={i} style={{ background: '#0d0d0d', padding: '14px', borderRadius: '6px', border: '1px solid #222' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{v.name}</div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                <div>{v.samples} samples • Quality: {v.quality}</div>
              </div>
              <button style={{
                width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(57,255,20,.1)',
                border: '1px solid #39FF14', color: '#39FF14', cursor: 'pointer',
                fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase'
              }}>
                ▶ Use This Voice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
