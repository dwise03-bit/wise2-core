'use client';

/**
 * Context and Provider for managing global keyboard shortcuts
 * Allows shortcuts to be registered and managed centrally
 */

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { KeyboardShortcut } from '../types/streaming';

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (name: string) => void;
  updateShortcut: (name: string, updates: Partial<KeyboardShortcut>) => void;
  getShortcut: (name: string) => KeyboardShortcut | undefined;
  clearShortcuts: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(
  undefined
);

export interface KeyboardShortcutsProviderProps {
  initialShortcuts?: KeyboardShortcut[];
  children: React.ReactNode;
}

/**
 * Provider component for keyboard shortcuts context
 */
export function KeyboardShortcutsProvider({
  initialShortcuts = [],
  children,
}: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(initialShortcuts);
  const shortcutsMapRef = useRef<Map<string, KeyboardShortcut>>(
    new Map(initialShortcuts.map(s => [s.name, s]))
  );

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Remove if already exists
      const filtered = prev.filter(s => s.name !== shortcut.name);
      return [...filtered, shortcut];
    });
    shortcutsMapRef.current.set(shortcut.name, shortcut);
  }, []);

  const unregisterShortcut = useCallback((name: string) => {
    setShortcuts(prev => prev.filter(s => s.name !== name));
    shortcutsMapRef.current.delete(name);
  }, []);

  const updateShortcut = useCallback((name: string, updates: Partial<KeyboardShortcut>) => {
    const existing = shortcutsMapRef.current.get(name);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    setShortcuts(prev => prev.map(s => (s.name === name ? updated : s)));
    shortcutsMapRef.current.set(name, updated);
  }, []);

  const getShortcut = useCallback((name: string) => {
    return shortcutsMapRef.current.get(name);
  }, []);

  const clearShortcuts = useCallback(() => {
    setShortcuts([]);
    shortcutsMapRef.current.clear();
  }, []);

  const value: KeyboardShortcutsContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    updateShortcut,
    getShortcut,
    clearShortcuts,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook to use keyboard shortcuts context
 */
export function useKeyboardShortcutsContext(): KeyboardShortcutsContextType {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider'
    );
  }
  return context;
}
