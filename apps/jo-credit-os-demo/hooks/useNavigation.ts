'use client';

import { useState, useCallback, useEffect } from 'react';
import { NavigationState } from '@/types/navigation';

const STORAGE_KEY = 'wise2_nav_state';
const DEFAULT_STATE: NavigationState = {
  sidebarCollapsed: false,
  rightPanelOpen: false,
  rightPanelWidth: 320,
  sidebarWidth: 256,
  commandPaletteOpen: false,
  mobileMenuOpen: false,
};

function stripTransientState(state: NavigationState) {
  const { commandPaletteOpen: _commandPaletteOpen, mobileMenuOpen: _mobileMenuOpen, ...persisted } = state;
  return persisted;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<NavigationState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            // Never restore blocking overlays on load.
            commandPaletteOpen: false,
            mobileMenuOpen: false,
          }));
        } catch (e) {
          console.error('Failed to load nav state:', e);
        }
      }
      setMounted(true);
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback((newState: Partial<NavigationState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripTransientState(updated)));
      }
      return updated;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    saveState({ sidebarCollapsed: !state.sidebarCollapsed });
  }, [state.sidebarCollapsed, saveState]);

  const toggleRightPanel = useCallback(() => {
    saveState({ rightPanelOpen: !state.rightPanelOpen });
  }, [state.rightPanelOpen, saveState]);

  const toggleCommandPalette = useCallback(() => {
    saveState({ commandPaletteOpen: !state.commandPaletteOpen });
  }, [state.commandPaletteOpen, saveState]);

  const toggleMobileMenu = useCallback(() => {
    saveState({ mobileMenuOpen: !state.mobileMenuOpen });
  }, [state.mobileMenuOpen, saveState]);

  const setSidebarWidth = useCallback(
    (width: number) => {
      saveState({ sidebarWidth: Math.max(180, Math.min(400, width)) });
    },
    [saveState]
  );

  const setRightPanelWidth = useCallback(
    (width: number) => {
      saveState({ rightPanelWidth: Math.max(240, Math.min(500, width)) });
    },
    [saveState]
  );

  return {
    ...state,
    mounted,
    toggleSidebar,
    toggleRightPanel,
    toggleCommandPalette,
    toggleMobileMenu,
    setSidebarWidth,
    setRightPanelWidth,
  };
}
