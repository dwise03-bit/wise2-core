'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings, Layers } from 'lucide-react';
import { SceneManager, type Scene } from './SceneManager';
import { SourceManager, type Source } from './SourceManager';
import { PreviewCanvas } from './PreviewCanvas';

/**
 * ============================================================================
 * PREVIEW UI - UNIFIED OBS SCENE + SOURCE MANAGEMENT INTERFACE
 * ============================================================================
 *
 * Complete responsive layout with:
 * - Left sidebar: Scene list (draggable, add, delete, rename, transitions)
 * - Center: Live preview canvas
 * - Right sidebar: Source management + properties
 * - Mobile-responsive: Collapsible panels
 */

export interface PreviewUIProps {
  /** Scenes to display */
  scenes?: Scene[];
  /** Callback when scenes change */
  onScenesChange?: (scenes: Scene[]) => void;
  /** Canvas resolution width (px) */
  canvasWidth?: number;
  /** Canvas resolution height (px) */
  canvasHeight?: number;
  /** Initial active scene ID */
  initialSceneId?: string;
  /** Show FPS counter on preview */
  showFps?: boolean;
  /** Allow editing */
  editable?: boolean;
  /** Callback for stream start/stop */
  onStreamToggle?: (isActive: boolean) => void;
}

interface PanelState {
  scenesOpen: boolean;
  sourcesOpen: boolean;
  fullscreenCanvas: boolean;
  mobileView: 'scenes' | 'canvas' | 'sources';
}

export function PreviewUI({
  scenes: initialScenes = [],
  onScenesChange,
  canvasWidth = 1280,
  canvasHeight = 720,
  initialSceneId,
  showFps = true,
  editable = true,
  onStreamToggle,
}: PreviewUIProps) {
  // Panel visibility state
  const [panelState, setPanelState] = useState<PanelState>({
    scenesOpen: true,
    sourcesOpen: true,
    fullscreenCanvas: false,
    mobileView: 'canvas',
  });

  // Scenes management
  const [scenes, setScenes] = useState<Scene[]>(
    initialScenes.length > 0
      ? initialScenes
      : [
          {
            id: 'scene-1',
            name: 'Main',
            active: true,
            visible: true,
            transitionType: 'cut',
            transitionDuration: 0,
            sources: [],
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ]
  );

  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    initialSceneId || scenes[0]?.id || 'scene-1'
  );

  // Sources management
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Get active scene
  const activeScene = useMemo(
    () => scenes.find((s) => s.id === selectedSceneId),
    [scenes, selectedSceneId]
  );

  // Get active scene sources
  const activeSceneSources = useMemo(() => {
    if (!activeScene) return [];
    return sources.filter((s) => activeScene.sources?.some((ss) => ss.id === s.id));
  }, [activeScene, sources]);

  // Handlers
  const handleScenesChange = useCallback(
    (newScenes: Scene[]) => {
      setScenes(newScenes);
      onScenesChange?.(newScenes);
    },
    [onScenesChange]
  );

  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
    setSelectedSourceId(null); // Clear selected source when switching scenes
  }, []);

  const handleSourcesChange = useCallback((newSources: Source[]) => {
    setSources(newSources);
    // Update active scene with new sources
    if (activeScene) {
      handleScenesChange(
        scenes.map((s) =>
          s.id === activeScene.id
            ? {
                ...s,
                sources: newSources.map((src) => ({
                  id: src.id,
                  name: src.name,
                  type: src.type,
                  visible: src.visible,
                })),
              }
            : s
        )
      );
    }
  }, [activeScene, scenes, handleScenesChange]);

  const handleSourceSelect = useCallback((id: string | null) => {
    setSelectedSourceId(id);
  }, []);

  // Responsive breakpoint detection
  const [isDesktop, setIsDesktop] = useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile view: show one panel at a time
  if (!isDesktop && !panelState.fullscreenCanvas) {
    return (
      <div className="w-full h-screen bg-wise-surface-primary flex flex-col">
        {/* Mobile Tab Navigation */}
        <div className="flex border-b border-wise-medium">
          {(['scenes', 'canvas', 'sources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setPanelState({ ...panelState, mobileView: tab })}
              className={`flex-1 py-3 px-2 text-sm font-semibold transition ${
                panelState.mobileView === tab
                  ? 'bg-wise-accent/20 border-b-2 border-wise-accent text-wise-accent'
                  : 'text-wise-text-secondary hover:text-wise-text-primary'
              }`}
            >
              {tab === 'scenes' && 'Scenes'}
              {tab === 'canvas' && 'Preview'}
              {tab === 'sources' && 'Sources'}
            </button>
          ))}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {panelState.mobileView === 'scenes' && (
              <motion.div
                key="scenes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4"
              >
                <SceneManager
                  scenes={scenes}
                  selectedSceneId={selectedSceneId}
                  onScenesChange={handleScenesChange}
                  onSceneSelect={handleSceneSelect}
                />
              </motion.div>
            )}

            {panelState.mobileView === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                {activeScene && (
                  <div style={{ width: canvasWidth, height: canvasHeight }}>
                    <PreviewCanvas
                      sources={activeSceneSources as any}
                      sceneName="active"
                      isRecording={false}
                      isStreaming={false}
                      elapsedTime="00:00"
                      resolution={{ width: canvasWidth, height: canvasHeight }}
                      targetResolution={{ width: canvasWidth, height: canvasHeight }}
                      metrics={{
                        cpuUsage: 0,
                        gpuUsage: 0,
                        renderTime: 0,
                        encodeTime: 0,
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {panelState.mobileView === 'sources' && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4"
              >
                <SourceManager
                  sources={activeSceneSources}
                  selectedSourceId={selectedSourceId}
                  onSourcesChange={handleSourcesChange}
                  onSourceSelect={handleSourceSelect}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Desktop view: three-column layout
  return (
    <div className="w-full h-screen bg-wise-surface-primary flex flex-col">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-wise-medium bg-wise-surface-secondary px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-wise-accent" />
          <h1 className="text-sm font-semibold text-wise-text-primary">
            OBS Scene Manager - {activeScene?.name || 'No Scene'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setPanelState({
                ...panelState,
                fullscreenCanvas: !panelState.fullscreenCanvas,
              })
            }
            className="p-2 hover:bg-wise-medium rounded transition text-wise-text-secondary hover:text-wise-text-primary"
            title={panelState.fullscreenCanvas ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {panelState.fullscreenCanvas ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>

          <button
            onClick={() =>
              setPanelState({
                ...panelState,
                scenesOpen: !panelState.scenesOpen,
              })
            }
            className="px-3 py-1 text-xs hover:bg-wise-medium rounded transition text-wise-text-secondary hover:text-wise-text-primary"
            title="Toggle scenes panel"
          >
            {panelState.scenesOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <button
            onClick={() =>
              setPanelState({
                ...panelState,
                sourcesOpen: !panelState.sourcesOpen,
              })
            }
            className="px-3 py-1 text-xs hover:bg-wise-medium rounded transition text-wise-text-secondary hover:text-wise-text-primary"
            title="Toggle sources panel"
          >
            {panelState.sourcesOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Scenes */}
        {panelState.scenesOpen && !panelState.fullscreenCanvas && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-wise-medium bg-wise-surface-secondary overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-wise-text-primary">Scenes</h2>
              </div>
              <SceneManager
                scenes={scenes}
                selectedSceneId={selectedSceneId}
                onScenesChange={handleScenesChange}
                onSceneSelect={handleSceneSelect}
              />
            </div>
          </motion.div>
        )}

        {/* CENTER - Preview Canvas */}
        <motion.div
          layout
          className="flex-1 flex items-center justify-center bg-black overflow-auto"
        >
          {activeScene ? (
            <div className="flex flex-col items-center justify-center p-4">
              <PreviewCanvas
                sources={activeSceneSources as any}
                sceneName="active"
                isRecording={false}
                isStreaming={false}
                elapsedTime="00:00"
                resolution={{ width: canvasWidth, height: canvasHeight }}
                targetResolution={{ width: canvasWidth, height: canvasHeight }}
                metrics={{
                  cpuUsage: 0,
                  gpuUsage: 0,
                  renderTime: 0,
                  encodeTime: 0,
                }}
              />
              <div className="mt-4 text-xs text-wise-text-muted">
                {canvasWidth}x{canvasHeight} @ {showFps ? '60 FPS' : 'N/A'}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-wise-text-muted">No scene selected</p>
            </div>
          )}
        </motion.div>

        {/* RIGHT SIDEBAR - Sources & Properties */}
        {panelState.sourcesOpen && !panelState.fullscreenCanvas && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-wise-medium bg-wise-surface-secondary overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-wise-text-primary">Sources</h2>
                <Settings size={16} className="text-wise-text-muted cursor-pointer hover:text-wise-text-primary transition" />
              </div>
              <SourceManager
                sources={activeSceneSources}
                selectedSourceId={selectedSourceId}
                onSourcesChange={handleSourcesChange}
                onSourceSelect={handleSourceSelect}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Canvas Overlay */}
      <AnimatePresence>
        {panelState.fullscreenCanvas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50 flex items-center justify-center"
          >
            {activeScene && (
              <PreviewCanvas
                sources={activeSceneSources as any}
                sceneName="active"
                isRecording={false}
                isStreaming={false}
                elapsedTime="00:00"
                resolution={{ width: canvasWidth, height: canvasHeight }}
                targetResolution={{ width: canvasWidth, height: canvasHeight }}
                metrics={{
                  cpuUsage: 0,
                  gpuUsage: 0,
                  renderTime: 0,
                  encodeTime: 0,
                }}
              />
            )}

            {/* Exit fullscreen button */}
            <button
              onClick={() =>
                setPanelState({
                  ...panelState,
                  fullscreenCanvas: false,
                })
              }
              className="absolute top-4 right-4 p-3 bg-wise-surface-secondary hover:bg-wise-medium rounded transition text-wise-text-secondary hover:text-wise-text-primary"
              title="Exit fullscreen (ESC)"
            >
              <Minimize2 size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESC key handler for fullscreen exit */}
      <EscapeKeyHandler
        onEscape={() =>
          panelState.fullscreenCanvas &&
          setPanelState({ ...panelState, fullscreenCanvas: false })
        }
      />
    </div>
  );
}

/**
 * Helper component: ESC key handler
 */
function EscapeKeyHandler({ onEscape }: { onEscape: () => void }) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);

  return null;
}

export default PreviewUI;
