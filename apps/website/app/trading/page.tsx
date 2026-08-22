'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  BookOpen,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { TradingLandingExperience } from './TradingLandingExperience';
import CommandCenter from './CommandCenter';
import Markets from './Markets';
import TradingJournal from './TradingJournal';
import StrategyLab from './StrategyLab';

type Page =
  | 'landing'
  | 'dashboard'
  | 'markets'
  | 'journal'
  | 'strategy'
  | 'settings';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

export default function TradingPage() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is authenticated (for now, assume landing for demo)
  const isAuthenticated = false;

  if (!isAuthenticated && currentPage === 'landing') {
    return <TradingLandingExperience />;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'markets', label: 'Markets', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'strategy', label: 'Strategy Lab', icon: <Zap className="w-5 h-5" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen && (
            <h2 className="font-bold text-white">WISE² Trading</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded transition"
          >
            <Menu className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.id
                  ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentPage === 'dashboard' && <CommandCenter />}
          {currentPage === 'markets' && <Markets />}
          {currentPage === 'strategy' && <StrategyLab />}
          {currentPage === 'journal' && <TradingJournal />}
          {currentPage === 'settings' && <TradingSettings />}
        </motion.div>
      </div>
    </div>
  );
}

function TradingSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
        <p className="text-slate-400">Settings coming soon...</p>
      </div>
    </div>
  );
}
