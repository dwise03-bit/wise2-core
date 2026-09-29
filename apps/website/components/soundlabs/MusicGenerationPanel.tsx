'use client';

import { useState } from 'react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';

interface MusicGenerationPanelProps {
  client: { name: string; email: string };
}

export function MusicGenerationPanel({ client }: MusicGenerationPanelProps) {
  const { generateMusic, generations, isLoading } = useSoundLabsProduction();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState('electronic');

  const handleGenerate = async () => {
    if (prompt.trim()) {
      await generateMusic(prompt, duration, genre);
      setPrompt('');
    }
  };

  const genres = ['electronic', 'ambient', 'hip-hop', 'jazz', 'classical', 'pop', 'rock', 'experimental'];

  return (
    <div className="space-y-6">
      {/* Generation Panel */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-6">AI Music Generation</h3>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-[#00D9FF] mb-2">Describe Your Track</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'upbeat electronic dance track with warm synths and heavy bassline'"
              className="w-full px-4 py-3 rounded-lg bg-[#050607] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/30 transition-all resize-none h-24"
              disabled={isLoading}
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-[#00D9FF] mb-2">Duration</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1"
                  disabled={isLoading}
                />
                <span className="text-white font-semibold w-12">{duration}s</span>
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-[#00D9FF] mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050607] border border-[#00D9FF]/20 text-white focus:outline-none focus:border-[#00D9FF] transition-all"
                disabled={isLoading}
              >
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-[#050607]">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] text-[#050607] font-semibold hover:shadow-lg hover:shadow-[#00D9FF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Generating...' : '✨ Generate Track'}
          </button>
        </div>
      </div>

      {/* Recent Generations */}
      {generations.length > 0 && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Generations</h4>
          <div className="space-y-3">
            {generations.slice(-5).map((gen) => (
              <div
                key={gen.generation_id}
                className="p-4 rounded-lg bg-[#050607] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{gen.prompt}</p>
                    <p className="text-xs text-[#00D9FF]/60 mt-1">
                      {gen.genre} • {gen.duration}s
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      gen.status === 'complete'
                        ? 'bg-[#00FF7F]/20 text-[#00FF7F]'
                        : gen.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-[#00D9FF]/20 text-[#00D9FF]'
                    }`}
                  >
                    {gen.status.charAt(0).toUpperCase() + gen.status.slice(1)}
                  </span>
                </div>
                <div className="h-1 bg-[#0a0a0c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] transition-all"
                    style={{
                      width: gen.status === 'complete' ? '100%' : gen.status === 'pending' ? '20%' : '50%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
