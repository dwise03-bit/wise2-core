'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import {
  Play,
  Pause,
  Volume2,
  Download,
  Share2,
  Settings,
  ChevronRight,
  Music,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ProjectDetails {
  id: string;
  title: string;
  type: 'song' | 'jingle' | 'commercial' | 'podcast' | 'logo';
  status: 'draft' | 'processing' | 'ready' | 'archived';
  audioUrl?: string;
  duration: number;
  genre: string;
  mood: string;
  description: string;
  generatedAt?: Date;
}

const PROJECT_DATA: ProjectDetails = {
  id: '1',
  title: 'Brand Jingle - WISE² Enterprise',
  type: 'jingle',
  status: 'ready',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  duration: 15,
  genre: 'Electronic',
  mood: 'Professional',
  description: 'Professional brand jingle showcasing WISE² enterprise capabilities',
  generatedAt: new Date(),
};

export default function JingleProjectPage({ params }: { params: { projectId: string } }) {
  const [project] = useState<ProjectDetails>(PROJECT_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const progress = (currentTime / project.duration) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                  {project.type}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="text-gray-400 text-sm">{project.duration}s duration</span>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-slate-800 text-gray-400 hover:text-yellow-400'
                }`}
              >
                ★
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Player & Waveform - Left 2/3 */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Player Card */}
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-8 space-y-6">
              {/* Waveform Visualization */}
              <div className="space-y-4">
                <div className="h-24 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700/30 overflow-hidden">
                  <motion.div
                    className="flex items-center gap-1 h-full px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {Array.from({ length: 100 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                        animate={{
                          height: isPlaying
                            ? [
                              Math.random() * 60 + 20,
                              Math.random() * 60 + 20,
                              Math.random() * 60 + 20,
                            ]
                            : 30,
                        }}
                        transition={{
                          duration: 0.1 * Math.random() + 0.2,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{Math.floor(currentTime)}s</span>
                    <span>{project.duration}s</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg shadow-blue-500/50"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2 pl-4">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                variants={itemVariants}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4"
              >
                <p className="text-gray-400 text-sm mb-1">Genre</p>
                <p className="text-lg font-semibold text-white">{project.genre}</p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4"
              >
                <p className="text-gray-400 text-sm mb-1">Mood</p>
                <p className="text-lg font-semibold text-white">{project.mood}</p>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6"
            >
              <h3 className="text-lg font-bold text-white mb-2">Description</h3>
              <p className="text-gray-400">{project.description}</p>
            </motion.div>
          </motion.div>

          {/* Sidebar - Right 1/3 */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50"
              >
                <Sparkles className="w-5 h-5" />
                Regenerate
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                View History
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Settings
              </motion.button>
            </div>

            {/* Regenerate Options */}
            <AnimatePresence>
              {showRegenerateOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 space-y-2"
                >
                  <p className="text-sm font-semibold text-white mb-3">Regenerate with options:</p>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded text-sm text-gray-300 transition-colors">
                    Keep Same Prompt
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded text-sm text-gray-300 transition-colors">
                    Edit Parameters
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded text-sm text-gray-300 transition-colors">
                    Create Variation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 space-y-4"
                >
                  <div>
                    <label className="text-sm font-semibold text-white block mb-2">Tempo (BPM)</label>
                    <input type="number" defaultValue="120" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white block mb-2">Key</label>
                    <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-400">
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Card */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4"
            >
              <h3 className="text-sm font-bold text-white mb-3">Project Info</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Generated</span>
                  <span>{project.generatedAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span>{project.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-400">{project.status}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  );
}
