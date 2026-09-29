'use client';

import React, { useState } from 'react';
import { MusicGenerationPromptBuilder } from './PromptBuilder';
import { motion } from 'framer-motion';

/**
 * Example Integration Page for Music Generation Prompt Builder
 * Demonstrates usage, integration points, and result handling
 */

export function MusicGenerationExample() {
  const [lastGenerated, setLastGenerated] = useState<any>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  return (
    <div className="min-h-screen bg-studio-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-wise-text-primary mb-4">
            Music Generation Studio
          </h1>
          <p className="text-wise-text-secondary text-lg">
            Create custom AI-generated music with our advanced prompt builder
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Builder - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MusicGenerationPromptBuilder />
          </div>

          {/* Sidebar - Info and Documentation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Info Card 1 */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                📖 How It Works
              </h3>
              <ol className="text-xs text-wise-text-secondary space-y-2">
                <li>
                  <strong>1. Describe</strong> - Write what music you want
                </li>
                <li>
                  <strong>2. Select</strong> - Choose genre, mood, tempo, etc.
                </li>
                <li>
                  <strong>3. Customize</strong> - Fine-tune instruments and keys
                </li>
                <li>
                  <strong>4. Generate</strong> - Click button and wait for AI
                </li>
                <li>
                  <strong>5. Download</strong> - Save your track to library
                </li>
              </ol>
            </div>

            {/* Info Card 2 */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                ⚙️ Features
              </h3>
              <ul className="text-xs text-wise-text-secondary space-y-1">
                <li>✓ 100+ genres with smart search</li>
                <li>✓ 8 mood presets with samples</li>
                <li>✓ Tap tempo and BPM presets</li>
                <li>✓ 50+ singing voice options</li>
                <li>✓ 9 instrument picker</li>
                <li>✓ Auto-save to browser storage</li>
                <li>✓ Advanced settings (intensity, quality)</li>
              </ul>
            </div>

            {/* Info Card 3 */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                ⏱️ Generation Times
              </h3>
              <div className="space-y-2 text-xs text-wise-text-secondary">
                <div className="flex justify-between">
                  <span>Standard:</span>
                  <span className="text-wise-accent">~45 sec</span>
                </div>
                <div className="flex justify-between">
                  <span>High:</span>
                  <span className="text-wise-accent">~75 sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Ultra:</span>
                  <span className="text-wise-accent">~120 sec</span>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                💡 Pro Tips
              </h3>
              <ul className="text-xs text-wise-text-secondary space-y-2">
                <li>
                  • Be specific in description (e.g., "bright synths" not just "upbeat")
                </li>
                <li>
                  • Select matching instruments for better quality
                </li>
                <li>
                  • Use tap tempo for accurate BPM matching
                </li>
                <li>
                  • Save prompts you like for future use
                </li>
                <li>
                  • Generate variants to compare options
                </li>
              </ul>
            </div>

            {/* API Integration */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                🔗 API Endpoint
              </h3>
              <div className="bg-studio-bg rounded p-2">
                <code className="text-xs text-wise-accent break-all">
                  POST /api/suno/generate
                </code>
              </div>
              <button
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="w-full px-3 py-1 bg-studio-input border border-studio-line rounded text-xs text-wise-text-secondary hover:border-wise-accent transition"
              >
                {showJsonPreview ? 'Hide' : 'Show'} Request Schema
              </button>
              {showJsonPreview && (
                <pre className="bg-studio-bg rounded p-2 text-xs text-wise-accent overflow-x-auto max-h-48">
{`{
  mode: "text-to-song",
  description: string,
  genres: string[],
  mood: string,
  tempo: number,
  instruments: string[],
  duration: number,
  customVoiceId?: string,
  key: string,
  scale: string,
  intensity: number,
  variants: number,
  quality: "standard"|"high"|"ultra"
}`}
                </pre>
              )}
            </div>

            {/* Browser Support */}
            <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-bold uppercase text-wise-accent">
                🌐 Browser Support
              </h3>
              <p className="text-xs text-wise-text-secondary">
                Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Mobile browsers
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Start Guide */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-studio-panel/50 backdrop-blur border border-studio-line rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-wise-text-primary mb-6">
            Quick Start Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Setup Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-wise-accent">Installation</h3>
              <pre className="bg-studio-bg rounded p-4 text-xs text-wise-accent overflow-x-auto">
{`import {
  MusicGenerationPromptBuilder
} from '@/components/MusicGeneration';

export default function Page() {
  return (
    <MusicGenerationPromptBuilder />
  );
}`}
              </pre>
            </div>

            {/* Advanced Hook Usage */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-wise-accent">With Hook</h3>
              <pre className="bg-studio-bg rounded p-4 text-xs text-wise-accent overflow-x-auto">
{`import { useMusicPromptBuilder }
  from '@/hooks/useMusicPromptBuilder';

function MyComponent() {
  const prompt = useMusicPromptBuilder();

  const handleGenerate = async () => {
    const result = await prompt.generate();
    if (result.success) {
      console.log('Track:', result.data);
    }
  };

  return (
    <button onClick={handleGenerate}>
      Generate
    </button>
  );
}`}
              </pre>
            </div>
          </div>

          {/* Integration Points */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold text-wise-accent">Integration Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-studio-raised border border-studio-line rounded p-4">
                <h4 className="font-semibold text-wise-text-primary mb-2">With API</h4>
                <p className="text-sm text-wise-text-secondary">
                  Component automatically sends POST request to <code className="text-wise-accent">/api/suno/generate</code> on button click
                </p>
              </div>

              <div className="bg-studio-raised border border-studio-line rounded p-4">
                <h4 className="font-semibold text-wise-text-primary mb-2">With Music Library</h4>
                <p className="text-sm text-wise-text-secondary">
                  Hook returns response data for saving to your music library or playlist system
                </p>
              </div>

              <div className="bg-studio-raised border border-studio-line rounded p-4">
                <h4 className="font-semibold text-wise-text-primary mb-2">LocalStorage</h4>
                <p className="text-sm text-wise-text-secondary">
                  State auto-saves every 1s under key <code className="text-wise-accent">musicPromptBuilder</code>
                </p>
              </div>

              <div className="bg-studio-raised border border-studio-line rounded p-4">
                <h4 className="font-semibold text-wise-text-primary mb-2">Custom State</h4>
                <p className="text-sm text-wise-text-secondary">
                  Use hook to integrate with Redux, Zustand, or Context
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-wise-text-primary mb-6">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                q: 'How do I customize the genres list?',
                a: 'Edit GENRE_CATEGORIES in constants/musicGeneration.ts and import into PromptBuilder.tsx',
              },
              {
                q: 'Can I add more voices?',
                a: 'Extend the VOICES array in the component or constants file with new voice definitions',
              },
              {
                q: 'How do I change the color scheme?',
                a: 'Use Tailwind CSS variables (studio-bg, wise-accent, etc.) - edit tailwind.config.js',
              },
              {
                q: 'Does it work offline?',
                a: 'UI works offline with localStorage. API requests require network connection.',
              },
              {
                q: 'How long does generation take?',
                a: 'Standard: 45-60s, High: 75-90s, Ultra: 120-150s (varies by duration)',
              },
              {
                q: 'Can I save multiple prompts?',
                a: 'Yes, use useMusicPromptBuilder hook which includes savePrompt() function',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-2"
              >
                <h4 className="font-semibold text-wise-text-primary">{item.q}</h4>
                <p className="text-sm text-wise-text-secondary">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Performance Notes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-studio-panel/50 backdrop-blur border border-studio-line rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-wise-accent mb-4">
            ⚡ Performance & Optimization
          </h3>
          <ul className="text-sm text-wise-text-secondary space-y-2">
            <li>✓ Component bundle size: ~45KB (gzipped)</li>
            <li>✓ No external API calls for UI rendering</li>
            <li>✓ Lazy genre search with memoization</li>
            <li>✓ Debounced localStorage saves</li>
            <li>✓ Smooth Framer Motion animations (GPU accelerated)</li>
            <li>✓ Mobile-optimized with responsive grid layouts</li>
          </ul>
        </motion.section>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center pb-12"
        >
          <p className="text-wise-text-secondary">
            For issues or questions, check the README.md in the component directory
          </p>
          <a
            href="./README.md"
            className="inline-block mt-4 px-6 py-2 bg-wise-accent text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-wise-accent/50 transition"
          >
            View Full Documentation
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default MusicGenerationExample;
