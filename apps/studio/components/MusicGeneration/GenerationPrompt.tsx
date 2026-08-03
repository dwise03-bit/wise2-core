'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, X } from 'lucide-react';

interface GenerationPromptProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  recentPrompts?: string[];
}

const PROMPT_SUGGESTIONS = [
  'upbeat electronic dance track with bright synths',
  'melancholic indie folk with acoustic guitar',
  'dark ambient drone with evolving textures',
  'funky hip-hop beat with groovy bassline',
  'orchestral cinematic track with sweeping strings',
  'lo-fi chill hip-hop with jazzy chords',
  'aggressive metal track with heavy guitars',
  'dreamy synthwave with retro 80s vibes',
  'smooth jazz fusion with complex harmonies',
  'energetic tropical house with steel drums',
];

const EXAMPLE_PROMPTS = [
  {
    title: 'Dance Floor Banger',
    prompt: 'High-energy EDM track with a building drop, pulsing 808 bass, and euphoric synth melodies. 128 BPM, major key.',
  },
  {
    title: 'Emotional Ballad',
    prompt: 'Tender piano-driven ballad with subtle string arrangements, intimate vocal delivery, and dynamic crescendos.',
  },
  {
    title: 'Lo-Fi Vibe',
    prompt: 'Relaxing lo-fi hip-hop beat with vinyl crackle, smooth jazz chords, and a laid-back, conversational vibe.',
  },
  {
    title: 'Epic Orchestral',
    prompt: 'Grand orchestral score with sweeping strings, powerful brass sections, and a heroic, inspirational melody.',
  },
];

export function GenerationPrompt({
  value,
  onChange,
  onGenerate,
  isLoading = false,
  recentPrompts = [],
}: GenerationPromptProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [showRecent, setShowRecent] = useState(false);

  const charLimit = 500;
  const characterCount = value.length;
  const charPercentage = (characterCount / charLimit) * 100;

  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return PROMPT_SUGGESTIONS;
    const query = value.toLowerCase();
    return PROMPT_SUGGESTIONS.filter(s => s.toLowerCase().includes(query));
  }, [value]);

  const handleInsertSuggestion = useCallback((suggestion: string) => {
    if (!value.trim()) {
      onChange(suggestion);
    } else {
      onChange(`${value.trim()} ${suggestion}`);
    }
    setShowSuggestions(false);
  }, [value, onChange]);

  const handleSelectExample = useCallback((example: string) => {
    onChange(example);
    setSelectedExample(null);
    setShowExamples(false);
  }, [onChange]);

  const handleSelectRecent = useCallback((prompt: string) => {
    onChange(prompt);
    setShowRecent(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setShowSuggestions(false);
    setShowExamples(false);
    setShowRecent(false);
  }, [onChange]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Music Description
        </label>
        <p className="text-xs text-wise-text-muted">
          Describe your ideal track in natural language. Include style, mood, instruments, and vibe.
        </p>
      </div>

      {/* Textarea with Smart Features */}
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, charLimit))}
          onFocus={() => value.length === 0 && setShowSuggestions(true)}
          placeholder="e.g., 'Upbeat electronic dance track with bright synths, pulsing 808 bass, and euphoric drop at 128 BPM'..."
          className="w-full min-h-[140px] bg-studio-input border border-studio-line rounded-lg p-4 text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition resize-none"
        />

        {/* Character Counter + Clear Button */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {value.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-studio-line rounded transition"
              title="Clear prompt"
            >
              <X className="w-4 h-4 text-wise-text-muted" />
            </button>
          )}
          <div className="flex flex-col items-end gap-1">
            <div className="w-24 h-1 bg-studio-line rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent transition-all"
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-wise-text-muted">
              {characterCount} / {charLimit}
            </p>
          </div>
        </div>
      </div>

      {/* Smart Suggestions Popup */}
      <AnimatePresence>
        {showSuggestions && value.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-wise-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wise-accent" />
                Quick Start Suggestions
              </p>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-wise-text-muted hover:text-wise-text-primary transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PROMPT_SUGGESTIONS.slice(0, 6).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertSuggestion(suggestion)}
                  className="text-left text-sm px-3 py-2 bg-studio-input border border-studio-line rounded hover:border-wise-accent hover:bg-studio-raised transition"
                >
                  <p className="text-wise-text-secondary">{suggestion}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowSuggestions(false);
                setShowExamples(true);
              }}
              className="w-full text-sm py-2 text-wise-accent hover:text-wise-accent-bright transition flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              See Example Prompts
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Prompts Modal */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-wise-text-primary">Example Prompts</p>
              <button onClick={() => setShowExamples(false)}>
                <X className="w-4 h-4 text-wise-text-muted" />
              </button>
            </div>

            <div className="space-y-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedExample(idx);
                    setTimeout(() => handleSelectExample(example.prompt), 200);
                  }}
                  className="w-full text-left p-3 bg-studio-input border border-studio-line rounded hover:border-wise-accent transition"
                >
                  <p className="font-semibold text-wise-text-primary text-sm">{example.title}</p>
                  <p className="text-xs text-wise-text-muted mt-1 line-clamp-2">{example.prompt}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Prompts */}
      {recentPrompts.length > 0 && (
        <div>
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="text-sm text-wise-accent hover:text-wise-accent-bright transition flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Recent Prompts ({recentPrompts.length})
          </button>

          <AnimatePresence>
            {showRecent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {recentPrompts.slice(0, 5).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(prompt)}
                    className="w-full text-left text-sm px-3 py-2 bg-studio-input border border-studio-line rounded hover:border-wise-accent transition text-wise-text-secondary truncate"
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Generate Button */}
      {onGenerate && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          disabled={!value.trim() || isLoading}
          className="w-full py-3 bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black font-bold rounded-lg hover:from-wise-accent hover:to-wise-accent-bright disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Generate Music'}
        </motion.button>
      )}
    </div>
  );
}
