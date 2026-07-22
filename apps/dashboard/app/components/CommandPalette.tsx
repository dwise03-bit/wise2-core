'use client';

import { useEffect, useState } from 'react';

interface Command {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  shortcut?: string;
}

const commands: Command[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Go to main dashboard',
    category: 'Navigation',
    icon: '📊',
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'View all customers',
    category: 'Navigation',
    icon: '👥',
  },
  {
    id: 'pipeline',
    title: 'Sales Pipeline',
    description: 'Manage sales opportunities',
    category: 'Navigation',
    icon: '📈',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'View active projects',
    category: 'Navigation',
    icon: '🎯',
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Manage invoicing',
    category: 'Navigation',
    icon: '💳',
  },
  {
    id: 'ai-studio',
    title: 'AI Studio',
    description: 'Custom AI tools',
    category: 'Navigation',
    icon: '🧠',
  },
  {
    id: 'automations',
    title: 'Automations',
    description: 'Workflow automation',
    category: 'Navigation',
    icon: '⚡',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System settings',
    category: 'Navigation',
    icon: '⚙️',
  },
  {
    id: 'new-customer',
    title: 'New Customer',
    description: 'Create a new customer',
    category: 'Actions',
    icon: '✨',
  },
  {
    id: 'new-deal',
    title: 'New Deal',
    description: 'Create a new sales opportunity',
    category: 'Actions',
    icon: '🎁',
  },
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Start a new project',
    category: 'Actions',
    icon: '📋',
  },
  {
    id: 'new-invoice',
    title: 'New Invoice',
    description: 'Create an invoice',
    category: 'Actions',
    icon: '📄',
  },
  {
    id: 'analyze',
    title: 'Analyze Data',
    description: 'Run AI analysis',
    category: 'AI',
    icon: '🔍',
  },
  {
    id: 'suggest',
    title: 'Get Suggestions',
    description: 'AI-powered recommendations',
    category: 'AI',
    icon: '💡',
  },
  {
    id: 'help',
    title: 'Help',
    description: 'View documentation',
    category: 'Help',
    icon: '❓',
  },
];

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(
    cmd =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelectCommand(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex]);

  const handleSelectCommand = (cmd: Command) => {
    console.log('Selected command:', cmd);
    onClose();
  };

  const groupedCommands = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>,
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-[#2cd588] rounded-lg shadow-2xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-[#2cd588]/30">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="w-full bg-[#0f0f1e] border border-[#2cd588] rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none"
          />
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
                {category}
              </div>
              {cmds.map((cmd, idx) => {
                const globalIndex = filtered.findIndex(c => c.id === cmd.id);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => handleSelectCommand(cmd)}
                    className={`px-4 py-3 cursor-pointer border-l-2 ${
                      isSelected
                        ? 'border-[#2cd588] bg-[#2cd588]/10'
                        : 'border-transparent hover:bg-[#0f0f1e]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cmd.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{cmd.title}</p>
                        <p className="text-gray-500 text-sm">{cmd.description}</p>
                      </div>
                      {cmd.shortcut && <span className="text-xs text-gray-600">{cmd.shortcut}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#0f0f1e] border-t border-[#2cd588]/30 px-4 py-2 text-xs text-gray-600 flex justify-between">
          <span>↓↑ Navigate • ↵ Select • ESC Close</span>
          <span>{filtered.length} commands</span>
        </div>
      </div>
    </div>
  );
}
