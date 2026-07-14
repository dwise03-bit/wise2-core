'use client';

import { useEffect, useCallback } from 'react';
import type { KeyboardShortcut } from '../types/streaming';

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyCombination = shortcut.keys.join('+').toLowerCase();
        const pressedKeys: string[] = [];

        if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
        if (event.shiftKey) pressedKeys.push('shift');
        if (event.altKey) pressedKeys.push('alt');

        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
          pressedKeys.push(key);
        }

        const currentCombination = pressedKeys.join('+');

        if (currentCombination === keyCombination) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
  };
}
