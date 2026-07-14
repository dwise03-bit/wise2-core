'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardShortcut } from '../types/streaming';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  ignoreInputs?: boolean;
}

export interface ShortcutMap {
  [key: string]: KeyboardShortcut;
}

/**
 * Hook for managing keyboard shortcuts with flexible binding
 * Supports single keys, modifier combinations, and can ignore inputs during text entry
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputs = true,
  } = options;

  const shortcutMapRef = useRef<ShortcutMap>({});

  // Build shortcut map for efficient lookup
  useEffect(() => {
    const map: ShortcutMap = {};
    shortcuts.forEach((shortcut) => {
      const key = normalizeShortcutKeys(shortcut.keys);
      map[key] = shortcut;
    });
    shortcutMapRef.current = map;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if typing in an input or textarea
      if (ignoreInputs && isEditableElement(event.target as HTMLElement)) {
        return;
      }

      const pressedKeys = extractPressedKeys(event);
      const shortcutKey = pressedKeys.join('+').toLowerCase();
      const shortcut = shortcutMapRef.current[shortcutKey];

      if (shortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
      }
    },
    [enabled, ignoreInputs, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isEnabled: enabled,
  };
}

/**
 * Normalize shortcut keys to consistent format
 * E.g., ['ctrl', 'S'] -> 'ctrl+s'
 */
export function normalizeShortcutKeys(keys: string[]): string {
  return keys
    .map(k => k.toLowerCase())
    .sort((a, b) => {
      // Keep modifiers first
      const modifierOrder = ['ctrl', 'cmd', 'meta', 'shift', 'alt'];
      const aIdx = modifierOrder.indexOf(a);
      const bIdx = modifierOrder.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    })
    .join('+');
}

/**
 * Extract pressed keys from keyboard event
 */
export function extractPressedKeys(event: KeyboardEvent): string[] {
  const keys: string[] = [];

  // Check modifiers
  if (event.ctrlKey) keys.push('ctrl');
  if (event.metaKey) keys.push('meta');
  if (event.shiftKey) keys.push('shift');
  if (event.altKey) keys.push('alt');

  // Add the actual key
  const key = event.key.toLowerCase();
  if (!isModifierKey(key)) {
    keys.push(key);
  }

  return keys;
}

/**
 * Check if a key is a modifier key
 */
function isModifierKey(key: string): boolean {
  return ['control', 'shift', 'alt', 'meta'].includes(key.toLowerCase());
}

/**
 * Check if element is editable (input, textarea, contenteditable)
 */export function isEditableElement(element: HTMLElement | null): boolean {
  if (!element) return false;

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element.contentEditable === 'true') {
    return true;
  }

  return false;
}

/**
 * Format keys for display
 * E.g., 'ctrl+s' -> 'Ctrl+S'
 */
export function formatKeysForDisplay(keys: string[]): string {
  const keyDisplayMap: Record<string, string> = {
    ctrl: process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl',
    meta: 'Cmd',
    shift: 'Shift',
    alt: 'Alt',
    ' ': 'Space',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'enter': 'Enter',
    'backspace': 'Backspace',
    'delete': 'Delete',
    'escape': 'Esc',
  };

  return keys
    .map(k => {
      const lowerKey = k.toLowerCase();
      return keyDisplayMap[lowerKey] || k.toUpperCase();
    })
    .join('+');
}
