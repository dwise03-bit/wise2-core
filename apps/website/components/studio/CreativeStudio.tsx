'use client';

import { useState, useEffect } from 'react';
import CommandCenter from './pages/CommandCenter';
import SoundLab from './pages/SoundLab';
import LiveStudio from './pages/LiveStudio';
import JingleLab from './pages/JingleLab';
import LyricsLab from './pages/LyricsLab';
import VoiceLab from './pages/VoiceLab';
import ContentFactory from './pages/ContentFactory';
import ClientShowcase from './pages/ClientShowcase';

export default function CreativeStudio() {
  const [page, setPage] = useState('command');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [credits, setCredits] = useState(7214);

  const pages = [
    { id: 'command', label: 'Command Center', glyph: 'CC' },
    { id: 'sound', label: 'Sound Lab', glyph: 'SL' },
    { id: 'live', label: 'Live Studio', glyph: 'LV' },
    { id: 'jingle', label: 'Jingle Lab', glyph: 'JL' },
    { id: 'lyrics', label: 'Lyrics Lab', glyph: 'LL' },
    { id: 'voice', label: 'Voice Lab', glyph: 'VL' },
    { id: 'factory', label: 'Content Factory', glyph: 'CF' },
    { id: 'showcase', label: 'Client Showcase', glyph: 'SH' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentPageLabel = pages.find(p => p.id === page)?.label || 'Command Center';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minWidth: '1280px', background: '#050505', overflow: 'hidden', fontSize: '15px', fontFamily: '"Rajdhani", sans-serif', color: '#e6e6e6' }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #050505; }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes w2pulse { 0%, 100% { box-shadow: 0 0 6px rgba(57,255,20,.35); } 50% { box-shadow: 0 0 18px rgba(57,255,20,.7); } }
        @keyframes w2blink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes w2rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '56px', padding: '0 20px', background: 'linear-gradient(180deg,#111,#0a0a0a)', borderBottom: '1px solid #262626' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 900, fontSize: '22px', letterSpacing: '1px', background: 'linear-gradient(180deg,#fff 20%,#777 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WISE</span>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 900, fontSize: '13px', color: '#39FF14', textShadow: '0 0 8px rgba(57,255,20,.6)' }}>2</span>
        </div>
        <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#666', textTransform: 'uppercase', borderLeft: '1px solid #2a2a2a', paddingLeft: '14px' }}>Creative Studio</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#777' }}>
          <span>Workspace</span>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ color: '#aaa', fontWeight: 600 }}>{currentPageLabel}</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <button onClick={() => setPaletteOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '320px', background: '#0d0d0d', border: '1px solid #2c2c2c', borderRadius: '6px', padding: '7px 12px', color: '#666', cursor: 'pointer', fontFamily: '"Rajdhani", sans-serif', fontSize: '13px' }}>
          <span>⌕</span>
          <span style={{ flex: 1 }}>Search or run a command…</span>
          <span style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '1px 6px', color: '#888' }}>⌘K</span>
        </button>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* SIDEBAR */}
        <div style={{ width: '216px', flex: 'none', background: '#0a0a0a', borderRight: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', padding: '14px 10px', gap: '3px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '2.5px', color: '#555', textTransform: 'uppercase', padding: '0 10px 8px' }}>Studio Modules</div>
          {pages.map((p) => {
            const iconMap: Record<string, string> = {
              'command': '#icon-command',
              'sound': '#icon-sound',
              'live': '#icon-live',
              'jingle': '#icon-jingle',
              'lyrics': '#icon-lyrics',
              'voice': '#icon-voice',
              'factory': '#icon-factory',
              'showcase': '#icon-showcase',
            };
            return (
              <button key={p.id} onClick={() => setPage(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px', borderRadius: '7px', border: page === p.id ? '1px solid rgba(57,255,20,.4)' : '1px solid transparent', background: page === p.id ? 'rgba(57,255,20,.1)' : 'transparent', color: page === p.id ? '#fff' : '#909090', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <svg width="18" height="18" viewBox="0 0 64 64" style={{ opacity: page === p.id ? 1 : 0.5 }}>
                  <use href={`/icons.svg${iconMap[p.id]}`} />
                </svg>
                {p.label}
              </button>
            );
          })}
          <div style={{ flex: 1 }}></div>
          <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: '9px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', letterSpacing: '1.5px', color: '#666', textTransform: 'uppercase' }}>
              <span>AI Credits</span>
              <span style={{ color: '#ccc' }}>{credits.toLocaleString()}</span>
            </div>
            <button style={{ background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.35)', color: '#39FF14', borderRadius: '7px', padding: '7px', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}>
              + Top Up Credits
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: '#060606', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 900, fontSize: '30px', letterSpacing: '1px', background: 'linear-gradient(180deg,#fff 25%,#6f6f6f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>
              {currentPageLabel}
            </div>
            <div style={{ color: '#777', fontWeight: 600, letterSpacing: '1px' }}>
              {page === 'command' && 'Welcome back, Darrin. 3 renders finished overnight.'}
              {page === 'sound' && 'CREATE. PRODUCE. MASTER.'}
              {page === 'live' && 'BROADCAST. ENGAGE. DOMINATE.'}
              {page === 'jingle' && 'CREATE. BRAND. IMPACT.'}
              {page === 'lyrics' && 'WRITE. GENERATE. INSPIRE.'}
              {page === 'voice' && 'GENERATE. CLONE. DOMINATE.'}
              {page === 'factory' && 'ONE PROMPT. EVERY CHANNEL.'}
              {page === 'showcase' && 'COMPLETED PROJECTS. REAL RESULTS.'}
            </div>
          </div>

          <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', padding: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {page === 'command' && <CommandCenter />}
            {page === 'sound' && <SoundLab />}
            {page === 'live' && <LiveStudio />}
            {page === 'jingle' && <JingleLab />}
            {page === 'lyrics' && <LyricsLab />}
            {page === 'voice' && <VoiceLab />}
            {page === 'factory' && <ContentFactory />}
            {page === 'showcase' && <ClientShowcase />}
          </div>
        </div>
      </div>

      {/* COMMAND PALETTE */}
      {paletteOpen && (
        <div onClick={() => setPaletteOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '560px', height: 'fit-content', background: '#0e0e0e', border: '1px solid rgba(57,255,20,.35)', borderRadius: '12px', boxShadow: '0 0 60px rgba(57,255,20,.15)', overflow: 'hidden', animation: 'w2rise .15s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid #222' }}>
              <span style={{ color: '#39FF14' }}>⌕</span>
              <input placeholder="Type a command..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#eee', fontFamily: '"Rajdhani", sans-serif', fontSize: '16px', fontWeight: 600 }} />
              <span style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '1px 6px', color: '#777' }}>ESC</span>
            </div>
            <div style={{ maxHeight: '330px', overflowY: 'auto', padding: '7px' }}>
              {pages.map((p, i) => (
                <button key={i} onClick={() => { setPage(p.id); setPaletteOpen(false); }} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: '"Rajdhani", sans-serif', textAlign: 'left' }}>
                  <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '9px', color: '#39FF14', border: '1px solid rgba(57,255,20,.3)', borderRadius: '4px', padding: '3px 6px', minWidth: '44px', textAlign: 'center' }}>GO TO</span>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#ddd' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
