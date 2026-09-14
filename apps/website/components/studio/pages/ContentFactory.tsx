'use client';

import { useState } from 'react';

interface GenerationJob {
  id: string;
  type: string;
  prompt: string;
  status: 'pending' | 'generating' | 'complete';
  progress: number;
  createdAt: Date;
}

export default function ContentFactory() {
  const [contentType, setContentType] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([
    { id: '1', type: 'image', prompt: 'Professional product photo on white background', status: 'complete', progress: 100, createdAt: new Date(Date.now() - 3600000) },
    { id: '2', type: 'video', prompt: 'Product unboxing sequence', status: 'complete', progress: 100, createdAt: new Date(Date.now() - 7200000) },
    { id: '3', type: 'ad', prompt: 'Social media ad copy for e-commerce', status: 'complete', progress: 100, createdAt: new Date(Date.now() - 10800000) },
  ]);

  const types = [
    { id: 'image', label: 'Image', icon: '🖼️', desc: 'Product photos, graphics, logos' },
    { id: 'video', label: 'Video', icon: '🎬', desc: 'Ads, tutorials, testimonials' },
    { id: 'ad', label: 'Ad Copy', icon: '📢', desc: 'Social media, email, web copy' },
    { id: 'blog', label: 'Blog Post', icon: '📝', desc: 'SEO articles, guides, stories' },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const newJob: GenerationJob = {
      id: Date.now().toString(),
      type: contentType,
      prompt,
      status: 'generating',
      progress: 0,
      createdAt: new Date(),
    };

    setJobs([newJob, ...jobs]);

    // Simulate generation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        setJobs(j => j.map(x => x.id === newJob.id ? { ...x, status: 'complete', progress: 100 } : x));
        setIsGenerating(false);
        clearInterval(interval);
      } else {
        setJobs(j => j.map(x => x.id === newJob.id ? { ...x, progress: Math.min(progress, 99) } : x));
      }
    }, 500);

    setPrompt('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', height: '100%' }}>
      {/* GENERATOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* TYPE SELECTOR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setContentType(t.id)}
              style={{
                padding: '12px', borderRadius: '6px',
                border: contentType === t.id ? '1px solid #39FF14' : '1px solid #222',
                background: contentType === t.id ? 'rgba(57,255,20,.1)' : '#0a0a0a',
                color: contentType === t.id ? '#39FF14' : '#aaa', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
              }}
            >
              <div style={{ fontSize: '20px' }}>{t.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{t.label}</div>
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* PROMPT INPUT */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={contentType === 'image' ? 'Describe the image you want to generate...' : contentType === 'video' ? 'Describe the video concept...' : contentType === 'ad' ? 'Write your marketing message...' : 'Outline your blog post topic...'}
            style={{
              width: '100%', height: '120px', padding: '12px', borderRadius: '6px',
              background: '#0a0a0a', border: '1px solid #222', color: '#eee',
              fontFamily: '"Rajdhani", sans-serif', fontSize: '13px', resize: 'none'
            }}
          />
        </div>

        {/* OPTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Style/Tone</label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#0a0a0a', border: '1px solid #222', color: '#aaa', fontFamily: '"Rajdhani", sans-serif' }}>
              <option>Professional</option>
              <option>Creative</option>
              <option>Casual</option>
              <option>Technical</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Quality</label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#0a0a0a', border: '1px solid #222', color: '#aaa', fontFamily: '"Rajdhani", sans-serif' }}>
              <option>Standard</option>
              <option>Premium</option>
              <option>Ultra</option>
            </select>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          style={{
            padding: '12px', borderRadius: '6px', border: '1px solid #39FF14',
            background: isGenerating ? 'rgba(57,255,20,.1)' : 'transparent', color: '#39FF14',
            cursor: isGenerating || !prompt.trim() ? 'default' : 'pointer',
            fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, textTransform: 'uppercase',
            opacity: isGenerating || !prompt.trim() ? 0.6 : 1
          }}
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate Content'}
        </button>
      </div>

      {/* QUEUE */}
      <div style={{ background: '#0d0d0d', padding: '12px', borderRadius: '6px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#39FF14', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Generation Queue ({jobs.length})</div>
        {jobs.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', paddingTop: '20px' }}>No generations yet</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} style={{ background: '#0a0a0a', padding: '8px', borderRadius: '4px', border: '1px solid #222', fontSize: '10px' }}>
              <div style={{ color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                {types.find(t => t.id === job.type)?.icon} {job.type}
              </div>
              <div style={{ color: '#666', fontSize: '9px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.prompt.substring(0, 40)}...
              </div>
              <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '1px', overflow: 'hidden', marginBottom: '2px' }}>
                <div style={{ width: `${job.progress}%`, height: '100%', background: '#39FF14', transition: 'width 0.2s' }} />
              </div>
              <div style={{ color: '#555', fontSize: '8px' }}>
                {job.status === 'complete' ? '✅ Complete' : `${job.progress}%`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
