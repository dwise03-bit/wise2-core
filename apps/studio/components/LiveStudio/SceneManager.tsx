'use client';

import React, { useState, useCallback, useReducer, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  ChevronDown,
  MoreVertical,
  Layers,
  Keyboard,
  Settings,
  Play,
} from 'lucide-react';

/**
 * ============================================================================
 * TYPES & INTERFACES
 * ============================================================================
 */

export type TransitionType = 'cut' | 'fade' | 'slide' | 'stinger';
export type SceneTemplate = 'blank' | 'gaming' | 'talk-show' | 'music-production' | 'podcast' | 'streaming';

export interface SceneSource {
  id: string;
  name: string;
  type: string;
  visible: boolean;
}

export interface Scene {
  id: string;
  name: string;
  active: boolean;
  visible: boolean;
  transitionType: TransitionType;
  transitionDuration: number;
  stingerVideoId?: string;
  sources: SceneSource[];
  hotkey?: string;
  createdAt: Date;
  modifiedAt: Date;
  resolution?: { width: number; height: number };
}

export interface SceneManagerProps {
  scenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
  onSceneSelect: (sceneId: string) => void;
  selectedSceneId?: string;
}

/**
 * ============================================================================
 * REDUCER FOR COMPLEX STATE MANAGEMENT
 * ============================================================================
 */

type SceneAction =
  | { type: 'ADD_SCENE'; payload: Scene }
  | { type: 'DELETE_SCENE'; payload: string }
  | { type: 'UPDATE_SCENE'; payload: Scene }
  | { type: 'REORDER_SCENES'; payload: Scene[] }
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'SELECT_SCENE'; payload: string }
  | { type: 'BULK_DELETE'; payload: string[] };

function scenesReducer(state: Scene[], action: SceneAction): Scene[] {
  switch (action.type) {
    case 'ADD_SCENE':
      return [...state, action.payload];

    case 'DELETE_SCENE':
      return state.filter((s) => s.id !== action.payload);

    case 'UPDATE_SCENE':
      return state.map((s) => (s.id === action.payload.id ? action.payload : s));

    case 'REORDER_SCENES':
      return action.payload;

    case 'TOGGLE_VISIBILITY':
      return state.map((s) =>
        s.id === action.payload ? { ...s, visible: !s.visible } : s
      );

    case 'SELECT_SCENE':
      return state.map((s) => ({ ...s, active: s.id === action.payload }));

    case 'BULK_DELETE':
      return state.filter((s) => !action.payload.includes(s.id));

    default:
      return state;
  }
}

/**
 * ============================================================================
 * SUBCOMPONENTS
 * ============================================================================
 */

/**
 * Scene Template Selector Dialog
 */
function NewSceneDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: SceneTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<SceneTemplate>('blank');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), template);
      setName('');
      setTemplate('blank');
    }
  };

  if (!isOpen) return null;

  const templates: { id: SceneTemplate; label: string; description: string }[] = [
    { id: 'blank', label: 'Blank', description: 'Empty scene' },
    { id: 'gaming', label: 'Gaming', description: 'Game + webcam layout' },
    { id: 'talk-show', label: 'Talk Show', description: 'Host + guests + graphics' },
    { id: 'music-production', label: 'Music Production', description: 'DAW + mixer + monitors' },
    { id: 'podcast', label: 'Podcast', description: 'Hosts + audio meters' },
    { id: 'streaming', label: 'Streaming', description: 'Full streaming setup' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-wise-surface-secondary border border-wise-medium rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="border-b border-wise-medium p-6">
          <h2 className="text-lg font-bold text-wise-text-primary">New Scene</h2>
          <p className="text-sm text-wise-text-muted mt-1">Choose a name and template</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-wise-text-secondary mb-2">
              Scene Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g., Intro Scene"
              className="w-full px-3 py-2 bg-studio-input border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted focus:border-wise-accent focus:outline-none transition"
            />
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-semibold text-wise-text-secondary mb-3">
              Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded border transition ${
                    template === t.id
                      ? 'bg-wise-accent/20 border-wise-accent text-wise-text-primary'
                      : 'bg-studio-panel border-wise-medium text-wise-text-secondary hover:border-wise-medium'
                  }`}
                >
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs opacity-75 mt-1">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-wise-medium p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-wise-text-secondary hover:bg-studio-raised rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 bg-wise-accent text-black font-semibold rounded disabled:opacity-50 hover:bg-wise-accent-bright transition"
          >
            Create Scene
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Transition Settings Panel
 */
function TransitionSettings({
  scene,
  onUpdate,
}: {
  scene: Scene;
  onUpdate: (updates: Partial<Scene>) => void;
}) {
  return (
    <div className="space-y-4 p-4 bg-studio-raised rounded border border-wise-medium">
      <h3 className="font-semibold text-wise-text-primary flex items-center gap-2">
        <Settings size={16} />
        Transition Settings
      </h3>

      {/* Transition Type */}
      <div>
        <label className="block text-xs font-semibold text-wise-text-muted mb-2 uppercase">
          Type
        </label>
        <select
          value={scene.transitionType}
          onChange={(e) =>
            onUpdate({ transitionType: e.target.value as TransitionType })
          }
          className="w-full px-3 py-2 bg-studio-input border border-wise-medium rounded text-white text-sm focus:border-wise-accent focus:outline-none transition"
        >
          <option value="cut">Cut (Instant)</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="stinger">Stinger Video</option>
        </select>
      </div>

      {/* Duration */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-wise-text-muted uppercase">
            Duration
          </label>
          <span className="text-xs font-mono bg-studio-input px-2 py-1 rounded text-wise-accent">
            {scene.transitionDuration}ms
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={scene.transitionDuration}
          onChange={(e) => onUpdate({ transitionDuration: parseInt(e.target.value) })}
          className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
        />
        <div className="flex justify-between text-xs text-wise-text-muted mt-2">
          <span>0ms</span>
          <span>2000ms</span>
        </div>
      </div>

      {/* Stinger Video Selector (if applicable) */}
      {scene.transitionType === 'stinger' && (
        <div>
          <label className="block text-xs font-semibold text-wise-text-muted mb-2 uppercase">
            Stinger Video
          </label>
          <div className="p-3 bg-studio-input border border-wise-medium rounded text-center text-sm text-wise-text-muted">
            Select video file (feature placeholder)
          </div>
        </div>
      )}

      {/* Preview Button */}
      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-wise-accent/20 border border-wise-accent text-wise-accent hover:bg-wise-accent/30 rounded font-semibold transition">
        <Play size={14} />
        Preview Transition
      </button>
    </div>
  );
}

/**
 * Scene Properties Panel
 */
function SceneProperties({
  scene,
  index,
  totalScenes,
}: {
  scene: Scene;
  index: number;
  totalScenes: number;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 p-4 bg-studio-raised rounded border border-wise-medium">
      <h3 className="font-semibold text-wise-text-primary flex items-center gap-2">
        <Layers size={16} />
        Scene Properties
      </h3>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Order */}
        <div className="bg-studio-input p-3 rounded border border-wise-medium">
          <div className="text-wise-text-muted font-semibold mb-1">Order</div>
          <div className="text-white font-mono">
            {index + 1} of {totalScenes}
          </div>
        </div>

        {/* Source Count */}
        <div className="bg-studio-input p-3 rounded border border-wise-medium">
          <div className="text-wise-text-muted font-semibold mb-1">Sources</div>
          <div className="text-white font-mono">{scene.sources.length}</div>
        </div>

        {/* Created */}
        <div className="col-span-2 bg-studio-input p-3 rounded border border-wise-medium">
          <div className="text-wise-text-muted font-semibold mb-1">Created</div>
          <div className="text-white font-mono text-xs">{formatDate(scene.createdAt)}</div>
        </div>

        {/* Modified */}
        <div className="col-span-2 bg-studio-input p-3 rounded border border-wise-medium">
          <div className="text-wise-text-muted font-semibold mb-1">Modified</div>
          <div className="text-white font-mono text-xs">
            {formatDate(scene.modifiedAt)}
          </div>
        </div>

        {/* Resolution */}
        {scene.resolution && (
          <div className="col-span-2 bg-studio-input p-3 rounded border border-wise-medium">
            <div className="text-wise-text-muted font-semibold mb-1">Resolution</div>
            <div className="text-white font-mono">
              {scene.resolution.width}x{scene.resolution.height}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Scene Hotkey Manager
 */
function HotkeyManager({
  scene,
  onUpdate,
}: {
  scene: Scene;
  onUpdate: (updates: Partial<Scene>) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      // Build hotkey string
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.metaKey) parts.push('Cmd');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      // Add actual key
      if (e.key.length === 1) {
        parts.push(e.key.toUpperCase());
      } else if (e.key.startsWith('F')) {
        parts.push(e.key);
      } else if (e.key === 'ArrowUp') {
        parts.push('↑');
      } else if (e.key === 'ArrowDown') {
        parts.push('↓');
      } else if (e.key === 'ArrowLeft') {
        parts.push('←');
      } else if (e.key === 'ArrowRight') {
        parts.push('→');
      } else {
        parts.push(e.key);
      }

      onUpdate({ hotkey: parts.join('+') });
      setIsListening(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, onUpdate]);

  return (
    <div className="p-4 bg-studio-raised rounded border border-wise-medium">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-wise-text-primary flex items-center gap-2">
          <Keyboard size={16} />
          Hotkey
        </h3>
        {scene.hotkey && (
          <button
            onClick={() => onUpdate({ hotkey: undefined })}
            className="text-xs text-wise-text-muted hover:text-wise-accent-red transition"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={inputRef}
        onClick={() => setIsListening(true)}
        className={`p-3 rounded border transition cursor-pointer text-center font-mono ${
          isListening
            ? 'bg-wise-accent/20 border-wise-accent text-wise-accent'
            : scene.hotkey
              ? 'bg-studio-input border-wise-accent text-wise-accent'
              : 'bg-studio-input border-wise-medium text-wise-text-muted hover:border-wise-accent'
        }`}
      >
        {isListening ? (
          <span className="animate-pulse">Press any key...</span>
        ) : scene.hotkey ? (
          scene.hotkey
        ) : (
          'Click to set hotkey'
        )}
      </div>
    </div>
  );
}

/**
 * Scene List Item
 */
function SceneListItem({
  scene,
  index,
  isSelected,
  isRenaming,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onRenameStart,
  onRenameChange,
  onRenameSave,
  onShowContextMenu,
}: {
  scene: Scene;
  index: number;
  isSelected: boolean;
  isRenaming: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onRenameStart: () => void;
  onRenameChange: (value: string) => void;
  onRenameSave: () => void;
  onShowContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onContextMenu={onShowContextMenu}
      className={`group relative px-4 py-3 border-l-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-l-wise-accent bg-wise-accent/10 shadow-lg shadow-wise-accent/10'
          : 'border-l-transparent hover:bg-studio-raised'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Visibility Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="flex-shrink-0 text-wise-text-muted hover:text-wise-accent transition"
          title={scene.visible ? 'Hide scene' : 'Show scene'}
        >
          {scene.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        {/* Scene Name / Rename Input */}
        <div className="flex-1 min-w-0" onClick={onSelect}>
          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={scene.name}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRenameSave();
                if (e.key === 'Escape') onRenameSave();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 bg-studio-input border border-wise-accent rounded text-wise-text-primary text-sm font-semibold"
            />
          ) : (
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-wise-text-primary truncate">
                {scene.name}
              </div>
              <div className="text-xs text-wise-text-muted">
                {scene.sources.length} source{scene.sources.length !== 1 ? 's' : ''} • {scene.transitionType}
              </div>
            </div>
          )}
        </div>

        {/* Active Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-5 h-5 bg-wise-accent rounded-full flex items-center justify-center"
          >
            <span className="text-black font-bold text-xs">✓</span>
          </motion.div>
        )}

        {/* Hover Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenameStart();
            }}
            title="Rename"
            className="p-1.5 hover:bg-studio-raised rounded transition text-wise-text-muted hover:text-wise-text-primary"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate"
            className="p-1.5 hover:bg-studio-raised rounded transition text-wise-text-muted hover:text-wise-text-primary"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowContextMenu(e);
            }}
            title="More options"
            className="p-1.5 hover:bg-studio-raised rounded transition text-wise-text-muted hover:text-wise-text-primary"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Context Menu
 */
function ContextMenu({
  position,
  scene,
  onDelete,
  onDuplicate,
  onClose,
}: {
  position: { x: number; y: number } | null;
  scene: Scene;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [position, onClose]);

  if (!position) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ top: position.y, left: position.x }}
      className="fixed bg-studio-panel border border-wise-medium rounded shadow-xl z-50 min-w-48 py-2"
    >
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-wise-text-secondary hover:bg-studio-raised hover:text-wise-text-primary transition"
      >
        Duplicate Scene
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-wise-accent-red hover:bg-wise-accent-red/10 transition"
      >
        Delete Scene
      </button>
    </motion.div>
  );
}

/**
 * ============================================================================
 * MAIN SCENE MANAGER COMPONENT
 * ============================================================================
 */

export function SceneManager({
  scenes: initialScenes,
  onScenesChange,
  onSceneSelect,
  selectedSceneId,
}: SceneManagerProps) {
  const [scenes, dispatch] = useReducer(scenesReducer, initialScenes);
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewSceneDialog, setShowNewSceneDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuSceneId, setContextMenuSceneId] = useState<string | null>(null);
  const [expandedPropertiesId, setExpandedPropertiesId] = useState<string | null>(null);

  // Sync local state with parent
  useEffect(() => {
    onScenesChange(scenes);
  }, [scenes, onScenesChange]);

  /**
   * Event Handlers
   */

  const handleSelectScene = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        dispatch({ type: 'SELECT_SCENE', payload: sceneId });
        onSceneSelect(sceneId);
      }
    },
    [scenes, onSceneSelect]
  );

  const handleAddScene = useCallback(
    (name: string, template: SceneTemplate) => {
      const newScene: Scene = {
        id: `scene-${Date.now()}`,
        name,
        active: scenes.length === 0,
        visible: true,
        transitionType: 'fade',
        transitionDuration: 300,
        sources: [],
        createdAt: new Date(),
        modifiedAt: new Date(),
        resolution: { width: 1920, height: 1080 },
      };

      dispatch({ type: 'ADD_SCENE', payload: newScene });
      setShowNewSceneDialog(false);

      if (newScene.active) {
        onSceneSelect(newScene.id);
      }
    },
    [scenes.length, onSceneSelect]
  );

  const handleDeleteScene = useCallback((sceneId: string) => {
    dispatch({ type: 'DELETE_SCENE', payload: sceneId });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedScenes.size > 0) {
      dispatch({ type: 'BULK_DELETE', payload: Array.from(selectedScenes) });
      setSelectedScenes(new Set());
    }
  }, [selectedScenes]);

  const handleDuplicateScene = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        const duplicate: Scene = {
          ...scene,
          id: `scene-${Date.now()}`,
          name: `${scene.name} (Copy)`,
          active: false,
          modifiedAt: new Date(),
        };
        dispatch({ type: 'ADD_SCENE', payload: duplicate });
      }
    },
    [scenes]
  );

  const handleRenameScene = useCallback((sceneId: string, name: string) => {
    if (name.trim()) {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        dispatch({
          type: 'UPDATE_SCENE',
          payload: { ...scene, name: name.trim(), modifiedAt: new Date() },
        });
      }
    }
    setRenamingId(null);
  }, [scenes]);

  const handleToggleVisibility = useCallback((sceneId: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', payload: sceneId });
  }, []);

  const handleReorderScenes = useCallback((newScenes: Scene[]) => {
    dispatch({ type: 'REORDER_SCENES', payload: newScenes });
  }, []);

  const handleUpdateScene = useCallback(
    (sceneId: string, updates: Partial<Scene>) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        dispatch({
          type: 'UPDATE_SCENE',
          payload: { ...scene, ...updates, modifiedAt: new Date() },
        });
      }
    },
    [scenes]
  );

  const selectedScene = scenes.find((s) => s.id === selectedSceneId || s.active);
  const selectedSceneIndex = scenes.findIndex((s) => s.id === selectedSceneId || s.active);

  /**
   * Render
   */

  return (
    <div className="flex h-full bg-studio-bg">
      {/* ====== LEFT SIDEBAR: SCENE LIST ====== */}
      <div className="w-80 flex flex-col border-r border-wise-medium bg-studio-panel">
        {/* Header */}
        <div className="border-b border-wise-medium p-4 space-y-3">
          <h2 className="text-sm font-bold text-wise-text-primary flex items-center gap-2">
            <Layers size={16} className="text-wise-accent" />
            SCENES
          </h2>
          <motion.button
            onClick={() => setShowNewSceneDialog(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-wise-accent hover:bg-wise-accent-bright text-black font-semibold rounded transition"
          >
            <Plus size={16} />
            New Scene
          </motion.button>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedScenes.size > 0 && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={handleBulkDelete}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-wise-accent-red/20 hover:bg-wise-accent-red/30 text-wise-accent-red font-semibold rounded transition text-sm"
              >
                <Trash2 size={14} />
                Delete ({selectedScenes.size})
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Scene List */}
        <div className="flex-1 overflow-y-auto">
          <Reorder.Group axis="y" values={scenes} onReorder={handleReorderScenes}>
            <AnimatePresence>
              {scenes.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-wise-text-muted text-sm">
                  No scenes. Click "New Scene" to start.
                </div>
              ) : (
                scenes.map((scene, index) => (
                  <Reorder.Item
                    key={scene.id}
                    value={scene}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <SceneListItem
                      scene={scene}
                      index={index}
                      isSelected={scene.id === selectedSceneId || scene.active}
                      isRenaming={renamingId === scene.id}
                      onSelect={() => handleSelectScene(scene.id)}
                      onDelete={() => handleDeleteScene(scene.id)}
                      onDuplicate={() => handleDuplicateScene(scene.id)}
                      onToggleVisibility={() => handleToggleVisibility(scene.id)}
                      onRenameStart={() => {
                        setRenamingId(scene.id);
                        setRenameValue(scene.name);
                      }}
                      onRenameChange={(value) => setRenameValue(value)}
                      onRenameSave={() => handleRenameScene(scene.id, renameValue)}
                      onShowContextMenu={(e) => {
                        setContextMenuSceneId(scene.id);
                        setContextMenu({ x: e.clientX, y: e.clientY });
                      }}
                    />
                  </Reorder.Item>
                ))
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>

      {/* ====== CENTER: TRANSITION SETTINGS ====== */}
      {selectedScene && (
        <div className="flex-1 border-r border-wise-medium p-6 overflow-y-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-wise-text-primary mb-2">
              {selectedScene.name}
            </h1>
            <p className="text-sm text-wise-text-muted">
              Configure transition and playback settings
            </p>
          </div>

          <TransitionSettings
            scene={selectedScene}
            onUpdate={(updates) => handleUpdateScene(selectedScene.id, updates)}
          />

          <HotkeyManager
            scene={selectedScene}
            onUpdate={(updates) => handleUpdateScene(selectedScene.id, updates)}
          />
        </div>
      )}

      {/* ====== RIGHT SIDEBAR: PROPERTIES ====== */}
      {selectedScene && (
        <div className="w-80 border-l border-wise-medium p-4 overflow-y-auto space-y-4">
          <SceneProperties
            scene={selectedScene}
            index={selectedSceneIndex}
            totalScenes={scenes.length}
          />
        </div>
      )}

      {/* Dialogs & Menus */}
      <NewSceneDialog
        isOpen={showNewSceneDialog}
        onClose={() => setShowNewSceneDialog(false)}
        onCreate={handleAddScene}
      />

      <ContextMenu
        position={contextMenu}
        scene={scenes.find((s) => s.id === contextMenuSceneId) || scenes[0]}
        onDelete={() => {
          if (contextMenuSceneId) handleDeleteScene(contextMenuSceneId);
        }}
        onDuplicate={() => {
          if (contextMenuSceneId) handleDuplicateScene(contextMenuSceneId);
        }}
        onClose={() => {
          setContextMenu(null);
          setContextMenuSceneId(null);
        }}
      />
    </div>
  );
}
