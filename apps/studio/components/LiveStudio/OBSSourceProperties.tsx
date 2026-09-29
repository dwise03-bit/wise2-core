'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders } from 'lucide-react';

export interface Source {
  id: string;
  name: string;
  type: 'screen' | 'camera' | 'browser' | 'audio' | 'text' | 'image' | 'chat_overlay';
  visible: boolean;
  zIndex: number;
  properties: Record<string, any>;
}

interface OBSSourcePropertiesProps {
  source: Source | null;
  isOpen: boolean;
  onClose: () => void;
  onPropertyChange: (sourceId: string, property: string, value: any) => void;
}

export function OBSSourceProperties({
  source,
  isOpen,
  onClose,
  onPropertyChange,
}: OBSSourcePropertiesProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('position');

  if (!source) return null;

  const handlePropertyChange = (property: string, value: any) => {
    onPropertyChange(source.id, property, value);
  };

  const sections = [
    {
      id: 'position',
      title: 'Position & Size',
      fields: [
        { key: 'x', label: 'X Position', type: 'number', unit: 'px' },
        { key: 'y', label: 'Y Position', type: 'number', unit: 'px' },
        { key: 'width', label: 'Width', type: 'text', placeholder: '1920 or 100%' },
        { key: 'height', label: 'Height', type: 'text', placeholder: '1080 or 100%' },
      ],
    },
    {
      id: 'transform',
      title: 'Transform',
      fields: [
        { key: 'scaleX', label: 'Scale X', type: 'range', min: 0.1, max: 5, step: 0.1 },
        { key: 'scaleY', label: 'Scale Y', type: 'range', min: 0.1, max: 5, step: 0.1 },
        { key: 'rotation', label: 'Rotation', type: 'range', min: 0, max: 360, step: 1, unit: '°' },
        { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 100, step: 1, unit: '%' },
      ],
    },
    {
      id: 'source-specific',
      title: 'Source Settings',
      fields: [], // Dynamically populated below
    },
  ];

  // Populate source-specific fields based on type
  const sourceSpecificSection = sections.find((s) => s.id === 'source-specific');
  if (sourceSpecificSection) {
    sourceSpecificSection.fields = [];
    if (source.type === 'browser') {
      sourceSpecificSection.fields = [
        { key: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
        { key: 'width', label: 'Browser Width', type: 'number', unit: 'px' },
        { key: 'height', label: 'Browser Height', type: 'number', unit: 'px' },
      ] as any;
    } else if (source.type === 'camera') {
      sourceSpecificSection.fields = [
        { key: 'device', label: 'Camera Device', type: 'select' },
        { key: 'resolution', label: 'Resolution', type: 'select' },
      ] as any;
    } else if (source.type === 'audio') {
      sourceSpecificSection.fields = [
        { key: 'device', label: 'Audio Device', type: 'select' },
        { key: 'volume', label: 'Volume', type: 'range', min: 0, max: 100, step: 1, unit: '%' },
        { key: 'monitoringType', label: 'Monitoring', type: 'select' },
      ] as any;
    } else if (source.type === 'text') {
      sourceSpecificSection.fields = [
        { key: 'text', label: 'Text Content', type: 'textarea' },
        { key: 'fontFamily', label: 'Font', type: 'select' },
        { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px' },
        { key: 'color', label: 'Color', type: 'color' },
      ] as any;
    } else if (source.type === 'chat_overlay') {
      sourceSpecificSection.fields = [
        { key: 'position', label: 'Position', type: 'select' },
        { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', min: 10, max: 18 },
        { key: 'backgroundOpacity', label: 'Background Opacity', type: 'range', min: 0, max: 100, step: 5, unit: '%' },
        { key: 'maxMessages', label: 'Max Messages', type: 'number', min: 5, max: 50 },
        { key: 'platforms', label: 'Chat Platforms', type: 'select' },
        { key: 'showAlerts', label: 'Show Alerts', type: 'checkbox' },
        { key: 'filterSpam', label: 'Filter Spam', type: 'checkbox' },
      ] as any;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-gradient-to-b from-gray-950 to-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-blue-400" />
                  Source Properties
                </h2>
                <p className="text-xs text-gray-500 mt-1">{source.name}</p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-gray-800 rounded transition"
              >
                <X size={18} className="text-gray-400" />
              </motion.button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto">
              {sections.map((section) => (
                <div key={section.id} className="border-b border-gray-800">
                  <button
                    onClick={() =>
                      setExpandedSection(expandedSection === section.id ? null : section.id)
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition"
                  >
                    <h3 className="text-xs font-bold text-gray-300 uppercase">
                      {section.title}
                    </h3>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedSection === section.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-800 bg-gray-900/50 px-4 py-3 space-y-4"
                      >
                        {section.fields.map((field) => (
                          <div key={field.key}>
                            <label className="text-xs font-semibold text-gray-400 block mb-2">
                              {field.label}
                              {field.unit && (
                                <span className="text-gray-600 ml-1">{field.unit}</span>
                              )}
                            </label>

                            {field.type === 'number' && (
                              <input
                                type="number"
                                value={source.properties[field.key] || 0}
                                onChange={(e) =>
                                  handlePropertyChange(field.key, parseInt(e.target.value))
                                }
                                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition"
                              />
                            )}

                            {field.type === 'text' && (
                              <input
                                type="text"
                                value={source.properties[field.key] || ''}
                                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition"
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                value={source.properties[field.key] || ''}
                                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                                rows={3}
                                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition resize-none"
                              />
                            )}

                            {field.type === 'range' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  value={source.properties[field.key] || 0}
                                  onChange={(e) =>
                                    handlePropertyChange(field.key, parseFloat(e.target.value))
                                  }
                                  className="flex-1"
                                />
                                <div className="text-xs font-mono bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300 min-w-12 text-center">
                                  {(source.properties[field.key] || 0).toFixed(1)}
                                </div>
                              </div>
                            )}

                            {field.type === 'color' && (
                              <input
                                type="color"
                                value={source.properties[field.key] || '#ffffff'}
                                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                                className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                              />
                            )}

                            {field.type === 'checkbox' && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={source.properties[field.key] || false}
                                  onChange={(e) => handlePropertyChange(field.key, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-300">{field.label}</span>
                              </label>
                            )}

                            {field.type === 'select' && (
                              <select
                                value={source.properties[field.key] || ''}
                                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition"
                              >
                                <option value="">Select {field.label.toLowerCase()}</option>
                                {field.key === 'device' && (
                                  <>
                                    <option value="device1">Device 1</option>
                                    <option value="device2">Device 2</option>
                                  </>
                                )}
                                {field.key === 'resolution' && (
                                  <>
                                    <option value="1920x1080">1920x1080</option>
                                    <option value="1280x720">1280x720</option>
                                    <option value="640x480">640x480</option>
                                  </>
                                )}
                                {field.key === 'fontFamily' && (
                                  <>
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                  </>
                                )}
                                {field.key === 'position' && (
                                  <>
                                    <option value="top-left">Top Left</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="bottom-right">Bottom Right</option>
                                  </>
                                )}
                                {field.key === 'platforms' && (
                                  <>
                                    <option value="twitch">Twitch</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="custom">Custom</option>
                                  </>
                                )}
                                {field.key === 'monitoringType' && (
                                  <>
                                    <option value="none">None</option>
                                    <option value="monitoring">Monitoring Only</option>
                                    <option value="monitorAndOutput">Monitor & Output</option>
                                  </>
                                )}
                              </select>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-gray-800 bg-gray-900 p-4 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition"
              >
                Apply
              </motion.button>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded transition"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
