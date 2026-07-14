'use client';

/**
 * Hook that integrates keyboard shortcuts with audio engine actions
 * Provides pre-configured shortcuts for recording, playback, and track management
 */

import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardShortcut } from '../types/streaming';
import { useAudioEngine } from './useAudioEngine';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

export interface AudioKeyboardShortcutsConfig {
  recordKey?: string[]; // Default: ['r']
  playKey?: string[]; // Default: ['space']
  stopKey?: string[]; // Default: ['shift', 'space']
  addTrackKey?: string[]; // Default: ['t']
  deleteTrackKey?: string[]; // Default: ['delete']
  saveKey?: string[]; // Default: ['ctrl', 's'] or ['meta', 's']
  exportKey?: string[]; // Default: ['ctrl', 'e'] or ['meta', 'e']
  showHelpKey?: string[]; // Default: ['?'] or ['shift', '/']
  enabled?: boolean;
  onShowHelp?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  selectedTrackId?: string | null;
  onTrackSelected?: (trackId: string) => void;
}

/**
 * Create default shortcuts for audio engine actions
 */
function createAudioShortcuts(
  config: AudioKeyboardShortcutsConfig,
  audioEngine: ReturnType<typeof useAudioEngine>
): KeyboardShortcut[] {
  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');
  const ctrlKey = isMac ? 'meta' : 'ctrl';

  const {
    recordKey = ['r'],
    playKey = [' '],
    stopKey = ['shift', ' '],
    addTrackKey = ['t'],
    deleteTrackKey = ['delete'],
    saveKey = [ctrlKey, 's'],
    exportKey = [ctrlKey, 'e'],
    showHelpKey = ['?'],
    onShowHelp,
    onSave,
    onExport,
    selectedTrackId,
    onTrackSelected,
  } = config;

  return [
    {
      name: 'Toggle Recording',
      description: 'Start or stop recording audio',
      keys: recordKey,
      action: () => {
        if (audioEngine.state.isRecording) {
          audioEngine.stopRecording();
        } else {
          audioEngine.startRecording();
        }
      },
      category: 'recording',
    },
    {
      name: 'Play/Pause',
      description: 'Toggle playback',
      keys: playKey,
      action: () => {
        if (audioEngine.state.isPlaying) {
          audioEngine.pause();
        } else {
          audioEngine.play();
        }
      },
      category: 'playback',
    },
    {
      name: 'Stop Playback',
      description: 'Stop playback and reset position',
      keys: stopKey,
      action: () => {
        audioEngine.stop();
      },
      category: 'playback',
    },
    {
      name: 'Add Track',
      description: 'Add a new audio track',
      keys: addTrackKey,
      action: () => {
        audioEngine.addTrack();
      },
      category: 'mixer',
    },
    {
      name: 'Remove Track',
      description: 'Delete the selected track',
      keys: deleteTrackKey,
      action: () => {
        if (selectedTrackId) {
          audioEngine.removeTrack(selectedTrackId);
        }
      },
      category: 'mixer',
    },
    {
      name: 'Save Project',
      description: 'Save the current project',
      keys: saveKey,
      action: () => {
        onSave?.();
      },
      category: 'project',
    },
    {
      name: 'Export Project',
      description: 'Export the project as audio file',
      keys: exportKey,
      action: () => {
        onExport?.();
      },
      category: 'project',
    },
    {
      name: 'Show Help',
      description: 'Display keyboard shortcuts help panel',
      keys: showHelpKey,
      action: () => {
        onShowHelp?.();
      },
      category: 'other',
    },
  ];
}

/**
 * Hook combining audio engine with keyboard shortcuts
 * Automatically sets up shortcuts for recording, playback, and track management
 */
export function useAudioKeyboardShortcuts(config: AudioKeyboardShortcutsConfig = {}) {
  const audioEngine = useAudioEngine();
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  const shortcuts = createAudioShortcuts(config, audioEngine);
  shortcutsRef.current = shortcuts;

  const keyboardShortcuts = useKeyboardShortcuts(shortcuts, {
    enabled: config.enabled !== false,
  });

  return {
    ...keyboardShortcuts,
    audioEngine,
    shortcuts,
  };
}

/**
 * Hook for creating custom audio shortcuts
 * Useful for components that need to add their own shortcuts
 */
export function useCustomAudioShortcuts(
  createShortcuts: (audioEngine: ReturnType<typeof useAudioEngine>) => KeyboardShortcut[],
  options?: { enabled?: boolean }
) {
  const audioEngine = useAudioEngine();
  const shortcuts = createShortcuts(audioEngine);

  return useKeyboardShortcuts(shortcuts, {
    enabled: options?.enabled !== false,
  });
}
