'use client';

import React from 'react';
import { useCreativeStudioStore } from '@/lib/creativeStudioStore';
import { WaveformEditor, MeterLED, SpectrumBars, HorizontalMeter, SmoothWave } from './CanvasPrimitives';

// Command Center
export function CommandCenterPage() {
  const { credits } = useCreativeStudioStore();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-black">Command Center</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Assets Produced', value: '312', delta: '+24%', sub: 'this month · all modules' },
          { label: 'AI Generations', value: '1,486', delta: '+38%', sub: `${credits} credits remaining` },
          { label: 'Stream Watch Time', value: '412h', delta: '+18%', sub: 'across 6 platforms' },
          { label: 'Revenue Attributed', value: '$18.9K', delta: '+31%', sub: 'from studio content' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-studio-input border border-studio-line rounded p-4">
            <div className="text-xs text-gray-500 uppercase mb-2">{kpi.label}</div>
            <div className="text-3xl font-black text-white mb-1">{kpi.value}</div>
            <div className="text-xs text-wise-accent mb-2">{kpi.delta}</div>
            <div className="text-xs text-gray-600">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Activity Feed</h2>
        <div className="space-y-2 text-xs">
          {[
            { tag: 'MASTER', t: 'AI mastered "Midnight Anthem"', when: '2m' },
            { tag: 'CLIP', t: '6 highlights detected in Friday broadcast', when: '18m' },
            { tag: 'VOICE', t: '"Coach K" clone finished training', when: '54m' },
          ].map((item) => (
            <div key={item.when} className="flex gap-2 border-b border-studio-line pb-2 last:border-0">
              <span className="text-wise-accent font-semibold min-w-12">{item.tag}</span>
              <span className="text-gray-300 flex-1">{item.t}</span>
              <span className="text-gray-600">{item.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sound Lab
export function SoundLabPage() {
  const { tracks, fx, toggleTrackMute, setFXAmount } = useCreativeStudioStore();
  const editorRef = React.useRef<HTMLCanvasElement>(null);
  const meterRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Sound Lab</h1>

      <div className="flex gap-4">
        {/* Waveform Editor */}
        <div className="flex-1 bg-studio-input border border-studio-line rounded p-4">
          <div className="text-xs text-gray-500 mb-2">Waveform Editor</div>
          <WaveformEditor ref={editorRef} width={600} height={120} className="w-full" />
        </div>

        {/* Master Meter */}
        <div className="bg-studio-input border border-studio-line rounded p-4">
          <div className="text-xs text-gray-500 mb-2">Master</div>
          <MeterLED ref={meterRef} width={60} height={120} level={0.62} />
        </div>
      </div>

      {/* Tracks Mixer */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">7-Track Mixer</h2>
        <div className="space-y-2">
          {tracks.map((track, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-studio-raised rounded">
              <div className="min-w-20">
                <div className="text-xs font-semibold text-white">{track.name}</div>
                <div className="text-xs text-gray-600">{Math.round(track.vol * 100)}%</div>
              </div>
              <div className="flex-1 h-8 bg-studio-input rounded" />
              <button
                onClick={() => toggleTrackMute(i)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  track.mute ? 'bg-red-500/30 text-red-400' : 'bg-studio-line text-gray-400'
                }`}
              >
                {track.mute ? 'MUTE' : 'VOL'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FX Chain */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">FX Chain (4 Units)</h2>
        <div className="grid grid-cols-4 gap-2">
          {fx.map((effect, i) => (
            <div key={i} className="bg-studio-raised p-2 rounded text-xs">
              <div className="font-semibold text-white truncate">{effect.name}</div>
              <input
                type="range"
                min="0"
                max="100"
                value={effect.amt}
                onChange={(e) => setFXAmount(i, Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="text-gray-600 text-[10px] mt-1">{effect.amt}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Live Studio
export function LiveStudioPage() {
  const { isLive, viewers, chat, chatDraft, setChatDraft, sendChat } = useCreativeStudioStore();
  const vizRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-black">Live Studio</h1>
        <div className={`px-3 py-1 rounded text-sm font-semibold ${isLive ? 'bg-red-500/30 text-red-400' : 'bg-green-500/30 text-green-400'}`}>
          {isLive ? '🔴 LIVE' : 'OFFLINE'}
        </div>
      </div>

      {/* Live Visualization */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <div className="text-xs text-gray-500 mb-2">Live Feed ({viewers?.toLocaleString?.() || '1,742'} viewers)</div>
        <SpectrumBars ref={vizRef} width={800} height={100} bars={26} className="w-full" />
      </div>

      {/* Sources & Outputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-studio-input border border-studio-line rounded p-4">
          <h2 className="text-sm font-semibold text-white mb-2">Sources (6)</h2>
          <div className="text-xs text-gray-500 space-y-1">
            <div>✓ Camera A — FX6 (SDI)</div>
            <div>✓ Camera B — Wide (SDI)</div>
            <div>✓ Screen — Sound Lab (CAPTURE)</div>
          </div>
        </div>

        <div className="bg-studio-input border border-studio-line rounded p-4">
          <h2 className="text-sm font-semibold text-white mb-2">Outputs (5)</h2>
          <div className="text-xs text-gray-500 space-y-1">
            <div>✓ YouTube (842 watching)</div>
            <div>✓ Twitch (511 watching)</div>
            <div>✓ TikTok Live (389 watching)</div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-2">Live Chat</h2>
        <div className="space-y-1 mb-3 max-h-32 overflow-y-auto text-xs">
          {chat.slice(-4).map((msg, i) => (
            <div key={i} style={{ color: msg.color }}>
              <span className="font-semibold">{msg.user}:</span> {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Say something..."
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
          />
          <button onClick={sendChat} className="px-3 py-1 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Jingle Lab
export function JingleLabPage() {
  const { genActive, genPct, jingles } = useCreativeStudioStore();
  const jingleRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Jingle Lab</h1>

      {genActive && (
        <div className="bg-studio-input border border-studio-line rounded p-4">
          <div className="text-sm font-semibold text-white mb-2">Generating...</div>
          <div className="w-full h-2 bg-studio-raised rounded overflow-hidden">
            <div className="h-full bg-wise-accent transition-all" style={{ width: `${genPct}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">{genPct}% — {['Writing hook...', 'Composing melody...', 'Rendering vocals...', 'Mastering...'][Math.floor(genPct / 25)] || 'Done'}</div>
        </div>
      )}

      <div className="bg-studio-input border border-studio-line rounded p-4">
        <div className="text-xs text-gray-500 mb-2">Preview Waveform</div>
        <SmoothWave ref={jingleRef} width={600} height={80} className="w-full" />
      </div>

      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Jingle History ({jingles.length})</h2>
        <div className="space-y-2 text-xs">
          {jingles.slice(0, 3).map((jingle, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-studio-raised rounded">
              <div>
                <div className="text-white font-semibold">{jingle.name}</div>
                <div className="text-gray-600">{jingle.meta}</div>
              </div>
              <div className="text-gray-500">{jingle.len}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Voice Lab
export function VoiceLabPage() {
  const { voiceSel, vParams, setVoiceParam } = useCreativeStudioStore();
  const voiceRef = React.useRef<HTMLCanvasElement>(null);

  const voices = ['Wise Deep', 'Street CEO', 'Midnight FM', 'Coach K', 'Casa Verde ES'];

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Voice Lab</h1>

      {/* Voice Selector */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Brand Voices (5)</h2>
        <div className="grid grid-cols-5 gap-2">
          {voices.map((v, i) => (
            <div
              key={i}
              className={`p-2 rounded text-center text-xs font-semibold cursor-pointer transition-colors ${
                voiceSel === i ? 'bg-wise-accent/30 border border-wise-accent text-white' : 'bg-studio-raised border border-studio-line text-gray-400'
              }`}
            >
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Voice Waveform */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <div className="text-xs text-gray-500 mb-2">Voice Preview</div>
        <SmoothWave ref={voiceRef} width={600} height={80} className="w-full" />
      </div>

      {/* Voice Parameters */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Tuning Parameters</h2>
        <div className="space-y-3">
          {Object.entries(vParams).map(([name, val]) => (
            <div key={name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{name}</span>
                <span className="text-wise-accent font-semibold">{val}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => setVoiceParam(name, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Content Factory
export function ContentFactoryPage() {
  const { factorySel, factoryPrompt, factoryItems, setFactoryPrompt, submitFactoryJob } = useCreativeStudioStore();

  const types = ['Images', 'Videos', 'Shorts', 'Ads', 'Voiceovers', 'Emails', 'Blogs', 'Landing Pages'];

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Content Factory</h1>

      {/* Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map((type, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              factorySel === i ? 'bg-wise-accent text-black' : 'bg-studio-input border border-studio-line text-gray-400'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <textarea
          placeholder="Describe what you want to create..."
          value={factoryPrompt}
          onChange={(e) => setFactoryPrompt(e.target.value)}
          className="w-full h-20 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none resize-none"
        />
        <button
          onClick={submitFactoryJob}
          className="mt-2 w-full px-3 py-2 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition"
        >
          ⚡ Generate
        </button>
      </div>

      {/* Render Queue */}
      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Render Queue ({factoryItems.length})</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {factoryItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-studio-raised rounded border border-studio-line">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                <div className="text-xs text-gray-600">{item.meta}</div>
              </div>
              <div
                className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                  item.status === 'RENDERING'
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : item.status === 'LIVE'
                      ? 'bg-red-500/30 text-red-400'
                      : 'bg-green-500/30 text-green-400'
                }`}
              >
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Client Showcase
export function ClientShowcasePage() {
  const { gFilter, setGalleryFilter } = useCreativeStudioStore();

  const gallery = [
    { title: 'Train Smart Campaign', client: 'Wise Defense', cat: 'BRAND', f: 'Brand', img: '/showcase/daniel.png', metric: '+188%', metricLabel: 'signups after launch' },
    { title: 'Lowrider Sessions', client: 'Eastside Kustoms', cat: 'VIDEO', f: 'Video', img: '/showcase/darrin.png', metric: '2.4M', metricLabel: 'views in 30 days' },
    { title: 'Ironclad Anthem', client: 'Ironclad Fitness Co.', cat: 'AUDIO', f: 'Audio', img: '/showcase/concept-01.png', metric: '4.2×', metricLabel: 'ad recall vs. old spot' },
    { title: 'Beat Cookup Series', client: 'WISE² Originals', cat: 'LIVE', f: 'Live', img: '/showcase/concept-02.png', metric: '412h', metricLabel: 'watch time' },
    { title: 'Casa Verde Summer Spot', client: 'Casa Verde Cantina', cat: 'AUDIO', f: 'Audio', img: '/showcase/concept-03.png', metric: '+61%', metricLabel: 'weekend foot traffic' },
    { title: 'Northside Rebrand', client: 'Northside HVAC', cat: 'BRAND', f: 'Brand', img: '/showcase/daniel.png', metric: '9 assets', metricLabel: 'shipped in one week' },
  ];

  const filters = ['All', 'Audio', 'Video', 'Live', 'Brand'];

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Client Showcase</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setGalleryFilter(f as any)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              gFilter === f ? 'bg-wise-accent text-black' : 'bg-studio-input border border-studio-line text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-3 gap-4">
        {gallery
          .filter((g) => gFilter === 'All' || g.f === gFilter)
          .map((item, i) => (
            <div key={i} className="bg-studio-input border border-studio-line rounded overflow-hidden hover:border-wise-accent/50 transition cursor-pointer">
              <div className="relative h-40 bg-studio-raised overflow-hidden">
                {item.img && (
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <div className="text-xs font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.client}</div>
                </div>
                <div className="pt-2 border-t border-studio-line">
                  <div className="text-sm font-black text-wise-accent">{item.metric}</div>
                  <div className="text-xs text-gray-600">{item.metricLabel}</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
