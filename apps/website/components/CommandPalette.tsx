'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from '@/types/navigation';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const COMMAND_CATEGORIES = {
  'pages': { label: 'Pages', icon: '📄' },
  'ai-commands': { label: 'AI Commands', icon: '✨' },
  'settings': { label: 'Settings', icon: '⚙️' },
  'files': { label: 'Files', icon: '📁' },
};

export default function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const { search, setSearch, filteredCommands, selectedIndex, setSelectedIndex, executeCommand, handleKeyDown } =
    useCommandPalette(commands);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown_ = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKeyDown_);
    return () => window.removeEventListener('keydown', handleKeyDown_);
  }, [isOpen, handleKeyDown, onClose]);

  if (!mounted) return null;

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-16 z-50 w-full max-w-2xl -translate-x-1/2 md:top-20"
          >
            <div className="mx-4 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-900/85 shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-slate-400">⌘</span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search commands, pages, settings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
                  />
                  <span className="text-xs text-slate-500">ESC</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-slate-400">No commands found</p>
                    <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                      <div key={category}>
                        {/* Category Header */}
                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <span className="mr-2">{COMMAND_CATEGORIES[category as keyof typeof COMMAND_CATEGORIES].icon}</span>
                          {COMMAND_CATEGORIES[category as keyof typeof COMMAND_CATEGORIES].label}
                        </div>

                        {/* Category Commands */}
                        {categoryCommands.map((cmd) => {
                          const isSelected = filteredCommands.indexOf(cmd) === selectedIndex;
                          return (
                            <motion.button
                              key={cmd.id}
                              onClick={() => {
                                executeCommand(cmd.id);
                                onClose();
                                setSearch('');
                              }}
                              onMouseEnter={() => setSelectedIndex(filteredCommands.indexOf(cmd))}
                              className={`w-full px-4 py-2 text-left transition-colors ${
                                isSelected ? 'bg-blue-600/30' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {cmd.icon && <span className="text-lg">{cmd.icon}</span>}
                                    <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                      {cmd.title}
                                    </span>
                                  </div>
                                  {cmd.description && (
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{cmd.description}</p>
                                  )}
                                </div>
                                {cmd.shortcut && (
                                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{cmd.shortcut}</span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 bg-slate-900/50 px-4 py-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Press</span>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded bg-slate-800 px-2 py-0.5">↑↓</kbd>
                    <span>to navigate</span>
                    <kbd className="rounded bg-slate-800 px-2 py-0.5">↲</kbd>
                    <span>to select</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
