'use client';

import React from 'react';
import { useCreativeStudioStore } from '@/lib/creativeStudioStore';
import { WaveformEditor, MeterLED, SpectrumBars, HorizontalMeter, SmoothWave } from './CanvasPrimitives';
import { SoundLabEnhanced } from './SoundLab/SoundLabEnhanced';
import { useState } from 'react';

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
  const [status, setStatus] = useState('Ready');

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <div className="h-8 flex items-center px-6 bg-studio-raised border-b border-studio-line text-xs text-gray-500">
        <span>{status}</span>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-hidden">
        <SoundLabEnhanced onStatusUpdate={setStatus} />
      </div>
    </div>
  );
}

// Live Studio
export function LiveStudioPage() {
  const { isLive, viewers, chat, chatDraft, setChatDraft, sendChat } = useCreativeStudioStore();
  const vizRef = React.useRef<HTMLCanvasElement>(null);
  const [chatTab, setChatTab] = React.useState<'platform' | 'discord'>('platform');

  const discordMessages = [
    { user: 'StreamViewer#1234', color: '#7289DA', text: '🔥 This is fire!' },
    { user: 'Creator_Fan#5678', color: '#43B581', text: 'Just subscribed on Twitch!' },
    { user: 'Moderator#9999', color: '#FAA61A', text: 'Welcome to everyone joining from Discord!' },
    { user: 'Community#2024', color: '#7289DA', text: 'When is the next stream?' },
  ];

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

      {/* Chat Tabs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Platform Chat */}
        <div className="bg-studio-input border border-studio-line rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-white">Live Chat</h2>
            <button
              onClick={() => setChatTab('platform')}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                chatTab === 'platform'
                  ? 'bg-wise-accent text-black font-semibold'
                  : 'bg-studio-line text-gray-400'
              }`}
            >
              Platform
            </button>
          </div>
          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto text-xs">
            {chat.slice(-5).map((msg, i) => (
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

        {/* Discord Chat */}
        <div className="bg-studio-input border border-studio-line rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-white">Discord</h2>
            <button
              onClick={() => setChatTab('discord')}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                chatTab === 'discord'
                  ? 'bg-wise-accent text-black font-semibold'
                  : 'bg-studio-line text-gray-400'
              }`}
            >
              #general
            </button>
            <span className="text-xs text-wise-accent ml-auto">● 342 online</span>
          </div>
          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto text-xs bg-studio-raised rounded p-2">
            {discordMessages.map((msg, i) => (
              <div key={i} className="py-1 border-b border-studio-line/30 last:border-0">
                <span style={{ color: msg.color }} className="font-semibold">{msg.user}</span>
                <div className="text-gray-300">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send message to Discord..."
              className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none"
            />
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition">
              Send
            </button>
          </div>
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
  // Use exact same structure as CommandCenterPage to debug rendering issue
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-black">Content Factory</h1>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Images Created', value: '42', delta: '+12%', sub: 'this month' },
          { label: 'Videos Generated', value: '128', delta: '+31%', sub: 'this month' },
          { label: 'Audio Assets', value: '347', delta: '+8%', sub: 'total library' },
          { label: 'Content Queue', value: '12', delta: '+3', sub: 'pending render' },
        ].map((stat) => (
          <div key={stat.label} className="bg-studio-input border border-studio-line rounded p-4">
            <div className="text-xs text-gray-500 uppercase mb-2">{stat.label}</div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-xs text-wise-accent mb-2">{stat.delta}</div>
            <div className="text-xs text-gray-600">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-studio-input border border-studio-line rounded p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Recent Generations</h2>
        <div className="space-y-2 text-xs">
          {[
            { tag: 'IMAGE', t: '4K Product photo — Train Smart Campaign', when: '12m' },
            { tag: 'VIDEO', t: '30-sec Instagram Reel — Lowrider Sessions', when: '35m' },
            { tag: 'AUDIO', t: 'Voice clone training — Coach K voice', when: '1h' },
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

// Music Generation
export function MusicGenerationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-display font-black">Music Generation</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Prompt Builder */}
        <div className="bg-studio-input border border-studio-line rounded p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Generate Music</h2>
          <textarea
            placeholder="Describe the music you want to create..."
            className="w-full h-20 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <select className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white focus:outline-none">
              <option>Genre: Electronic</option>
              <option>Pop</option>
              <option>Hip-Hop</option>
              <option>Classical</option>
            </select>
            <select className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white focus:outline-none">
              <option>Mood: Happy</option>
              <option>Sad</option>
              <option>Energetic</option>
              <option>Calm</option>
            </select>
          </div>
          <button className="w-full px-3 py-2 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition">
            ⚡ Generate
          </button>
        </div>

        {/* Library */}
        <div className="bg-studio-input border border-studio-line rounded p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">My Generations (0)</h2>
          <div className="h-32 bg-studio-raised rounded border border-studio-line flex items-center justify-center text-xs text-gray-600">
            No generations yet. Create your first track to get started!
          </div>
        </div>
      </div>

      {/* Voice Cloning */}
      <div className="bg-studio-input border border-studio-line rounded p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">Voice Cloning</h2>
        <p className="text-xs text-gray-400">Record or upload a voice sample (5-30s) to create a unique singing voice.</p>
        <button className="px-3 py-2 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition">
          🎤 Record Voice Sample
        </button>
      </div>
    </div>
  );
}
