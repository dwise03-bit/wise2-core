'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_CONFIG } from './constants';
import type { CanvasState } from './types';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  thumbnail?: string;
  createdAt: Date;
}

interface HistoryEntry {
  id: string;
  action: string;
  timestamp: Date;
}

interface CanvasProps {
  assets?: Asset[];
  history?: HistoryEntry[];
  onAssetDrop?: (asset: Asset, x: number, y: number) => void;
  onExport?: (format: string) => void;
}

const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Hero Background', type: 'image', createdAt: new Date() },
  { id: '2', name: 'Intro Video', type: 'video', createdAt: new Date() },
  { id: '3', name: 'Ambient Track', type: 'audio', createdAt: new Date() },
  { id: '4', name: 'Brand Guidelines', type: 'document', createdAt: new Date() },
];

const MOCK_HISTORY: HistoryEntry[] = [
  { id: 'h1', action: 'Added text layer', timestamp: new Date(Date.now() - 60000) },
  { id: 'h2', action: 'Adjusted brightness', timestamp: new Date(Date.now() - 120000) },
  { id: 'h3', action: 'Imported asset', timestamp: new Date(Date.now() - 180000) },
];

export default function Canvas({
  assets = MOCK_ASSETS,
  history = MOCK_HISTORY,
  onAssetDrop,
  onExport,
}: CanvasProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 100,
    panX: 0,
    panY: 0,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'history' | 'export'>(
    'assets'
  );
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const assetId = e.dataTransfer.getData('assetId');
      const asset = assets.find((a) => a.id === assetId);

      if (asset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onAssetDrop?.(asset, x, y);
      }
    },
    [assets, onAssetDrop]
  );

  const handleAssetDragStart = (e: React.DragEvent, assetId: string) => {
    e.dataTransfer.setData('assetId', assetId);
  };

  const zoomIn = () =>
    setCanvasState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 10, 200) }));
  const zoomOut = () =>
    setCanvasState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 10, 25) }));
  const resetZoom = () =>
    setCanvasState((prev) => ({ ...prev, zoom: 100, panX: 0, panY: 0 }));

  return (
    <div className="flex-1 flex flex-col bg-wise-bg overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="h-12 px-4 border-b border-wise-surface-2 flex items-center justify-between bg-wise-surface/50">
        <div className="flex items-center space-x-1">
          {(['assets', 'history', 'export'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-wise-primary/20 text-wise-primary'
                  : 'text-wise-text-secondary hover:text-wise-text-primary hover:bg-wise-surface-2'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={zoomOut}
            className="w-7 h-7 rounded-md bg-wise-surface-2 hover:bg-wise-surface flex items-center justify-center text-wise-text-secondary hover:text-wise-text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            −
          </motion.button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs text-wise-text-secondary hover:text-wise-text-primary transition-colors min-w-[3rem] text-center"
          >
            {canvasState.zoom}%
          </button>
          <motion.button
            onClick={zoomIn}
            className="w-7 h-7 rounded-md bg-wise-surface-2 hover:bg-wise-surface flex items-center justify-center text-wise-text-secondary hover:text-wise-text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            +
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sub-panel: Assets/History/Export */}
        <div className="w-64 border-r border-wise-surface-2 bg-wise-surface/30 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ANIMATION_CONFIG.EASE_FAST}
                className="p-3 space-y-2"
              >
                <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider px-1 mb-2">
                  Assets ({assets.length})
                </p>
                {assets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    draggable
                    onDragStart={(e) =>
                      handleAssetDragStart(
                        e as unknown as React.DragEvent,
                        asset.id
                      )
                    }
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`p-2.5 rounded-lg cursor-grab active:cursor-grabbing border transition-all ${
                      selectedAsset === asset.id
                        ? 'border-wise-primary bg-wise-primary/10'
                        : 'border-wise-surface-2 bg-wise-card hover:border-wise-primary/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {asset.type === 'image'
                          ? '🖼️'
                          : asset.type === 'video'
                          ? '🎬'
                          : asset.type === 'audio'
                          ? '🎵'
                          : '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-wise-text-primary truncate">
                          {asset.name}
                        </p>
                        <p className="text-[10px] text-wise-text-muted capitalize">
                          {asset.type}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ANIMATION_CONFIG.EASE_FAST}
                className="p-3 space-y-2"
              >
                <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider px-1 mb-2">
                  Version History
                </p>
                {history.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-wise-card border border-wise-surface-2 hover:border-wise-primary/40 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-wise-electric mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-wise-text-primary">
                          {entry.action}
                        </p>
                        <p className="text-[10px] text-wise-text-muted">
                          {formatTimeAgo(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ANIMATION_CONFIG.EASE_FAST}
                className="p-3 space-y-3"
              >
                <p className="text-xs font-semibold text-wise-text-muted uppercase tracking-wider px-1 mb-2">
                  Export Options
                </p>
                {['PNG', 'SVG', 'PDF', 'MP4', 'JSON'].map((format) => (
                  <motion.button
                    key={format}
                    onClick={() => onExport?.(format)}
                    className="w-full p-2.5 rounded-lg bg-wise-card border border-wise-surface-2 hover:border-wise-primary/40 text-sm text-wise-text-primary transition-colors flex items-center justify-between"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Export as {format}</span>
                    <span className="text-wise-text-muted">→</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Canvas Area */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 relative overflow-auto transition-colors ${
            isDragOver ? 'bg-wise-primary/5' : ''
          }`}
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 85, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 85, 255, 0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundColor: '#050505',
          }}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: canvasState.zoom / 100,
            }}
            transition={ANIMATION_CONFIG.EASE_SMOOTH}
          >
            <div
              className="w-[640px] h-[400px] bg-wise-card border-2 border-wise-surface-2 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                boxShadow: isDragOver
                  ? '0 0 60px rgba(0, 85, 255, 0.4)'
                  : '0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              <AnimatePresence>
                {isDragOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 border-2 border-dashed border-wise-electric bg-wise-electric/5 flex items-center justify-center z-10"
                  >
                    <p className="text-wise-electric font-medium">
                      Drop asset here
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center text-wise-text-muted">
                <p className="text-4xl mb-2">🎨</p>
                <p className="text-sm">Canvas Workspace</p>
                <p className="text-xs mt-1">Drag assets here to begin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
