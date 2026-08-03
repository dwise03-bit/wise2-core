'use client';

/**
 * ShortcutsIntegration Component
 * Complete integration example showing keyboard shortcuts in action
 * Combines audio engine, UI hints, and help panel
 */

import React, { useState } from 'react';
import { useAudioKeyboardShortcuts } from '../../../hooks/useAudioKeyboardShortcuts';
import { ShortcutsPanel } from './ShortcutsPanel';
import { ShortcutButton } from './ShortcutHint';

export interface ShortcutsIntegrationProps {
  onSave?: () => void;
  onExport?: () => void;
  selectedTrackId?: string | null;
  showHelpInitially?: boolean;
  className?: string;
}

/**
 * Complete keyboard shortcuts integration with help panel
 */
export function ShortcutsIntegration({
  onSave,
  onExport,
  selectedTrackId,
  showHelpInitially = false,
  className = '',
}: ShortcutsIntegrationProps) {
  const [showHelp, setShowHelp] = useState(showHelpInitially);

  const { shortcuts } = useAudioKeyboardShortcuts({
    enabled: true,
    onShowHelp: () => setShowHelp(!showHelp),
    onSave,
    onExport,
    selectedTrackId,
  });

  return (
    <div className={className}>
      {/* Help Panel - Modal Variant */}
      {showHelp && (
        <ShortcutsPanel
          shortcuts={shortcuts}
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          variant="modal"
        />
      )}

      {/* Transport Controls with Shortcut Hints */}
      <div className="flex gap-2 items-center">
        <ShortcutButton
          shortcutKeys={['r']}
          shortcutDescription="Toggle Recording"
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white font-bold transition-all"
        >
          ●
        </ShortcutButton>

        <ShortcutButton
          shortcutKeys={[' ']}
          shortcutDescription="Play/Pause"
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white font-bold transition-all"
        >
          ▶
        </ShortcutButton>

        <ShortcutButton
          shortcutKeys={['shift', ' ']}
          shortcutDescription="Stop"
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold transition-all"
        >
          ⏹
        </ShortcutButton>

        <div className="flex-1" />

        <ShortcutButton
          shortcutKeys={['t']}
          shortcutDescription="Add Track"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-all text-sm"
        >
          + Track
        </ShortcutButton>

        <ShortcutButton
          shortcutKeys={['?']}
          shortcutDescription="Show Help"
          onClick={() => setShowHelp(!showHelp)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-all text-sm"
        >
          ?
        </ShortcutButton>
      </div>
    </div>
  );
}

/**
 * Keyboard Shortcuts Information Card
 * Useful for onboarding or help sections
 */
export interface KeyboardShortcutsCardProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function KeyboardShortcutsCard({
  variant = 'compact',
  className = '',
}: KeyboardShortcutsCardProps) {
  const { shortcuts } = useAudioKeyboardShortcuts();

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-blue-400 mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {shortcuts.slice(0, 8).map(shortcut => (
            <div key={shortcut.name} className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-blue-950 border border-blue-700 rounded text-gray-300 font-mono">
                {shortcut.keys.join('+')}
              </kbd>
              <span className="text-gray-400">{shortcut.name}</span>
            </div>
          ))}
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 mt-3 font-medium">
          See all shortcuts (?)
        </button>
      </div>
    );
  }

  // Full variant
  return <ShortcutsPanel shortcuts={shortcuts} />;
}

/**
 * Keyboard shortcut hints overlay
 * Shows hints for keyboard shortcuts on first load
 */
export interface ShortcutsHintsOverlayProps {
  onDismiss?: () => void;
  dismissKey?: string;
  className?: string;
}

export function ShortcutsHintsOverlay({
  onDismiss,
  dismissKey = 'escape',
  className = '',
}: ShortcutsHintsOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === dismissKey.toLowerCase()) {
        setIsVisible(false);
        onDismiss?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissKey, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 border border-chrome/20 rounded-lg p-4 shadow-lg max-w-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white mb-2">Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>Press <kbd className="px-1 bg-gray-800 rounded text-gray-300">Space</kbd> to play/pause</li>
            <li>Press <kbd className="px-1 bg-gray-800 rounded text-gray-300">R</kbd> to toggle recording</li>
            <li>Press <kbd className="px-1 bg-gray-800 rounded text-gray-300">T</kbd> to add a track</li>
            <li>Press <kbd className="px-1 bg-gray-800 rounded text-gray-300">?</kbd> for all shortcuts</li>
          </ul>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
