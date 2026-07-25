'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grip, Plus, Trash2, Copy, Edit2 } from 'lucide-react';

export interface Scene {
  id: string;
  name: string;
  active: boolean;
  transition: 'fade' | 'cut' | 'slide';
  transitionDuration: number;
}

interface OBSSceneManagerProps {
  scenes: Scene[];
  onSceneAdd: () => void;
  onSceneDelete: (id: string) => void;
  onSceneDuplicate: (id: string) => void;
  onSceneRename: (id: string, name: string) => void;
  onSceneSelect: (id: string) => void;
  onSceneReorder: (scenes: Scene[]) => void;
  onTransitionChange: (id: string, transition: string, duration: number) => void;
}

export function OBSSceneManager({
  scenes,
  onSceneAdd,
  onSceneDelete,
  onSceneDuplicate,
  onSceneRename,
  onSceneSelect,
  onSceneReorder,
  onTransitionChange,
}: OBSSceneManagerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = scenes.findIndex((s) => s.id === draggedId);
    const targetIndex = scenes.findIndex((s) => s.id === targetId);

    const newScenes = [...scenes];
    const [draggedScene] = newScenes.splice(draggedIndex, 1);
    newScenes.splice(targetIndex, 0, draggedScene);

    onSceneReorder(newScenes);
    setDraggedId(null);
  };

  const handleRenameStart = (scene: Scene) => {
    setRenamingId(scene.id);
    setRenameValue(scene.name);
  };

  const handleRenameSave = (id: string) => {
    if (renameValue.trim()) {
      onSceneRename(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          SCENES
        </h2>
        <motion.button
          onClick={onSceneAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition"
        >
          <Plus size={16} />
          Add Scene
        </motion.button>
      </div>

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {scenes.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No scenes yet. Click "Add Scene" to start.
            </div>
          ) : (
            scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => handleDragStart(scene.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(scene.id)}
                onContextMenu={(e) => handleContextMenu(e, scene.id)}
                className={`group relative border-l-4 transition-all cursor-move ${
                  scene.active
                    ? 'border-l-blue-500 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg shadow-blue-500/20'
                    : 'border-l-transparent hover:bg-gray-800/50'
                } ${draggedId === scene.id ? 'opacity-50' : ''}`}
              >
                <div className="px-3 py-3 flex items-center gap-2">
                  {/* Drag Handle */}
                  <Grip
                    size={14}
                    className="text-gray-600 group-hover:text-gray-400 flex-shrink-0"
                  />

                  {/* Scene Name / Edit Field */}
                  <div className="flex-1 min-w-0">
                    {renamingId === scene.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSave(scene.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSave(scene.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="w-full px-2 py-1 bg-gray-700 border border-blue-500 rounded text-white text-sm font-medium"
                      />
                    ) : (
                      <div
                        onClick={() => onSceneSelect(scene.id)}
                        className="cursor-pointer group/name"
                      >
                        <div className="text-white font-medium text-sm truncate">
                          {scene.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {index + 1} • {scene.transition}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {scene.active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-xs">✓</span>
                    </motion.div>
                  )}
                </div>

                {/* Expanded Transition Settings */}
                <AnimatePresence>
                  {expandedId === scene.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700 bg-gray-900 px-3 py-3 space-y-3"
                    >
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-2">
                          Transition
                        </label>
                        <select
                          value={scene.transition}
                          onChange={(e) =>
                            onTransitionChange(
                              scene.id,
                              e.target.value,
                              scene.transitionDuration
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                        >
                          <option value="cut">Cut</option>
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-2">
                          Duration: {scene.transitionDuration}ms
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="100"
                          value={scene.transitionDuration}
                          onChange={(e) =>
                            onTransitionChange(
                              scene.id,
                              scene.transition,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover Actions */}
                <div className="absolute right-3 top-3 gap-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setExpandedId(expandedId === scene.id ? null : scene.id)}
                    title="Transition settings"
                    className="p-1.5 hover:bg-gray-700 rounded transition"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v14m7-7H5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRenameStart(scene)}
                    title="Rename scene"
                    className="p-1.5 hover:bg-gray-700 rounded transition"
                  >
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => onSceneDuplicate(scene.id)}
                    title="Duplicate scene"
                    className="p-1.5 hover:bg-gray-700 rounded transition"
                  >
                    <Copy size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => onSceneDelete(scene.id)}
                    title="Delete scene"
                    className="p-1.5 hover:bg-red-900/30 rounded transition"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x }}
            className="bg-gray-800 border border-gray-700 rounded shadow-lg z-50"
            onMouseLeave={() => setContextMenu(null)}
          >
            <button
              onClick={() => {
                onSceneDuplicate(contextMenu.id);
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
            >
              Duplicate
            </button>
            <button
              onClick={() => {
                handleRenameStart(scenes.find((s) => s.id === contextMenu.id)!);
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
            >
              Rename
            </button>
            <button
              onClick={() => {
                onSceneDelete(contextMenu.id);
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
