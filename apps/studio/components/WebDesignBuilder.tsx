'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebDesignBuilder } from '../hooks/useWebDesignBuilder';
import DesignCanvas from './DesignCanvas';
import StylePanel from './StylePanel';
import ComponentLibrary from './ComponentLibrary';
import TemplateSelector from './TemplateSelector';
import PreviewPane from './PreviewPane';
import { DesignElement } from '../types/web-design';

interface WebDesignBuilderProps {
  initialProjectId?: string;
  onSave?: (projectId: string) => void;
  showTemplates?: boolean;
}

/**
 * Main Web Design Builder Interface
 * 5-area layout: Library | Canvas | Style Panel | Preview | Templates
 */
export default function WebDesignBuilder({
  initialProjectId,
  onSave,
  showTemplates = true,
}: WebDesignBuilderProps) {
  const store = useWebDesignBuilder();
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(showTemplates && !initialProjectId);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize project
  useEffect(() => {
    if (initialProjectId) {
      const loaded = store.loadFromLocalStorage(initialProjectId);
      if (!loaded) {
        store.createProject(`Project ${initialProjectId.slice(0, 8)}`);
      }
    } else {
      store.createProject('New Design');
    }
  }, [initialProjectId, store]);

  // Auto-save to localStorage
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      setSaveStatus('saving');
      store.saveToLocalStorage();
      setSaveStatus('saved');

      const resetTimer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

      return () => clearTimeout(resetTimer);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [store]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl/Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && store.selectedElementId) {
        e.preventDefault();
        store.copyElement(store.selectedElementId);
      }

      // Ctrl/Cmd + X: Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && store.selectedElementId) {
        e.preventDefault();
        store.cutElement(store.selectedElementId);
      }

      // Ctrl/Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        store.pasteElement();
      }

      // Delete: Remove selected element
      if (e.key === 'Delete' && store.selectedElementId) {
        e.preventDefault();
        store.removeElement(store.selectedElementId);
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        store.selectElement(undefined);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    store.saveToLocalStorage();
    onSave?.(store.project.id);
    setSaveStatus('saved');

    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [store, onSave]);

  const handleExport = useCallback(() => {
    const link = document.createElement('a');
    const html = store.exportAsHTML();
    const css = store.exportAsCSS();

    // Export HTML
    const htmlBlob = new Blob([html], { type: 'text/html' });
    link.href = URL.createObjectURL(htmlBlob);
    link.download = `${store.project.name}.html`;
    link.click();

    // Export CSS
    setTimeout(() => {
      const cssBlob = new Blob([css], { type: 'text/css' });
      link.href = URL.createObjectURL(cssBlob);
      link.download = `${store.project.name}.css`;
      link.click();
    }, 500);
  }, [store]);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplates && (
          <TemplateSelector
            onSelect={(template) => {
              const newElements = template.elements.map((el) => ({
                ...el,
                id: Math.random().toString(36).substr(2, 9),
              }));

              store.updateElement('', { children: newElements } as any);
              store.project.elements = newElements;
              setShowTemplates(false);
            }}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar: Component Library */}
      <motion.div
        className="hidden lg:flex flex-col w-64 bg-gray-800 border-r border-gray-700 overflow-hidden"
        initial={{ x: -264 }}
        animate={{ x: 0 }}
        exit={{ x: -264 }}
        transition={{ duration: 0.3 }}
      >
        <ComponentLibrary />
      </motion.div>

      {/* Center: Canvas */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden bg-gray-850"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Toolbar */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white truncate">
              {store.project.name}
            </h1>
            <motion.div
              className="text-xs font-medium px-2 py-1 rounded"
              animate={{
                backgroundColor:
                  saveStatus === 'saving'
                    ? '#f59e0b'
                    : saveStatus === 'saved'
                      ? '#10b981'
                      : '#6b7280',
              }}
            >
              <span className="text-white">
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                    ? 'Saved'
                    : 'Not saved'}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => store.undo()}
              disabled={store.historyIndex === 0}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 transition"
            >
              ↶ Undo
            </button>
            <button
              onClick={() => store.redo()}
              disabled={store.historyIndex >= store.history.length - 1}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 transition"
            >
              ↷ Redo
            </button>

            <div className="w-px h-6 bg-gray-700 mx-2" />

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Export
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
            >
              Save
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <DesignCanvas />
        </div>
      </motion.div>

      {/* Right Sidebar: Style Panel */}
      <motion.div
        className="hidden xl:flex flex-col w-80 bg-gray-800 border-l border-gray-700 overflow-hidden"
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        transition={{ duration: 0.3 }}
      >
        {store.selectedElementId ? (
          <StylePanel elementId={store.selectedElementId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select an element to edit styles</p>
          </div>
        )}
      </motion.div>

      {/* Preview Pane */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="hidden lg:flex flex-col w-96 bg-gray-800 border-l border-gray-700 overflow-hidden"
            initial={{ x: 384 }}
            animate={{ x: 0 }}
            exit={{ x: 384 }}
            transition={{ duration: 0.3 }}
          >
            <PreviewPane />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle */}
      <motion.button
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ⚙️
      </motion.button>
    </div>
  );
}
