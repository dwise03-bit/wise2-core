'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useProject } from '@/lib/podcast/hooks';
import { podcastApi, type GenerationRequest } from '@/lib/podcast/api-client';
import { PodcastLayout } from '../components/PodcastLayout';
import { TemplateCard, MoodCard, type Template, type Mood } from '../components/TemplateCard';

export default function PodcastGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const { user, isLoading: authLoading } = useAuth();
  const { project, isLoading: projectLoading } = useProject(projectId);

  const [step, setStep] = useState<'details' | 'template' | 'mood' | 'generating'>(
    projectId ? 'template' : 'details'
  );
  const [formData, setFormData] = useState({
    projectName: project?.name || '',
    episodeNumber: project?.episodeNumber || 1,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    (project?.template as Template) || 'intro'
  );
  const [selectedMood, setSelectedMood] = useState<Mood>((project?.mood as Mood) || 'upbeat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/podcast/auth/login');
    }
  }, [user, authLoading, router]);

  // Update form when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.name,
        episodeNumber: project.episodeNumber,
      });
      setSelectedTemplate(project.template as Template);
      setSelectedMood(project.mood as Mood);
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'episodeNumber' ? parseInt(value) || 1 : value,
    }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const payload: GenerationRequest = {
        projectName: formData.projectName,
        episodeNumber: formData.episodeNumber,
        template: selectedTemplate,
        mood: selectedMood,
      };

      await podcastApi.createProject(payload);
      setStep('template');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleGenerate = async () => {
    if (!projectId && !formData.projectName) {
      setError('Please create a project first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setStep('generating');

    try {
      // Simulate progress tracking
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        setGenerationProgress(progress);
      }, 300);

      // Call generation API
      const newProjectId = projectId || formData.projectName;
      const response = await podcastApi.generateAudio(newProjectId);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Redirect to downloads page
      setTimeout(() => {
        router.push(`/podcast/downloads?projectId=${newProjectId}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
      setStep('mood');
    }
  };

  if (authLoading || projectLoading) {
    return (
      <PodcastLayout currentTab="generate">
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

  return (
    <PodcastLayout currentTab="generate">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Generate Podcast Music</h1>
        <p className="text-gray-400">
          {step === 'details' && 'Step 1: Enter your project details'}
          {step === 'template' && 'Step 2: Choose a music template'}
          {step === 'mood' && 'Step 3: Select the mood'}
          {step === 'generating' && 'Generating your audio...'}
        </p>
      </motion.div>

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

      {/* Step 1: Project Details */}
      {step === 'details' && (
        <motion.form
          onSubmit={handleCreateProject}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl"
        >
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-8 space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                Podcast Name
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="e.g., Tech Talks Daily"
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Episode Number */}
            <div>
              <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-300 mb-2">
                Episode Number
              </label>
              <input
                id="episodeNumber"
                name="episodeNumber"
                type="number"
                min="1"
                value={formData.episodeNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/50"
              >
                Next Step
              </motion.button>
            </div>
          </div>
        </motion.form>
      )}

      {/* Step 2: Template Selection */}
      {step === 'template' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <TemplateCard
              template="intro"
              selected={selectedTemplate === 'intro'}
              onClick={() => setSelectedTemplate('intro')}
            />
            <TemplateCard
              template="outro"
              selected={selectedTemplate === 'outro'}
              onClick={() => setSelectedTemplate('outro')}
            />
            <TemplateCard
              template="transition"
              selected={selectedTemplate === 'transition'}
              onClick={() => setSelectedTemplate('transition')}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <motion.button
              onClick={() => setStep('details')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300 font-bold rounded-lg transition-all"
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => setStep('mood')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/50"
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Mood Selection */}
      {step === 'mood' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MoodCard
              mood="upbeat"
              selected={selectedMood === 'upbeat'}
              onClick={() => setSelectedMood('upbeat')}
            />
            <MoodCard
              mood="calm"
              selected={selectedMood === 'calm'}
              onClick={() => setSelectedMood('calm')}
            />
            <MoodCard
              mood="dramatic"
              selected={selectedMood === 'dramatic'}
              onClick={() => setSelectedMood('dramatic')}
            />
          </div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8"
          >
            <h3 className="font-bold text-lg mb-4">Generation Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Podcast Name:</span>
                <span className="text-white font-medium">{formData.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Episode:</span>
                <span className="text-white font-medium">#{formData.episodeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Template:</span>
                <span className="text-white font-medium capitalize">{selectedTemplate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mood:</span>
                <span className="text-white font-medium capitalize">{selectedMood}</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <motion.button
              onClick={() => setStep('template')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300 font-bold rounded-lg transition-all"
            >
              Back
            </motion.button>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/50"
            >
              {isGenerating ? 'Generating...' : '✨ Generate Audio'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Generating */}
      {step === 'generating' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-16"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🎵
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Generating Your Audio</h2>
            <p className="text-gray-400 mb-8">
              Creating {selectedTemplate} music with {selectedMood} mood...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-black/50 rounded-full h-3 mb-4 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-400">{Math.round(generationProgress)}%</p>
          </div>
        </motion.div>
      )}
    </PodcastLayout>
  );
}
