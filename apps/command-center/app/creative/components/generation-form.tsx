'use client';

import React, { useState } from 'react';

type GenerationType = 'image' | 'video' | 'image_to_video';
type BrandProfile = 'wise2-core' | 'wise2-hvac' | 'wise-defense' | 'wise2-soundlab';
type Quality = 'draft' | 'standard' | 'premium';

export function GenerationForm() {
  const [formData, setFormData] = useState({
    type: 'image' as GenerationType,
    brand: 'wise2-core' as BrandProfile,
    prompt: '',
    style: '',
    quality: 'standard' as Quality,
    count: 1,
    duration: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/v1/creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✓ Generation job ${data.id} queued!`);
        setFormData({
          type: 'image',
          brand: 'wise2-core',
          prompt: '',
          style: '',
          quality: 'standard',
          count: 1,
          duration: 10,
        });
      } else {
        setMessage('✗ Generation failed');
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
          <span className="text-3xl">✨</span>
          Create Generation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Generation Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as GenerationType })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="image">🖼️ Image</option>
              <option value="video">🎬 Video</option>
              <option value="image_to_video">🎨→🎬 Image to Video</option>
            </select>
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Brand Profile
            </label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value as BrandProfile })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="wise2-core">WISE² Core</option>
              <option value="wise2-hvac">WISE² HVAC</option>
              <option value="wise-defense">WISE Defense</option>
              <option value="wise2-soundlab">WISE² SoundLab</option>
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prompt
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Describe what you want to create..."
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-slate-100 focus:border-blue-500 focus:outline-none resize-none h-24"
              required
            ></textarea>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Style (Optional)
            </label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="e.g., cinematic, minimalist, photorealistic"
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Grid Row: Quality, Count, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quality
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value as Quality })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="draft">Draft ($0)</option>
                <option value="standard">Standard ($)</option>
                <option value="premium">Premium ($$)</option>
              </select>
            </div>

            {formData.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {formData.type !== 'image' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (sec)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.startsWith('✓')
                  ? 'bg-green-500/20 text-green-300 border border-green-700/50'
                  : 'bg-red-500/20 text-red-300 border border-red-700/50'
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.prompt}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Submitting...
              </span>
            ) : (
              '✨ Generate'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
