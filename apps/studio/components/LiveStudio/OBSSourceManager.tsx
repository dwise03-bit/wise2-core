'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Grip, Monitor, Camera, Globe, Volume2 } from 'lucide-react';

export interface Source {
  id: string;
  name: string;
  type: 'screen' | 'camera' | 'browser' | 'audio' | 'text' | 'image' | 'chat_overlay';
  visible: boolean;
  zIndex: number;
  properties: Record<string, any>;
}

interface OBSSourceManagerProps {
  sources: Source[];
  selectedSourceId: string | null;
  onSourceAdd: () => void;
  onSourceDelete: (id: string) => void;
  onSourceToggleVisibility: (id: string) => void;
  onSourceSelect: (id: string) => void;
  onSourceReorder: (sources: Source[]) => void;
}

const sourceTypeIcons: Record<Source['type'], React.ReactNode> = {
  screen: <Monitor size={16} />,
  camera: <Camera size={16} />,
  browser: <Globe size={16} />,
  audio: <Volume2 size={16} />,
  text: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <text x="2" y="18">
        A
      </text>
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  ),
  chat_overlay: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
    </svg>
  ),
};

export function OBSSourceManager({
  sources,
  selectedSourceId,
  onSourceAdd,
  onSourceDelete,
  onSourceToggleVisibility,
  onSourceSelect,
  onSourceReorder,
}: OBSSourceManagerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sources.findIndex((s) => s.id === draggedId);
    const targetIndex = sources.findIndex((s) => s.id === targetId);

    const newSources = [...sources];
    const [draggedSource] = newSources.splice(draggedIndex, 1);
    newSources.splice(targetIndex, 0, draggedSource);

    // Update z-index
    newSources.forEach((s, i) => {
      s.zIndex = newSources.length - i;
    });

    onSourceReorder(newSources);
    setDraggedId(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          SOURCES
        </h2>
        <motion.button
          onClick={onSourceAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
        >
          <Plus size={16} />
          Add Source
        </motion.button>
      </div>

      {/* Source List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sources.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No sources. Click "Add Source" to begin.
            </div>
          ) : (
            sources.map((source) => (
              <motion.div
                key={source.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                draggable
                onDragStart={() => handleDragStart(source.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(source.id)}
                className={`group relative border-r-4 transition-all ${
                  selectedSourceId === source.id
                    ? 'border-r-green-500 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg shadow-green-500/20'
                    : 'border-r-transparent hover:bg-gray-800/50 cursor-move'
                } ${draggedId === source.id ? 'opacity-50' : ''}`}
              >
                <div className="px-3 py-3 flex items-center gap-2">
                  {/* Drag Handle */}
                  <Grip
                    size={14}
                    className="text-gray-600 group-hover:text-gray-400 flex-shrink-0"
                  />

                  {/* Source Icon */}
                  <div className="text-gray-500 flex-shrink-0">
                    {sourceTypeIcons[source.type]}
                  </div>

                  {/* Source Name */}
                  <div
                    onClick={() => onSourceSelect(source.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="text-white font-medium text-sm truncate">
                      {source.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {source.type} • z:{source.zIndex}
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <motion.button
                    onClick={() => onSourceToggleVisibility(source.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 hover:bg-gray-700 rounded transition flex-shrink-0"
                    title={source.visible ? 'Hide source' : 'Show source'}
                  >
                    {source.visible ? (
                      <Eye size={16} className="text-gray-400" />
                    ) : (
                      <EyeOff size={16} className="text-gray-600" />
                    )}
                  </motion.button>

                  {/* Delete Button */}
                  <motion.button
                    onClick={() => onSourceDelete(source.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 hover:bg-red-900/30 rounded transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Delete source"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </motion.button>
                </div>

                {/* Source Properties Preview */}
                {selectedSourceId === source.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-400"
                  >
                    <div className="space-y-1">
                      {source.type === 'camera' && source.properties.device && (
                        <div>Device: {source.properties.device}</div>
                      )}
                      {source.type === 'browser' && source.properties.url && (
                        <div className="truncate">URL: {source.properties.url}</div>
                      )}
                      {source.type === 'screen' && source.properties.display && (
                        <div>Display: {source.properties.display}</div>
                      )}
                      {source.type === 'audio' && source.properties.device && (
                        <div>Audio: {source.properties.device}</div>
                      )}
                      <div>Position: {source.properties.x || 0}, {source.properties.y || 0}</div>
                      <div>
                        Size: {source.properties.width || '100%'} x{' '}
                        {source.properties.height || '100%'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Z-Order Info */}
      {sources.length > 0 && (
        <div className="border-t border-gray-800 bg-gray-900/50 p-3 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Z-Order: Drag to reorder</span>
            <span className="text-gray-600">{sources.length} sources</span>
          </div>
        </div>
      )}
    </div>
  );
}
