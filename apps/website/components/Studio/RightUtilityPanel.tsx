'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LAYOUT, PANEL_TABS, ANIMATION_CONFIG } from './constants';
import type { PanelTab, PromptEditorState, TimelineTrack } from './types';

interface RightUtilityPanelProps {
  activeTab?: PanelTab;
  onTabChange?: (tab: PanelTab) => void;
  selectedElementProperties?: Record<string, unknown>;
  timelineTracks?: TimelineTrack[];
}

const MOCK_TIMELINE_TRACKS: TimelineTrack[] = [
  {
    id: 't1',
    name: 'Background',
    duration: 100,
    startTime: 0,
    keyframes: [
      { id: 'k1', time: 0, value: 0, easing: 'linear' },
      { id: 'k2', time: 50, value: 100, easing: 'ease-in-out' },
    ],
  },
  {
    id: 't2',
    name: 'Title Text',
    duration: 60,
    startTime: 10,
    keyframes: [{ id: 'k3', time: 10, value: 'fade-in', easing: 'ease-out' }],
  },
  {
    id: 't3',
    name: 'Audio Track',
    duration: 100,
    startTime: 0,
    keyframes: [],
  },
];

export default function RightUtilityPanel({
  activeTab: controlledTab,
  onTabChange,
  selectedElementProperties = {
    x: 240,
    y: 120,
    width: 640,
    height: 400,
    opacity: 100,
    rotation: 0,
  },
  timelineTracks = MOCK_TIMELINE_TRACKS,
}: RightUtilityPanelProps) {
  const [width, setWidth] = useState(LAYOUT.RIGHT_PANEL_DEFAULT);
  const [internalTab, setInternalTab] = useState<PanelTab>('properties');
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: PanelTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const clamped = Math.min(
        Math.max(newWidth, LAYOUT.RIGHT_PANEL_MIN),
        LAYOUT.RIGHT_PANEL_MAX
      );
      setWidth(clamped);
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <motion.div
      className="h-screen bg-wise-surface border-l border-wise-surface-2 flex relative flex-shrink-0"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-wise-primary/40 transition-colors z-10 ${
          isResizing ? 'bg-wise-primary/60' : ''
        }`}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="h-12 border-b border-wise-surface-2 flex items-center px-2">
          {PANEL_TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PanelTab)}
              className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'text-wise-primary'
                  : 'text-wise-text-secondary hover:text-wise-text-primary'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{tab.icon}</span>
              {width > 280 && <span>{tab.label}</span>}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="rightPanelActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-wise-primary to-wise-electric"
                  transition={ANIMATION_CONFIG.EASE_SMOOTH}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'properties' && (
              <PropertiesPanel
                key="properties"
                properties={selectedElementProperties}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelinePanel key="timeline" tracks={timelineTracks} />
            )}
            {activeTab === 'prompt' && <PromptEditorPanel key="prompt" />}
            {activeTab === 'inspector' && <InspectorPanel key="inspector" />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Properties Panel ---------------- */

function PropertiesPanel({
  properties,
}: {
  properties: Record<string, unknown>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={ANIMATION_CONFIG.EASE_FAST}
      className="p-4 space-y-4"
    >
      <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider">
        Element Properties
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(properties).map(([key, value]) => (
          <div key={key}>
            <label className="text-[10px] text-wise-text-muted uppercase tracking-wide">
              {key}
            </label>
            <input
              type="text"
              defaultValue={String(value)}
              className="w-full mt-1 px-2.5 py-1.5 rounded-md bg-wise-card border border-wise-surface-2 text-sm text-wise-text-primary focus:outline-none focus:border-wise-primary/60 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-wise-surface-2">
        <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider mb-2">
          Appearance
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-wise-text-secondary mb-1">
              <span>Opacity</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="w-full accent-wise-primary"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-wise-text-secondary mb-1">
              <span>Rotation</span>
              <span>0°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              defaultValue="0"
              className="w-full accent-wise-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Timeline Panel ---------------- */

function TimelinePanel({ tracks }: { tracks: TimelineTrack[] }) {
  const [playhead, setPlayhead] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayhead((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={ANIMATION_CONFIG.EASE_FAST}
      className="p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider">
          Timeline
        </p>
        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-7 rounded-full bg-wise-primary/20 hover:bg-wise-primary/30 flex items-center justify-center text-wise-primary transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>
      </div>

      <div className="space-y-2">
        {tracks.map((track) => (
          <div key={track.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-wise-text-secondary">
                {track.name}
              </span>
              <div className="flex space-x-1">
                <button className="text-[10px] text-wise-text-muted hover:text-wise-text-primary">
                  🔒
                </button>
                <button className="text-[10px] text-wise-text-muted hover:text-wise-text-primary">
                  👁
                </button>
              </div>
            </div>
            <div className="h-6 bg-wise-card rounded-md relative overflow-hidden border border-wise-surface-2">
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-wise-primary/40 to-wise-electric/30 rounded-md"
                style={{
                  left: `${track.startTime}%`,
                  width: `${track.duration - track.startTime}%`,
                }}
              />
              {track.keyframes.map((kf) => (
                <div
                  key={kf.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-wise-electric"
                  style={{ left: `${kf.time}%` }}
                  title={`${kf.value} (${kf.easing})`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Playhead scrubber */}
      <div className="pt-2">
        <div className="h-1 bg-wise-surface-2 rounded-full relative">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-wise-electric shadow-lg cursor-pointer"
            style={{
              left: `${playhead}%`,
              boxShadow: '0 0 12px rgba(0, 217, 255, 0.6)',
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-wise-text-muted">
          <span>0:00</span>
          <span>{Math.floor(playhead / 10)}:00</span>
          <span>1:00</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Prompt Editor Panel (AI Streaming) ---------------- */

function PromptEditorPanel() {
  const [state, setState] = useState<PromptEditorState>({
    content: '',
    isGenerating: false,
    responseStream: '',
    tokens: { input: 0, output: 0 },
  });

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateGeneration = useCallback(() => {
    if (!state.content.trim()) return;

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      responseStream: '',
      tokens: { input: prev.content.length, output: 0 },
    }));

    const fullResponse =
      'Generating your creative asset based on the prompt. This response streams token by token to simulate a real-time AI generation experience, matching the enterprise feel of tools like Figma AI and Linear.';

    let index = 0;
    streamIntervalRef.current = setInterval(() => {
      if (index < fullResponse.length) {
        const chunk = fullResponse.slice(0, index + 3);
        setState((prev) => ({
          ...prev,
          responseStream: chunk,
          tokens: { ...prev.tokens, output: chunk.split(' ').length },
        }));
        index += 3;
      } else {
        setState((prev) => ({ ...prev, isGenerating: false }));
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      }
    }, 30);
  }, [state.content]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={ANIMATION_CONFIG.EASE_FAST}
      className="p-4 flex flex-col h-full space-y-3"
    >
      <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider">
        AI Prompt Editor
      </p>

      <textarea
        value={state.content}
        onChange={(e) =>
          setState((prev) => ({ ...prev, content: e.target.value }))
        }
        placeholder="Describe what you want to generate..."
        rows={4}
        className="w-full px-3 py-2 rounded-lg bg-wise-card border border-wise-surface-2 text-sm text-wise-text-primary placeholder-wise-text-muted resize-none focus:outline-none focus:border-wise-primary/60 transition-colors"
      />

      <motion.button
        onClick={simulateGeneration}
        disabled={state.isGenerating || !state.content.trim()}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-wise-primary to-wise-electric text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        whileHover={{ scale: state.isGenerating ? 1 : 1.02 }}
        whileTap={{ scale: state.isGenerating ? 1 : 0.98 }}
      >
        {state.isGenerating ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⟳
            </motion.span>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Generate</span>
          </>
        )}
      </motion.button>

      {/* Streaming response area */}
      <AnimatePresence>
        {(state.responseStream || state.isGenerating) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 rounded-lg bg-wise-card border border-wise-surface-2 p-3 overflow-y-auto"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wise-primary to-wise-electric flex items-center justify-center text-xs">
                🤖
              </div>
              <span className="text-xs font-medium text-wise-text-primary">
                AI Assistant
              </span>
            </div>
            <p className="text-sm text-wise-text-secondary leading-relaxed">
              {state.responseStream}
              {state.isGenerating && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-1.5 h-4 bg-wise-electric ml-0.5 align-middle"
                />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {(state.tokens.input > 0 || state.tokens.output > 0) && (
        <div className="flex justify-between text-[10px] text-wise-text-muted pt-2 border-t border-wise-surface-2">
          <span>Input: {state.tokens.input} chars</span>
          <span>Output: {state.tokens.output} words</span>
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Inspector Panel ---------------- */

function InspectorPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={ANIMATION_CONFIG.EASE_FAST}
      className="p-4 space-y-4"
    >
      <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider">
        DOM / Layer Inspector
      </p>

      <div className="rounded-lg bg-wise-card border border-wise-surface-2 divide-y divide-wise-surface-2">
        {[
          { label: 'Selected', value: 'Group / Frame 1' },
          { label: 'Layer Type', value: 'Composition' },
          { label: 'Children', value: '4 elements' },
          { label: 'Bounds', value: '640 × 400 px' },
          { label: 'Blend Mode', value: 'Normal' },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-3 py-2"
          >
            <span className="text-xs text-wise-text-muted">{row.label}</span>
            <span className="text-xs text-wise-text-primary font-medium">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider mb-2">
          Layer Tree
        </p>
        <div className="space-y-1">
          {['Background', 'Title Text', 'CTA Button', 'Decoration'].map(
            (layer, idx) => (
              <motion.div
                key={layer}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-wise-surface-2 cursor-pointer transition-colors"
                whileHover={{ x: 2 }}
                style={{ paddingLeft: `${8 + idx * 4}px` }}
              >
                <span className="text-xs">📦</span>
                <span className="text-xs text-wise-text-secondary">
                  {layer}
                </span>
              </motion.div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
