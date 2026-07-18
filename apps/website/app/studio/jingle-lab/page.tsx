'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Music, Plus, Play, Download, Share2, Trash2 } from 'lucide-react';

interface JingleProject {
  id: string;
  title: string;
  type: 'song' | 'jingle' | 'commercial' | 'podcast' | 'logo';
  duration: number;
  genre: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string;
  isFavorite: boolean;
  status: 'draft' | 'processing' | 'ready' | 'archived';
}

const sampleProjects: JingleProject[] = [
  {
    id: '1',
    title: 'Brand Jingle - WISE² Enterprise',
    type: 'jingle',
    duration: 15,
    genre: 'Electronic',
    mood: 'Professional',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 1),
    isFavorite: true,
    status: 'ready',
  },
  {
    id: '2',
    title: 'Podcast Intro - Tech Talk Daily',
    type: 'podcast',
    duration: 30,
    genre: 'Electronic',
    mood: 'Energetic',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 3),
    isFavorite: false,
    status: 'ready',
  },
  {
    id: '3',
    title: 'Commercial - Product Launch',
    type: 'commercial',
    duration: 60,
    genre: 'Pop',
    mood: 'Uplifting',
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 4),
    isFavorite: false,
    status: 'processing',
  },
];

const typeColors: Record<string, string> = {
  song: 'bg-blue-500/20 text-blue-400',
  jingle: 'bg-purple-500/20 text-purple-400',
  commercial: 'bg-orange-500/20 text-orange-400',
  podcast: 'bg-pink-500/20 text-pink-400',
  logo: 'bg-green-500/20 text-green-400',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  processing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-green-500/20 text-green-400',
  archived: 'bg-red-500/20 text-red-400',
};

export default function JingleLabPage() {
  const [projects, setProjects] = useState<JingleProject[]>(sampleProjects);
  const [favorites, setFavorites] = useState(
    sampleProjects.filter(p => p.isFavorite).map(p => p.id)
  );

  const toggleFavorite = (projectId: string) => {
    if (favorites.includes(projectId)) {
      setFavorites(favorites.filter(id => id !== projectId));
    } else {
      setFavorites([...favorites, projectId]);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Music className="w-10 h-10 text-blue-400" />
                <span>Jingle Lab</span>
              </h1>
              <p className="text-gray-400 mt-2">
                Create. Brand. Inspire. AI-powered music for every moment.
              </p>
            </div>
            <Link href="/studio/jingle-lab/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/50"
              >
                <Plus className="w-5 h-5" />
                Create New
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'Completed', value: projects.filter(p => p.status === 'ready').length },
            { label: 'Processing', value: projects.filter(p => p.status === 'processing').length },
            { label: 'Favorites', value: favorites.length },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 hover:border-blue-400/50 transition-colors"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold">Your Projects</h2>

          {projects.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/30 backdrop-blur-md border-2 border-dashed border-slate-700/50 rounded-lg p-12 text-center"
            >
              <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No projects yet. Create your first jingle!</p>
              <Link href="/studio/jingle-lab/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg overflow-hidden hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {/* Thumbnail */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 h-40 flex items-center justify-center relative overflow-hidden">
                    <Music className="w-12 h-12 text-gray-400 opacity-50" />

                    {/* Playback Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                      >
                        <Play className="w-6 h-6 fill-current" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white"
                      >
                        <Download className="w-6 h-6" />
                      </motion.button>
                    </motion.div>

                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${statusColors[project.status]}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/studio/jingle-lab/${project.id}`}>
                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer">
                          {project.title}
                        </h3>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => toggleFavorite(project.id)}
                        className={`p-1 rounded transition-colors ${
                          favorites.includes(project.id)
                            ? 'text-yellow-400'
                            : 'text-gray-500 hover:text-yellow-400'
                        }`}
                      >
                        ★
                      </motion.button>
                    </div>

                    {/* Type & Genre */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[project.type]}`}>
                        {project.type}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-gray-300">
                        {project.genre}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-gray-300">
                        {project.duration}s
                      </span>
                    </div>

                    {/* Meta */}
                    <p className="text-xs text-gray-500 mb-4">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/studio/jingle-lab/${project.id}`} className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded text-sm transition-colors"
                        >
                          Edit
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => deleteProject(project.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
