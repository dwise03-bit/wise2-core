'use client';

import { useState } from 'react';

export default function LyricsLab() {
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('upbeat');
  const [theme, setTheme] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateLyrics = async () => {
    if (!theme.trim()) {
      setError('Enter a theme or topic');
      return;
    }

    setLoading(true);
    setError('');
    setLyrics('');

    try {
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, mood, theme }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      const data = await response.json();
      setLyrics(data.lyrics);
    } catch (err) {
      setError('Error generating lyrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#39FF14', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            Genre
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '8px',
              color: '#fff',
              fontFamily: '"Rajdhani", sans-serif',
            }}
          >
            <option>pop</option>
            <option>hip-hop</option>
            <option>rock</option>
            <option>country</option>
            <option>r&b</option>
            <option>indie</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#39FF14', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            Mood
          </label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '8px',
              color: '#fff',
              fontFamily: '"Rajdhani", sans-serif',
            }}
          >
            <option>upbeat</option>
            <option>melancholic</option>
            <option>energetic</option>
            <option>romantic</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#39FF14', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            Theme
          </label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., lost love, summer nights..."
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '8px',
              color: '#fff',
              fontFamily: '"Rajdhani", sans-serif',
              resize: 'none',
              minHeight: '80px',
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '8px', background: 'rgba(255, 92, 92, 0.2)', border: '1px solid #ff5c5c', borderRadius: '6px', color: '#ff9999', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <button
          onClick={generateLyrics}
          disabled={loading}
          style={{
            background: loading ? 'rgba(57,255,20,0.3)' : 'linear-gradient(135deg, rgba(57,255,20,.8), rgba(0,217,255,.6))',
            border: 'none',
            borderRadius: '6px',
            padding: '10px',
            color: '#050505',
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '✨ Generating...' : '✨ Generate Lyrics'}
        </button>
      </div>

      {/* Output */}
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {lyrics ? (
          <>
            <pre
              style={{
                color: '#ddd',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '12px',
                margin: 0,
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {lyrics}
            </pre>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lyrics);
                  alert('Copied!');
                }}
                style={{
                  flex: 1,
                  background: '#333',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#ddd',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: '"Rajdhani", sans-serif',
                }}
              >
                📋 Copy
              </button>
              <button
                onClick={() => setLyrics('')}
                style={{
                  flex: 1,
                  background: '#333',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#ddd',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: '"Rajdhani", sans-serif',
                }}
              >
                🔄 Clear
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#666' }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
              <div>Enter theme & generate lyrics</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
