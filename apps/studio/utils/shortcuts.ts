/**
 * Keyboard Shortcuts Utilities
 * Helper functions for creating, managing, and organizing shortcuts
 */

import type { KeyboardShortcut } from '../types/streaming';

/**
 * Create a keyboard shortcut with validated inputs
 */
export function createShortcut(
  name: string,
  description: string,
  keys: string[],
  action: () => void,
  category: KeyboardShortcut['category'] = 'other'
): KeyboardShortcut {
  if (!name || !description || !keys || keys.length === 0 || !action) {
    throw new Error('Invalid shortcut configuration');
  }

  return {
    name,
    description,
    keys: keys.map(k => k.toLowerCase()),
    action,
    category,
  };
}

/**
 * Check if two shortcuts have the same key combination
 */
export function shortcutsConflict(
  shortcut1: KeyboardShortcut,
  shortcut2: KeyboardShortcut
): boolean {
  if (shortcut1.keys.length !== shortcut2.keys.length) {
    return false;
  }

  const keys1 = [...shortcut1.keys].sort();
  const keys2 = [...shortcut2.keys].sort();

  return keys1.every((key, index) => key === keys2[index]);
}

/**
 * Find conflicting shortcuts
 */
export function findConflicts(
  shortcuts: KeyboardShortcut[]
): Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> {
  const conflicts: Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> = [];

  for (let i = 0; i < shortcuts.length; i++) {
    for (let j = i + 1; j < shortcuts.length; j++) {
      if (shortcutsConflict(shortcuts[i], shortcuts[j])) {
        conflicts.push({
          shortcut1: shortcuts[i],
          shortcut2: shortcuts[j],
        });
      }
    }
  }

  return conflicts;
}

/**
 * Sort shortcuts by category
 */
export function sortShortcutsByCategory(
  shortcuts: KeyboardShortcut[]
): Array<[string, KeyboardShortcut[]]> {
  const categoryOrder = ['recording', 'playback', 'mixer', 'project', 'stream', 'chat', 'other'];

  const grouped = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>
  );

  return categoryOrder
    .filter(cat => grouped[cat])
    .map(cat => [cat, grouped[cat]]);
}

/**
 * Filter shortcuts by search query
 */
export function searchShortcuts(
  shortcuts: KeyboardShortcut[],
  query: string
): KeyboardShortcut[] {
  const q = query.toLowerCase();
  return shortcuts.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keys.some(k => k.toLowerCase().includes(q))
  );
}

/**
 * Export shortcuts as JSON for sharing/backup
 */
export function exportShortcuts(shortcuts: KeyboardShortcut[]): string {
  const data = shortcuts.map(s => ({
    name: s.name,
    description: s.description,
    keys: s.keys,
    category: s.category,
  }));
  return JSON.stringify(data, null, 2);
}

/**
 * Get shortcuts for a specific category
 */
export function getShortcutsByCategory(
  shortcuts: KeyboardShortcut[],
  category: string
): KeyboardShortcut[] {
  return shortcuts.filter(s => s.category === category);
}

/**
 * Get all unique categories
 */
export function getShortcutCategories(shortcuts: KeyboardShortcut[]): string[] {
  const categories = new Set(shortcuts.map(s => s.category));
  return Array.from(categories).sort();
}

/**
 * Check if a key combination is already in use
 */
export function isKeyCombinationUsed(
  keyCombination: string[],
  shortcuts: KeyboardShortcut[]
): boolean {
  return shortcuts.some(shortcut =>
    shortcutsConflict(
      { name: '', description: '', keys: keyCombination, action: () => {}, category: 'other' },
      shortcut
    )
  );
}

/**
 * Suggest available key combinations
 */
export function suggestAvailableShortcuts(
  shortcuts: KeyboardShortcut[],
  maxCount: number = 5
): Array<string[]> {
  const commonKeys = [
    ['a'], ['b'], ['c'], ['d'], ['e'], ['f'],
    ['shift', 'a'], ['shift', 'b'], ['ctrl', 'a'], ['ctrl', 'b'],
  ];

  return commonKeys.filter(
    keys => !isKeyCombinationUsed(keys, shortcuts)
  ).slice(0, maxCount);
}

/**
 * Convert keyboard event to shortcut keys array
 */
export function keyboardEventToShortcutKeys(event: KeyboardEvent): string[] {
  const keys: string[] = [];

  if (event.ctrlKey) keys.push('ctrl');
  if (event.metaKey) keys.push('meta');
  if (event.shiftKey) keys.push('shift');
  if (event.altKey) keys.push('alt');

  const key = event.key.toLowerCase();
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    keys.push(key);
  }

  return keys;
}

/**
 * Validate shortcut configuration
 */
export function validateShortcut(shortcut: Partial<KeyboardShortcut>): string[] {
  const errors: string[] = [];

  if (!shortcut.name || shortcut.name.trim() === '') {
    errors.push('Shortcut name is required');
  }

  if (!shortcut.description || shortcut.description.trim() === '') {
    errors.push('Shortcut description is required');
  }

  if (!shortcut.keys || shortcut.keys.length === 0) {
    errors.push('At least one key is required');
  }

  if (shortcut.keys && shortcut.keys.some(k => !k || k.trim() === '')) {
    errors.push('All keys must be non-empty');
  }

  if (!shortcut.action || typeof shortcut.action !== 'function') {
    errors.push('Shortcut action must be a function');
  }

  return errors;
}

/**
 * Merge multiple shortcut arrays with conflict detection
 */
export function mergeShortcuts(
  ...shortcutArrays: KeyboardShortcut[][]
): { shortcuts: KeyboardShortcut[]; conflicts: Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> } {
  const allShortcuts = shortcutArrays.flat();
  const uniqueMap = new Map<string, KeyboardShortcut>();

  allShortcuts.forEach(shortcut => {
    const key = shortcut.name;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, shortcut);
    }
  });

  const shortcuts = Array.from(uniqueMap.values());
  const conflicts = findConflicts(shortcuts);

  return { shortcuts, conflicts };
}

/**
 * Get platform-specific modifier key
 */
export function getPlatformModifierKey(): 'ctrl' | 'meta' {
  if (typeof window === 'undefined') return 'ctrl';
  return navigator.platform.includes('Mac') ? 'meta' : 'ctrl';
}

/**
 * Normalize shortcut keys for comparison
 */
export function normalizeShortcutKeysForComparison(keys: string[]): string {
  return keys
    .map(k => k.toLowerCase())
    .sort()
    .join('+');
}

/**
 * Create common shortcuts factory
 */
export const ShortcutFactory = {
  /**
   * Create save shortcut
   */
  save: (action: () => void, isMac: boolean = false): KeyboardShortcut =>
    createShortcut(
      'Save Project',
      'Save the current project',
      [isMac ? 'meta' : 'ctrl', 's'],
      action,
      'project'
    ),

  /**
   * Create export shortcut
   */
  export: (action: () => void, isMac: boolean = false): KeyboardShortcut =>
    createShortcut(
      'Export Project',
      'Export project as audio file',
      [isMac ? 'meta' : 'ctrl', 'e'],
      action,
      'project'
    ),

  /**
   * Create undo shortcut
   */
  undo: (action: () => void, isMac: boolean = false): KeyboardShortcut =>
    createShortcut(
      'Undo',
      'Undo last action',
      [isMac ? 'meta' : 'ctrl', 'z'],
      action,
      'other'
    ),

  /**
   * Create redo shortcut
   */
  redo: (action: () => void, isMac: boolean = false): KeyboardShortcut =>
    createShortcut(
      'Redo',
      'Redo last undone action',
      [isMac ? 'meta' : 'ctrl', 'shift', 'z'],
      action,
      'other'
    ),
};

/**
 * Load shortcuts from localStorage
 */
export function loadShortcutsFromStorage(key: string = 'keyboard-shortcuts'): KeyboardShortcut[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load shortcuts from storage:', error);
    return [];
  }
}

/**
 * Save shortcuts to localStorage
 */
export function saveShortcutsToStorage(
  shortcuts: KeyboardShortcut[],
  key: string = 'keyboard-shortcuts'
): void {
  try {
    const data = shortcuts.map(s => ({
      name: s.name,
      description: s.description,
      keys: s.keys,
      category: s.category,
    }));
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save shortcuts to storage:', error);
  }
}
