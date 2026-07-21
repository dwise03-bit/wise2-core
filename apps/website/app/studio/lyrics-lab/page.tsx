'use client';

import { useState } from 'react';
import { useStore } from '@/lib/useStore';
import Link from 'next/link';

export default function LyricsLabPage() {
  const { auth } = useStore();
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
        body: JSON.stringify({ genre, mood, theme, userEmail: auth?.email }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate lyrics');
      }

      const data = await response.json();
      setLyrics(data.lyrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating lyrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d] text-white">
      {/* Header */}
      <div className="p-8 border-b border-[#333]">
        <div className="max-w-7xl mx-auto">
          <Link href="/studio" className="text-[#39FF14] hover:text-white text-sm mb-4 inline-block">
            ← Back to Studio
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] bg-clip-text text-transparent">
            Lyrics Lab
          </h1>
          <p className="text-[#999]">AI-powered lyric generation for your projects</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#39FF14] mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white focus:border-[#39FF14] outline-none"
              >
                <option>pop</option>
                <option>hip-hop</option>
                <option>rock</option>
                <option>country</option>
                <option>r&b</option>
                <option>indie</option>
                <option>electronic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39FF14] mb-2">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white focus:border-[#39FF14] outline-none"
              >
                <option>upbeat</option>
                <option>melancholic</option>
                <option>energetic</option>
                <option>romantic</option>
                <option>aggressive</option>
                <option>chill</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39FF14] mb-2">Theme / Topic</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., lost love, summer nights, city life..."
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white placeholder-[#666] focus:border-[#39FF14] outline-none resize-none"
                rows={4}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={generateLyrics}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black font-bold py-3 rounded hover:shadow-lg hover:shadow-[#39FF14]/50 disabled:opacity-50 transition"
            >
              {loading ? '✨ Generating...' : '✨ Generate Lyrics'}
            </button>

            <Link
              href="/studio/jingle-lab/new"
              className="block w-full bg-[#1a1a1a] border border-[#39FF14]/50 text-[#39FF14] font-bold py-2 rounded hover:bg-[#222] text-center transition"
            >
              → Create Jingle with These Lyrics
            </Link>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 h-full min-h-[500px] flex flex-col">
              <div className="text-sm text-[#999] mb-4">Generated Lyrics</div>
              {lyrics ? (
                <div className="flex-1 overflow-y-auto">
                  <pre className="text-sm text-[#ddd] whitespace-pre-wrap font-mono leading-relaxed">
                    {lyrics}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-[#666]">
                    <div className="text-4xl mb-2">🎵</div>
                    <p>Enter a theme and click Generate</p>
                    <p className="text-xs mt-1">AI will create original lyrics for your song</p>
                  </div>
                </div>
              )}

              {lyrics && (
                <div className="mt-6 pt-6 border-t border-[#333] space-y-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lyrics);
                      alert('Copied to clipboard!');
                    }}
                    className="w-full bg-[#333] hover:bg-[#444] text-white py-2 rounded text-sm transition"
                  >
                    📋 Copy Lyrics
                  </button>
                  <button
                    onClick={() => setLyrics('')}
                    className="w-full bg-[#333] hover:bg-[#444] text-white py-2 rounded text-sm transition"
                  >
                    🔄 Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
