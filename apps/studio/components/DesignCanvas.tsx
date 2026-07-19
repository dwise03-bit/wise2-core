'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWebDesignBuilder } from '../hooks/useWebDesignBuilder';
import { DesignElement } from '../types/web-design';

/**
 * Visual Design Canvas
 * Drag-drop editing with snap-to-grid and real-time preview
 */
export default function DesignCanvas() {
  const store = useWebDesignBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState(true);
  const gridSize = 8;

  const snapToGrid = useCallback((value: number) => {
    if (!gridSnap) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [gridSnap]);

  const renderElement = (element: DesignElement, depth: number = 0): React.ReactNode => {
    const isSelected = store.selectedElementId === element.id;
    const hasAnimation = !!element.animation;

    return (
      <motion.div
        key={element.id}
        className={`relative cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''
        }`}
        style={{
          ...element.styles,
          display: 'block',
        } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation();
          store.selectElement(element.id);
        }}
        onDragStart={(e) => {
          store.setDragging(true);
        }}
        onDragEnd={(e) => {
          store.setDragging(false);
        }}
        whileHover={{
          boxShadow: isSelected
            ? undefined
            : '0 0 0 2px rgba(59, 130, 246, 0.5)',
        }}
        initial={hasAnimation ? { opacity: 0 } : undefined}
        animate={hasAnimation ? { opacity: 1 } : undefined}
        transition={
          hasAnimation
            ? {
                type: element.animation?.easing || 'ease',
                duration: (element.animation?.duration || 300) / 1000,
                delay: (element.animation?.delay || 0) / 1000,
              }
            : undefined
        }
      >
        {/* Element Content */}
        {element.content && (
          <div className="text-gray-800 break-words">
            {element.content}
          </div>
        )}

        {/* Children */}
        {element.children && element.children.length > 0 && (
          <div className="space-y-2">
            {element.children.map((child) => renderElement(child, depth + 1))}
          </div>
        )}

        {/* Selection Tools */}
        {isSelected && (
          <div className="absolute -top-12 left-0 flex gap-1 bg-blue-600 rounded p-1 shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                store.duplicateElement(element.id);
              }}
              className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                store.copyElement(element.id);
              }}
              className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"
              title="Copy"
            >
              📋
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                store.removeElement(element.id);
              }}
              className="px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800"
              title="Delete"
            >
              ✕
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-850">
      {/* Canvas Toolbar */}
      <div className="flex items-center gap-4 h-12 px-4 bg-gray-800 border-b border-gray-700">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={gridSnap}
            onChange={(e) => setGridSnap(e.target.checked)}
            className="rounded"
          />
          Snap to Grid
        </label>

        <div className="w-px h-6 bg-gray-700" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Zoom:</label>
          <input
            type="range"
            min="50"
            max="200"
            value={store.zoomLevel}
            onChange={(e) => store.setZoomLevel(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-gray-400 w-12">{store.zoomLevel}%</span>
        </div>

        <div className="flex-1" />

        <div className="text-xs text-gray-400">
          {store.project.elements.length} elements • {store.getAllElements().length} total
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 to-gray-800"
        onClick={() => store.selectElement(undefined)}
      >
        <motion.div
          className="inline-block min-w-full min-h-full bg-white shadow-2xl"
          style={{
            scale: store.zoomLevel / 100,
            transformOrigin: 'top left',
            padding: '40px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Canvas Content */}
          <div
            className="relative w-full max-w-4xl mx-auto space-y-4 bg-white"
            style={{
              backgroundImage: gridSnap
                ? `
            linear-gradient(0deg, transparent 24%, rgba(255, 0, 0, .05) 25%, rgba(255, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, .05) 75%, rgba(255, 0, 0, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 0, 0, .05) 25%, rgba(255, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, .05) 75%, rgba(255, 0, 0, .05) 76%, transparent 77%, transparent)
          `
                : 'none',
              backgroundSize: gridSnap ? `${gridSize * 8}px ${gridSize * 8}px` : 'auto',
            }}
          >
            {/* Elements */}
            {store.project.elements.length > 0 ? (
              <div className="space-y-4">
                {store.project.elements.map((element) => renderElement(element))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-center">
                  <span className="text-lg">👈 Drag elements from the library</span>
                  <br />
                  <span className="text-sm">or select a template to get started</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between h-10 px-4 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div>
          {store.selectedElementId && (
            <span>
              Selected:{' '}
              {store.getElementById(store.selectedElementId)?.label ||
                'Unknown Element'}
            </span>
          )}
        </div>
        <div>
          Canvas: {store.project.elements.length} root elements •
          {store.history.length > 0 &&
            ` History: ${store.historyIndex + 1}/${store.history.length}`}
        </div>
      </div>
    </div>
  );
}
