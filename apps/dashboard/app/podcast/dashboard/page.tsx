'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useProjects, useUserStats } from '@/lib/podcast/hooks';
import { PodcastLayout } from '../components/PodcastLayout';
import { ProjectCard } from '../components/ProjectCard';

export default function PodcastDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { projects, isLoading, error, refetch } = useProjects();
  const { generationsUsed, generationsLimit, storageUsed } = useUserStats();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/podcast/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <PodcastLayout currentTab="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>
      </PodcastLayout>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <PodcastLayout currentTab="dashboard">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.email}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {/* Generations Used */}
        <motion.div
          variants={item}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30"
        >
          <div className="text-sm text-gray-400 mb-2">Generations Used</div>
          <div className="text-3xl font-bold mb-2">
            {generationsUsed} / {generationsLimit}
          </div>
          <div className="w-full bg-black/50 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(generationsUsed / generationsLimit) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Storage Used */}
        <motion.div
          variants={item}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
        >
          <div className="text-sm text-gray-400 mb-2">Storage Used</div>
          <div className="text-3xl font-bold">{(storageUsed / 1024 / 1024).toFixed(1)} MB</div>
          <p className="text-sm text-gray-400 mt-2">of 5 GB available</p>
        </motion.div>

        {/* Quick Action */}
        <motion.div
          variants={item}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 flex flex-col justify-between"
        >
          <div>
            <div className="text-sm text-gray-400 mb-2">Get Started</div>
            <div className="text-xl font-bold">Create New Project</div>
          </div>
          <Link
            href="/podcast/generate"
            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all text-sm text-center"
          >
            Start Now
          </Link>
        </motion.div>
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <p className="text-gray-400 text-sm mt-1">{projects.length} projects</p>
          </div>
          <Link
            href="/podcast/generate"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/50"
          >
            + New Project
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={item}>
                <ProjectCard
                  project={project}
                  onDelete={() => refetch()}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20"
          >
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first podcast music project to get started</p>
            <Link
              href="/podcast/generate"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
            >
              Create First Project
            </Link>
          </motion.div>
        )}
      </motion.div>
    </PodcastLayout>
  );
}
