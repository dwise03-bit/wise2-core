'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Monitor,
  Camera,
  Globe,
  Volume2,
  Music,
  Image as ImageIcon,
  Type,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

/**
 * ============================================================================
 * ADD SOURCE MODAL - COMPREHENSIVE SOURCE TYPE SELECTOR
 * ============================================================================
 *
 * Provides:
 * - Display Capture (screen, monitor, window)
 * - Camera (webcam, USB camera)
 * - Audio Input (microphone, audio device)
 * - Browser (web page, HTML)
 * - Media File (video, image, GIF)
 * - Text (static text, timer, dynamic)
 * - Audio File (music, Suno track)
 */

export interface Source {
  id: string;
  name: string;
  type:
    | 'display'
    | 'camera'
    | 'browser'
    | 'audio-input'
    | 'audio-file'
    | 'media-file'
    | 'text'
    | 'image';
  visible: boolean;
  locked: boolean;
  zIndex: number;
  properties: Record<string, any>;
}

export interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: Source) => void;
  existingSourceCount?: number;
}

type SourceTypeId =
  | 'display'
  | 'camera'
  | 'audio-input'
  | 'browser'
  | 'media-file'
  | 'text'
  | 'audio-file';

interface SourceTypeConfig {
  id: SourceTypeId;
  label: string;
  description: string;
  icon: React.ReactNode;
  configFields: {
    label: string;
    key: string;
    type: 'text' | 'select' | 'number' | 'color';
    options?: { label: string; value: string }[];
    defaultValue: string | number;
    placeholder?: string;
    required?: boolean;
  }[];
}

const SOURCE_TYPES: SourceTypeConfig[] = [
  {
    id: 'display',
    label: 'Display Capture',
    description: 'Capture screen, monitor, or window',
    icon: <Monitor size={24} />,
    configFields: [
      {
        label: 'Capture Type',
        key: 'captureType',
        type: 'select',
        options: [
          { label: 'Entire Screen', value: 'screen' },
          { label: 'Specific Monitor', value: 'monitor' },
          { label: 'Application Window', value: 'window' },
        ],
        defaultValue: 'screen',
      },
      {
        label: 'Show Cursor',
        key: 'showCursor',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'true',
      },
    ],
  },
  {
    id: 'camera',
    label: 'Camera/Webcam',
    description: 'Capture from webcam or USB camera',
    icon: <Camera size={24} />,
    configFields: [
      {
        label: 'Device',
        key: 'device',
        type: 'select',
        options: [
          { label: 'Built-in Camera', value: 'builtin' },
          { label: 'USB Camera', value: 'usb' },
        ],
        defaultValue: 'builtin',
        required: true,
      },
      {
        label: 'Resolution',
        key: 'resolution',
        type: 'select',
        options: [
          { label: '1920x1080 (1080p)', value: '1920x1080' },
          { label: '1280x720 (720p)', value: '1280x720' },
          { label: '640x480 (VGA)', value: '640x480' },
        ],
        defaultValue: '1280x720',
      },
      {
        label: 'Frame Rate (fps)',
        key: 'frameRate',
        type: 'select',
        options: [
          { label: '30 FPS', value: '30' },
          { label: '60 FPS', value: '60' },
        ],
        defaultValue: '30',
      },
    ],
  },
  {
    id: 'audio-input',
    label: 'Audio Input',
    description: 'Microphone or audio device',
    icon: <Volume2 size={24} />,
    configFields: [
      {
        label: 'Device',
        key: 'device',
        type: 'select',
        options: [
          { label: 'Built-in Microphone', value: 'builtin' },
          { label: 'USB Microphone', value: 'usb' },
          { label: 'Line In', value: 'linein' },
        ],
        defaultValue: 'builtin',
        required: true,
      },
      {
        label: 'Volume (%)',
        key: 'volume',
        type: 'number',
        defaultValue: 100,
      },
      {
        label: 'Mute on Start',
        key: 'muteOnStart',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'browser',
    label: 'Browser Source',
    description: 'Web page, HTML, or widget',
    icon: <Globe size={24} />,
    configFields: [
      {
        label: 'URL',
        key: 'url',
        type: 'text',
        placeholder: 'https://example.com',
        defaultValue: '',
        required: true,
      },
      {
        label: 'Width (px)',
        key: 'width',
        type: 'number',
        defaultValue: 1280,
      },
      {
        label: 'Height (px)',
        key: 'height',
        type: 'number',
        defaultValue: 720,
      },
      {
        label: 'Refresh on Focus',
        key: 'refreshOnFocus',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'true',
      },
    ],
  },
  {
    id: 'media-file',
    label: 'Media File',
    description: 'Video, image, or GIF file',
    icon: <ImageIcon size={24} />,
    configFields: [
      {
        label: 'File Type',
        key: 'fileType',
        type: 'select',
        options: [
          { label: 'Video (.mp4, .mov)', value: 'video' },
          { label: 'Image (.png, .jpg)', value: 'image' },
          { label: 'GIF (.gif)', value: 'gif' },
        ],
        defaultValue: 'video',
      },
      {
        label: 'Loop',
        key: 'loop',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'true',
      },
      {
        label: 'Playback Speed',
        key: 'playbackSpeed',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  {
    id: 'text',
    label: 'Text Source',
    description: 'Static text, timer, or dynamic content',
    icon: <Type size={24} />,
    configFields: [
      {
        label: 'Text',
        key: 'text',
        type: 'text',
        placeholder: 'Enter text content',
        defaultValue: 'Text Source',
      },
      {
        label: 'Font Size (px)',
        key: 'fontSize',
        type: 'number',
        defaultValue: 24,
      },
      {
        label: 'Text Color',
        key: 'fontColor',
        type: 'color',
        defaultValue: '#FFFFFF',
      },
      {
        label: 'Font Family',
        key: 'fontFamily',
        type: 'select',
        options: [
          { label: 'Arial', value: 'Arial' },
          { label: 'Helvetica', value: 'Helvetica' },
          { label: 'Times New Roman', value: 'Times New Roman' },
          { label: 'Courier', value: 'Courier' },
        ],
        defaultValue: 'Arial',
      },
    ],
  },
  {
    id: 'audio-file',
    label: 'Audio File',
    description: 'Music, Suno track, or audio file',
    icon: <Music size={24} />,
    configFields: [
      {
        label: 'Audio Source',
        key: 'audioSource',
        type: 'select',
        options: [
          { label: 'Local File', value: 'local' },
          { label: 'Suno Track', value: 'suno' },
          { label: 'URL Stream', value: 'stream' },
        ],
        defaultValue: 'local',
      },
      {
        label: 'Volume (%)',
        key: 'volume',
        type: 'number',
        defaultValue: 100,
      },
      {
        label: 'Loop',
        key: 'loop',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'true',
      },
    ],
  },
];

export function AddSourceModal({
  isOpen,
  onClose,
  onAdd,
  existingSourceCount = 0,
}: AddSourceModalProps) {
  const [selectedType, setSelectedType] = useState<SourceTypeId | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});

  const sourceTypeConfig = useMemo(
    () => SOURCE_TYPES.find((t) => t.id === selectedType),
    [selectedType]
  );

  const handleSelectSourceType = (typeId: SourceTypeId) => {
    setSelectedType(typeId);
    // Initialize config with defaults
    const defaultConfig: Record<string, any> = {};
    const typeConfig = SOURCE_TYPES.find((t) => t.id === typeId);
    if (typeConfig) {
      typeConfig.configFields.forEach((field) => {
        defaultConfig[field.key] = field.defaultValue;
      });
    }
    setConfig(defaultConfig);
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddSource = () => {
    if (!sourceTypeConfig) return;

    // Validate required fields
    const hasRequiredFields = sourceTypeConfig.configFields
      .filter((f) => f.required)
      .every((f) => config[f.key]);

    if (!hasRequiredFields) {
      alert('Please fill in all required fields');
      return;
    }

    const newSource: Source = {
      id: `source-${Date.now()}`,
      name: `${sourceTypeConfig.label} ${existingSourceCount + 1}`,
      type: selectedType as any,
      visible: true,
      locked: false,
      zIndex: existingSourceCount,
      properties: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        rotation: 0,
        opacity: 100,
        scaleX: 1,
        scaleY: 1,
        ...config,
      },
    };

    onAdd(newSource);
    setSelectedType(null);
    setConfig({});
    onClose();
  };

  if (!isOpen) return null;

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
        className="bg-wise-surface-secondary border border-wise-medium rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-wise-medium p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                className="p-1 hover:bg-wise-medium rounded transition text-wise-text-muted hover:text-wise-text-primary"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-wise-text-primary">
              {selectedType ? 'Configure Source' : 'Add Source'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-wise-medium rounded transition text-wise-text-muted hover:text-wise-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!selectedType ? (
              // Source Type Selector Grid
              <motion.div
                key="types"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                {SOURCE_TYPES.map((sourceType) => (
                  <button
                    key={sourceType.id}
                    onClick={() => handleSelectSourceType(sourceType.id)}
                    className="p-4 rounded-lg border border-wise-medium hover:border-wise-accent hover:bg-wise-accent/5 transition text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-wise-accent group-hover:text-wise-accent-bright transition">
                        {sourceType.icon}
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-wise-text-muted group-hover:text-wise-text-primary transition"
                      />
                    </div>
                    <h3 className="font-semibold text-wise-text-primary text-sm">
                      {sourceType.label}
                    </h3>
                    <p className="text-xs text-wise-text-muted mt-1">
                      {sourceType.description}
                    </p>
                  </button>
                ))}
              </motion.div>
            ) : (
              // Configuration Form
              <motion.div
                key="config"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {sourceTypeConfig?.configFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-wise-text-primary mb-2">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={config[field.key] || ''}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-studio-input border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted focus:border-wise-accent focus:outline-none transition"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={config[field.key] || field.defaultValue}
                        onChange={(e) =>
                          handleConfigChange(field.key, parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-studio-input border border-wise-medium rounded text-wise-text-primary focus:border-wise-accent focus:outline-none transition"
                      />
                    )}

                    {field.type === 'color' && (
                      <input
                        type="color"
                        value={config[field.key] || field.defaultValue}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        className="w-full h-10 bg-studio-input border border-wise-medium rounded cursor-pointer"
                      />
                    )}

                    {field.type === 'select' && field.options && (
                      <select
                        value={config[field.key] || field.defaultValue}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-studio-input border border-wise-medium rounded text-wise-text-primary focus:border-wise-accent focus:outline-none transition"
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-wise-medium p-4 flex gap-3 justify-end bg-wise-surface-primary/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-wise-text-secondary hover:bg-wise-medium rounded transition"
          >
            Cancel
          </button>
          {selectedType && (
            <button
              onClick={handleAddSource}
              className="px-4 py-2 bg-wise-accent text-black font-semibold rounded disabled:opacity-50 hover:bg-wise-accent-bright transition"
            >
              Add Source
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AddSourceModal;
