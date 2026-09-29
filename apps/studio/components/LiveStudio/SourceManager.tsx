'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Monitor,
  Camera,
  Globe,
  Volume2,
  Lock,
  Unlock,
  Copy,
  Edit2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Image as ImageIcon,
  Type,
  Volume,
} from 'lucide-react';

export interface Source {
  id: string;
  name: string;
  type: 'display' | 'camera' | 'browser' | 'audio-input' | 'audio-file' | 'media-file' | 'text' | 'image';
  visible: boolean;
  locked: boolean;
  zIndex: number;
  properties: {
    // Position & Size
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    opacity?: number;

    // Crop
    cropLeft?: number;
    cropTop?: number;
    cropRight?: number;
    cropBottom?: number;

    // Rendering
    scaleFilter?: 'bilinear' | 'lanczos' | 'nearest';
    blendMode?: 'normal' | 'add' | 'subtract' | 'screen' | 'multiply';
    boundsMode?: 'none' | 'scale_to_size' | 'stretch_to_size';

    // Type-specific
    device?: string;
    url?: string;
    volume?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    filePath?: string;

    // Lock aspect ratio
    lockAspectRatio?: boolean;
  };
}

export interface SourceManagerProps {
  sources: Source[];
  selectedSourceId: string | null;
  onSourcesChange: (sources: Source[]) => void;
  onSourceSelect: (id: string | null) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

type SourceType = Source['type'];

const SOURCE_TYPE_ICONS: Record<SourceType, React.ReactNode> = {
  display: <Monitor size={16} />,
  camera: <Camera size={16} />,
  browser: <Globe size={16} />,
  'audio-input': <Volume2 size={16} />,
  'audio-file': <Volume size={16} />,
  'media-file': (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  ),
  text: <Type size={16} />,
  image: <ImageIcon size={16} />,
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  display: 'Display Capture',
  camera: 'Camera/Webcam',
  browser: 'Browser Source',
  'audio-input': 'Audio Input',
  'audio-file': 'Audio File',
  'media-file': 'Media File',
  text: 'Text',
  image: 'Image',
};

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: Source) => void;
  existingSourceCount: number;
}

function AddSourceModal({ isOpen, onClose, onAdd, existingSourceCount }: AddSourceModalProps) {
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);
  const [sourceData, setSourceData] = useState<Record<string, any>>({});

  const handleAdd = () => {
    if (!selectedType) return;

    const newSource: Source = {
      id: `source-${Date.now()}`,
      name: sourceData.name || `${SOURCE_TYPE_LABELS[selectedType]} ${existingSourceCount + 1}`,
      type: selectedType,
      visible: true,
      locked: false,
      zIndex: existingSourceCount + 1,
      properties: {
        x: sourceData.x || 0,
        y: sourceData.y || 0,
        width: sourceData.width || 1280,
        height: sourceData.height || 720,
        opacity: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        scaleFilter: 'lanczos',
        blendMode: 'normal',
        boundsMode: 'none',
        lockAspectRatio: true,
        ...(selectedType === 'camera' && { device: sourceData.device || 'Default Camera' }),
        ...(selectedType === 'browser' && { url: sourceData.url || 'https://example.com' }),
        ...(selectedType === 'audio-input' && { device: sourceData.device || 'Default Microphone', volume: 100 }),
        ...(selectedType === 'audio-file' && { filePath: sourceData.filePath || '', volume: 100 }),
        ...(selectedType === 'text' && {
          text: sourceData.text || 'Text',
          fontSize: sourceData.fontSize || 24,
          fontFamily: sourceData.fontFamily || 'Arial',
          fontColor: sourceData.fontColor || '#FFFFFF',
        }),
        ...(selectedType === 'display' && { device: sourceData.device || 'Primary Display' }),
      },
    };

    onAdd(newSource);
    setSelectedType(null);
    setSourceData({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Source</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {!selectedType ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">Select a source type:</p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  'display',
                  'camera',
                  'audio-input',
                  'browser',
                  'media-file',
                  'text',
                  'audio-file',
                  'image',
                ] as SourceType[]
              ).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition flex flex-col items-center gap-2"
                >
                  <div className="text-blue-400">{SOURCE_TYPE_ICONS[type]}</div>
                  <span className="text-sm font-medium text-white">{SOURCE_TYPE_LABELS[type]}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-blue-400 hover:text-blue-300 mb-4"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Source Name</label>
              <input
                type="text"
                placeholder={SOURCE_TYPE_LABELS[selectedType]}
                value={sourceData.name || ''}
                onChange={(e) => setSourceData({ ...sourceData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {selectedType === 'display' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Monitor/Window</label>
                <select
                  value={sourceData.device || ''}
                  onChange={(e) => setSourceData({ ...sourceData, device: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select display...</option>
                  <option value="Primary Display">Primary Display</option>
                  <option value="Secondary Display">Secondary Display</option>
                  <option value="Active Window">Active Window</option>
                </select>
              </div>
            )}

            {selectedType === 'camera' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Camera Device</label>
                <select
                  value={sourceData.device || ''}
                  onChange={(e) => setSourceData({ ...sourceData, device: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select camera...</option>
                  <option value="Default Camera">Default Camera (Built-in)</option>
                  <option value="USB Camera 1">USB Camera 1</option>
                  <option value="USB Camera 2">USB Camera 2</option>
                </select>
              </div>
            )}

            {selectedType === 'audio-input' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Audio Device</label>
                <select
                  value={sourceData.device || ''}
                  onChange={(e) => setSourceData({ ...sourceData, device: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select device...</option>
                  <option value="Default Microphone">Default Microphone</option>
                  <option value="System Audio">System Audio</option>
                  <option value="USB Microphone">USB Microphone</option>
                </select>
              </div>
            )}

            {selectedType === 'browser' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={sourceData.url || ''}
                  onChange={(e) => setSourceData({ ...sourceData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {selectedType === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Text</label>
                  <textarea
                    placeholder="Enter text..."
                    value={sourceData.text || ''}
                    onChange={(e) => setSourceData({ ...sourceData, text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="128"
                      value={sourceData.fontSize || 24}
                      onChange={(e) => setSourceData({ ...sourceData, fontSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Font Color</label>
                    <input
                      type="color"
                      value={sourceData.fontColor || '#FFFFFF'}
                      onChange={(e) => setSourceData({ ...sourceData, fontColor: e.target.value })}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Add Source
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface ContextMenuProps {
  source: Source;
  x: number;
  y: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onReset: () => void;
  onClose: () => void;
}

function ContextMenu({ source, x, y, onEdit, onDuplicate, onDelete, onRename, onReset, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition"
      >
        <Edit2 size={14} />
        Edit Properties
      </button>
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition"
      >
        <Type size={14} />
        Rename
      </button>
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition"
      >
        <Copy size={14} />
        Duplicate
      </button>
      <button
        onClick={() => {
          onReset();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition"
      >
        <RotateCcw size={14} />
        Reset Transform
      </button>
      <div className="border-t border-gray-700 my-1"></div>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 flex items-center gap-2 transition"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </motion.div>
  );
}

interface SourcePropertiesPanelProps {
  source: Source | null;
  isOpen: boolean;
  onClose: () => void;
  onChange: (source: Source) => void;
}

function SourcePropertiesPanel({ source, isOpen, onClose, onChange }: SourcePropertiesPanelProps) {
  if (!source) return null;

  const handlePropertyChange = (key: string, value: any) => {
    onChange({
      ...source,
      properties: {
        ...source.properties,
        [key]: value,
      },
    });
  };

  const handleReset = () => {
    onChange({
      ...source,
      properties: {
        ...source.properties,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        scaleX: 1,
        scaleY: 1,
      },
    });
  };

  return (
    <motion.div
      initial={isOpen ? { height: 0, opacity: 0 } : {}}
      animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-800 bg-gray-900/50 overflow-hidden"
    >
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm">Properties: {source.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            <ChevronUp size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Position */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">X (px)</label>
              <input
                type="number"
                value={source.properties.x || 0}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Y (px)</label>
              <input
                type="number"
                value={source.properties.y || 0}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Size</h4>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={source.properties.lockAspectRatio !== false}
                onChange={(e) => handlePropertyChange('lockAspectRatio', e.target.checked)}
              />
              Lock aspect ratio
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
              <input
                type="number"
                value={source.properties.width || 0}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
              <input
                type="number"
                value={source.properties.height || 0}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Appearance</h4>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Rotation</label>
                <span className="text-xs text-gray-400">{source.properties.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={source.properties.rotation || 0}
                onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Opacity</label>
                <span className="text-xs text-gray-400">{source.properties.opacity || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={source.properties.opacity || 100}
                onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Crop */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Crop</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Left</label>
              <input
                type="number"
                value={source.properties.cropLeft || 0}
                onChange={(e) => handlePropertyChange('cropLeft', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Top</label>
              <input
                type="number"
                value={source.properties.cropTop || 0}
                onChange={(e) => handlePropertyChange('cropTop', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Right</label>
              <input
                type="number"
                value={source.properties.cropRight || 0}
                onChange={(e) => handlePropertyChange('cropRight', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bottom</label>
              <input
                type="number"
                value={source.properties.cropBottom || 0}
                onChange={(e) => handlePropertyChange('cropBottom', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rendering Options */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Rendering</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Scale Filter</label>
              <select
                value={source.properties.scaleFilter || 'lanczos'}
                onChange={(e) => handlePropertyChange('scaleFilter', e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="bilinear">Bilinear</option>
                <option value="lanczos">Lanczos</option>
                <option value="nearest">Nearest</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Blend Mode</label>
              <select
                value={source.properties.blendMode || 'normal'}
                onChange={(e) => handlePropertyChange('blendMode', e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
                <option value="screen">Screen</option>
                <option value="multiply">Multiply</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bounds Mode</label>
              <select
                value={source.properties.boundsMode || 'none'}
                onChange={(e) => handlePropertyChange('boundsMode', e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="scale_to_size">Scale to Size</option>
                <option value="stretch_to_size">Stretch to Size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Volume (if audio source) */}
        {(source.type === 'audio-input' || source.type === 'audio-file') && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Volume</label>
              <span className="text-xs text-gray-400">{source.properties.volume || 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={source.properties.volume || 0}
              onChange={(e) => handlePropertyChange('volume', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-800">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SourceManager({
  sources,
  selectedSourceId,
  onSourcesChange,
  onSourceSelect,
  canvasWidth = 1920,
  canvasHeight = 1080,
}: SourceManagerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuSource, setContextMenuSource] = useState<Source | null>(null);
  const [renameSourceId, setRenameSourceId] = useState<string | null>(null);
  const [renamingText, setRenamingText] = useState('');
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);

  const selectedSource = useMemo(
    () => sources.find((s) => s.id === selectedSourceId),
    [sources, selectedSourceId]
  );

  const handleAddSource = (source: Source) => {
    onSourcesChange([...sources, source]);
    onSourceSelect(source.id);
  };

  const handleDeleteSource = (id: string) => {
    const newSources = sources.filter((s) => s.id !== id);
    onSourcesChange(newSources);
    if (selectedSourceId === id) {
      onSourceSelect(null);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const newSources = sources.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    onSourcesChange(newSources);
  };

  const handleToggleLock = (id: string) => {
    const newSources = sources.map((s) =>
      s.id === id ? { ...s, locked: !s.locked } : s
    );
    onSourcesChange(newSources);
  };

  const handleDragStart = (id: string) => {
    if (!sources.find((s) => s.id === id)?.locked) {
      setDraggedId(id);
    }
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

    onSourcesChange(newSources);
    setDraggedId(null);
  };

  const handleDuplicateSource = (source: Source) => {
    const newSource: Source = {
      ...source,
      id: `source-${Date.now()}`,
      name: `${source.name} (copy)`,
      zIndex: sources.length + 1,
    };
    onSourcesChange([...sources, newSource]);
    onSourceSelect(newSource.id);
  };

  const handleResetTransform = (id: string) => {
    const newSources = sources.map((s) =>
      s.id === id
        ? {
            ...s,
            properties: {
              ...s.properties,
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 100,
              scaleX: 1,
              scaleY: 1,
            },
          }
        : s
    );
    onSourcesChange(newSources);
  };

  const handleRenameSource = (id: string, newName: string) => {
    const newSources = sources.map((s) =>
      s.id === id ? { ...s, name: newName } : s
    );
    onSourcesChange(newSources);
    setRenameSourceId(null);
  };

  const handleUpdateSource = (source: Source) => {
    const newSources = sources.map((s) => (s.id === source.id ? source : s));
    onSourcesChange(newSources);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          SOURCES
        </h2>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition"
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
                draggable={!source.locked}
                onDragStart={() => handleDragStart(source.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(source.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuSource(source);
                  setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                className={`group relative border-r-4 transition-all ${
                  selectedSourceId === source.id
                    ? 'border-r-blue-500 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg shadow-blue-500/20'
                    : 'border-r-transparent hover:bg-gray-800/50'
                } ${!source.locked && 'cursor-move'} ${draggedId === source.id ? 'opacity-50' : ''}`}
              >
                <div className="px-3 py-3 flex items-center gap-2">
                  {/* Drag Handle */}
                  {!source.locked && (
                    <GripVertical size={14} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                  )}

                  {/* Source Icon */}
                  <div className="text-gray-500 flex-shrink-0">{SOURCE_TYPE_ICONS[source.type]}</div>

                  {/* Source Name */}
                  {renameSourceId === source.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={renamingText}
                      onChange={(e) => setRenamingText(e.target.value)}
                      onBlur={() => handleRenameSource(source.id, renamingText)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSource(source.id, renamingText);
                        if (e.key === 'Escape') setRenameSourceId(null);
                      }}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-blue-500 rounded text-white text-sm focus:outline-none"
                    />
                  ) : (
                    <div
                      onClick={() => onSourceSelect(source.id)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="text-white font-medium text-sm truncate">{source.name}</div>
                      <div className="text-xs text-gray-500">
                        {source.type} • z:{source.zIndex}
                      </div>
                    </div>
                  )}

                  {/* Visibility Toggle */}
                  <motion.button
                    onClick={() => handleToggleVisibility(source.id)}
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

                  {/* Lock Toggle */}
                  <motion.button
                    onClick={() => handleToggleLock(source.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 hover:bg-gray-700 rounded transition flex-shrink-0"
                    title={source.locked ? 'Unlock source' : 'Lock source'}
                  >
                    {source.locked ? (
                      <Lock size={16} className="text-yellow-400" />
                    ) : (
                      <Unlock size={16} className="text-gray-600" />
                    )}
                  </motion.button>

                  {/* Volume Slider (audio sources only) */}
                  {(source.type === 'audio-input' || source.type === 'audio-file') && (
                    <div className="flex-shrink-0 w-24">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={source.properties.volume || 0}
                        onChange={(e) =>
                          handleUpdateSource({
                            ...source,
                            properties: {
                              ...source.properties,
                              volume: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                        title={`Volume: ${source.properties.volume}%`}
                      />
                    </div>
                  )}

                  {/* Delete Button */}
                  <motion.button
                    onClick={() => handleDeleteSource(source.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 hover:bg-red-900/30 rounded transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Delete source"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Properties Panel */}
      {selectedSource && (
        <SourcePropertiesPanel
          source={selectedSource}
          isOpen={propertiesPanelOpen}
          onClose={() => setPropertiesPanelOpen(false)}
          onChange={handleUpdateSource}
        />
      )}

      {/* Expand Properties Button */}
      {selectedSource && !propertiesPanelOpen && (
        <button
          onClick={() => setPropertiesPanelOpen(true)}
          className="border-t border-gray-800 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <ChevronDown size={16} />
          Show Properties
        </button>
      )}

      {/* Z-Order Info */}
      {sources.length > 0 && (
        <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Drag to reorder • Right-click for options</span>
            <span className="text-gray-600">{sources.length} sources</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSource}
        existingSourceCount={sources.length}
      />

      {contextMenu && contextMenuSource && (
        <ContextMenu
          source={contextMenuSource}
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => setPropertiesPanelOpen(true)}
          onDuplicate={() => handleDuplicateSource(contextMenuSource!)}
          onDelete={() => handleDeleteSource(contextMenuSource!.id)}
          onRename={() => {
            setRenameSourceId(contextMenuSource!.id);
            setRenamingText(contextMenuSource!.name);
          }}
          onReset={() => handleResetTransform(contextMenuSource!.id)}
          onClose={() => {
            setContextMenu(null);
            setContextMenuSource(null);
          }}
        />
      )}
    </div>
  );
}

export default SourceManager;
