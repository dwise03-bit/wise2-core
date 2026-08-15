'use client';

/**
 * ShortcutsPanel Component
 * Displays all available keyboard shortcuts organized by category
 * Can be shown as a modal, drawer, or inline panel
 */

import React, { useState, useMemo } from 'react';
import type { KeyboardShortcut } from '../../../types/streaming';
import { formatKeysForDisplay } from '../../../hooks/useKeyboardShortcuts';

export interface ShortcutsPanelProps {
  shortcuts: KeyboardShortcut[];
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'drawer' | 'inline';
  showHeader?: boolean;
  showSearch?: boolean;
  className?: string;
}

/**
 * Group shortcuts by category
 */function groupShortcutsByCategory(shortcuts: KeyboardShortcut[]): Record<string, KeyboardShortcut[]> {
  return shortcuts.reduce(
    (groups, shortcut) => {
      const category = shortcut.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
      return groups;
    },
    {} as Record<string, KeyboardShortcut[]>
  );
}

/**
 * Get nice display name for categories
 */
function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    stream: 'Streaming',
    recording: 'Recording',
    scene: 'Scenes',
    mixer: 'Mixer',
    chat: 'Chat',
    playback: 'Playback',
    project: 'Project',
    other: 'General',
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export function ShortcutsPanel({
  shortcuts,
  isOpen = true,
  onClose,
  variant = 'inline',
  showHeader = true,
  showSearch = true,
  className = '',
}: ShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts;
    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.keys.some(k => k.toLowerCase().includes(query))
    );
  }, [shortcuts, searchQuery]);

  const groupedShortcuts = useMemo(
    () => groupShortcutsByCategory(filteredShortcuts),
    [filteredShortcuts]
  );

  const content = (
    <div className={`flex flex-col gap-6 bg-gray-950 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div>
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-chrome/20 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}

      {/* Shortcuts by Category */}
      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              {getCategoryDisplayName(category)}
            </h3>
            <div className="space-y-2">
              {categoryShortcuts.map((shortcut) => (
                <ShortcutRow key={shortcut.name} shortcut={shortcut} />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedShortcuts).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No shortcuts found</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 border-t border-chrome/20 pt-4">
        <p>Press <span className="text-gray-400 font-mono">?</span> at any time to show this panel</p>
      </div>
    </div>
  );

  if (variant === 'modal') {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-950 border border-chrome/20 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'drawer') {
    if (!isOpen) return null;
    return (
      <>
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-950 border-l border-chrome/20 z-50 overflow-y-auto p-6 shadow-xl">
          {content}
        </div>
      </>
    );
  }

  // Inline variant (default)
  return (
    <div className="border border-chrome/20 rounded-lg p-6 bg-gray-900/50">
      {content}
    </div>
  );
}

/**
 * Single shortcut row component
 */
interface ShortcutRowProps {
  shortcut: KeyboardShortcut;
}

function ShortcutRow({ shortcut }: ShortcutRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-2 rounded hover:bg-gray-900/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{shortcut.name}</div>
        <div className="text-xs text-gray-400 mt-1">{shortcut.description}</div>
      </div>
      <div className="flex-shrink-0 ml-2">
        <kbd className="inline-block px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">
          {formatKeysForDisplay(shortcut.keys)}
        </kbd>
      </div>
    </div>
  );
}

export default ShortcutsPanel;
