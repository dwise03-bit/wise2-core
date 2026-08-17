'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Command } from '@/types/navigation';

const RECENT_STORAGE_KEY = 'wise2_recent_commands';
const MAX_RECENT = 10;

export function useCommandPalette(commands: Command[]) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  // Load recent commands
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      if (saved) {
        try {
          setRecentCommands(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent commands:', e);
        }
      }
    }
  }, []);

  // Fuzzy search filter
  const fuzzyMatch = useCallback((text: string, query: string): boolean => {
    if (!query) return true;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let queryIdx = 0;
    for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIdx]) {
        queryIdx++;
      }
    }
    return queryIdx === lowerQuery.length;
  }, []);

  // Filter and sort commands
  const filteredCommands = useMemo(() => {
    let results = commands.filter(
      (cmd) =>
        fuzzyMatch(cmd.title, search) ||
        (cmd.description && fuzzyMatch(cmd.description, search))
    );

    // Sort: recent first, then by title
    results = results.sort((a, b) => {
      const aRecent = recentCommands.includes(a.id) ? -1 : 0;
      const bRecent = recentCommands.includes(b.id) ? -1 : 0;
      if (aRecent !== bRecent) return aRecent - bRecent;
      return a.title.localeCompare(b.title);
    });

    return results;
  }, [commands, search, recentCommands, fuzzyMatch]);

  const executeCommand = useCallback(
    (commandId: string) => {
      const command = commands.find((c) => c.id === commandId);
      if (!command) return;

      // Add to recent
      setRecentCommands((prev) => {
        const updated = [commandId, ...prev.filter((id) => id !== commandId)];
        return updated.slice(0, MAX_RECENT);
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          RECENT_STORAGE_KEY,
          JSON.stringify(
            [commandId, ...recentCommands.filter((id) => id !== commandId)].slice(0, MAX_RECENT)
          )
        );
      }

      command.action();
    },
    [commands, recentCommands]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filteredCommands.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          executeCommand(filteredCommands[selectedIndex].id);
          break;
      }
    },
    [filteredCommands, selectedIndex, executeCommand]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, filteredCommands.length]);

  return {
    search,
    setSearch,
    filteredCommands,
    selectedIndex,
    setSelectedIndex,
    executeCommand,
    handleKeyDown,
  };
}
