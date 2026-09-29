'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PodcastProject } from '@/lib/podcast/api-client';

interface ProjectCardProps {
  project: PodcastProject;
  onDelete?: () => void;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-300' },
  generating: { label: 'Generating...', color: 'bg-blue-500/20 text-blue-300' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-300' },
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = STATUS_CONFIG[project.status];
  const templateIcon: Record<typeof project.template, string> = {
    intro: '▶️',
    outro: '⏹️',
    transition: '⟿',
  };
  const moodEmoji: Record<typeof project.mood, string> = {
    upbeat: '😊',
    calm: '😌',
    dramatic: '😲',
  };

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/60 transition-all"
    >
      <Link href={`/podcast/generate?projectId=${project.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{templateIcon[project.template]}</div>
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400">Episode {project.episodeNumber}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{moodEmoji[project.mood]}</span>
            <span className="text-sm text-gray-300 capitalize">{project.mood}</span>
          </div>
          <div className="h-1 w-1 bg-gray-500 rounded-full" />
          <span className="text-sm text-gray-400">{formattedDate}</span>
        </div>

        {project.audioUrl && project.status === 'completed' && (
          <div className="mb-4">
            <audio controls className="w-full h-8 bg-black/50 rounded">
              <source src={project.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </Link>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/podcast/downloads?projectId=${project.id}`}
          className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm font-medium transition-colors"
        >
          View
        </Link>
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}
