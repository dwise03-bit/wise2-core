'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useProject } from '@/lib/podcast/hooks';
import { podcastApi } from '@/lib/podcast/api-client';
import { PodcastLayout } from '../components/PodcastLayout';
import { AudioPlayer } from '../components/AudioPlayer';

function PodcastDownloadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const { user, isLoading: authLoading } = useAuth();
  const { project, isLoading } = useProject(projectId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/podcast/auth/login');
    }
  }, [user, authLoading, router]);

  // Redirect if no project
  useEffect(() => {
    if (!isLoading && !project) {
      router.push('/podcast/dashboard');
    }
  }, [isLoading, project, router]);

  const handleDownload = async () => {
    if (!projectId) return;

    try {
      const response = await podcastApi.downloadAudio(projectId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project?.name || 'podcast'}-ep${project?.episodeNumber}.mp3`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <PodcastLayout currentTab="downloads">
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

  if (!project) {
    return (
      <PodcastLayout currentTab="downloads">
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Project not found</p>
          <Link href="/podcast/dashboard" className="text-purple-400 hover:text-purple-300">
            Back to Dashboard
          </Link>
        </div>
      </PodcastLayout>
    );
  }

  const templateEmoji: Record<string, string> = {
    intro: '▶️',
    outro: '⏹️',
    transition: '⟿',
  };

  const moodEmoji: Record<string, string> = {
    upbeat: '😊',
    calm: '😌',
    dramatic: '😲',
  };

  const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PodcastLayout currentTab="downloads">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/podcast/dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-400">Episode {project.episodeNumber}</p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audio Player Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          {project.audioUrl && project.status === 'completed' ? (
            <AudioPlayer
              src={project.audioUrl}
              title={`${project.name} - Episode ${project.episodeNumber}`}
              onDownload={handleDownload}
            />
          ) : project.status === 'generating' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🎵
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Still Generating</h3>
              <p className="text-gray-400">Your audio is being created. Please check back soon.</p>
            </motion.div>
          ) : project.status === 'failed' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center"
            >
              <div className="text-5xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-red-300 mb-2">Generation Failed</h3>
              <p className="text-gray-400 mb-6">Something went wrong during generation.</p>
              <Link
                href="/podcast/generate"
                className="inline-block px-6 py-3 bg-red-500/30 hover:bg-red-500/50 text-red-300 font-semibold rounded-lg transition-all"
              >
                Try Again
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-2xl bg-gray-500/10 border border-gray-500/30 text-center"
            >
              <div className="text-5xl mb-4">🤔</div>
              <h3 className="text-xl font-bold mb-2">No Audio Available</h3>
              <p className="text-gray-400">Please generate audio for this project.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Project Details */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
            <h3 className="font-bold text-lg mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Template</p>
                <p className="flex items-center gap-2 text-white font-medium">
                  <span className="text-2xl">{templateEmoji[project.template]}</span>
                  <span className="capitalize">{project.template}</span>
                </p>
              </div>
              <div className="border-t border-purple-500/20 pt-3">
                <p className="text-xs text-gray-400 mb-1">Mood</p>
                <p className="flex items-center gap-2 text-white font-medium">
                  <span className="text-2xl">{moodEmoji[project.mood]}</span>
                  <span className="capitalize">{project.mood}</span>
                </p>
              </div>
              <div className="border-t border-purple-500/20 pt-3">
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-white font-medium text-sm">{formattedDate}</p>
              </div>
              <div className="border-t border-purple-500/20 pt-3">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              onClick={handleDownload}
              disabled={!project.audioUrl}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/50"
            >
              ⬇️ Download MP3
            </motion.button>
            <Link
              href="/podcast/generate"
              className="block w-full py-3 border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-purple-200 font-bold rounded-lg text-center transition-all"
            >
              ✨ Create Another
            </Link>
          </div>

          {/* Share Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <h3 className="font-bold text-lg mb-3">Share Project</h3>
            <p className="text-sm text-gray-400 mb-4">
              Share this project link with your team
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/podcast/downloads?projectId=${project.id}`}
                readOnly
                className="flex-1 px-3 py-2 bg-black/50 border border-blue-500/30 rounded-lg text-xs text-gray-300"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/podcast/downloads?projectId=${project.id}`
                  );
                }}
                className="px-3 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 rounded-lg font-medium text-xs transition-all"
              >
                Copy
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/podcast/generate"
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/60 transition-all group"
          >
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
              Generate More
            </h3>
            <p className="text-sm text-gray-400">Create music for another episode</p>
          </Link>

          <Link
            href="/podcast/checkout"
            className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-500/60 transition-all group"
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-green-300 transition-colors">
              Upgrade Plan
            </h3>
            <p className="text-sm text-gray-400">Get unlimited generations</p>
          </Link>

          <Link
            href="/podcast/dashboard"
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-500/60 transition-all group"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors">
              View All Projects
            </h3>
            <p className="text-sm text-gray-400">Return to your dashboard</p>
          </Link>
        </div>
      </motion.div>
    </PodcastLayout>
  );
}

export default function PodcastDownloadsPage() {
  return (
    <Suspense fallback={null}>
      <PodcastDownloadsContent />
    </Suspense>
  );
}
