'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DEMO_VIDEOS, getAllCategories, getVideosByCategory } from '@/lib/youtube';
import YouTubeEmbed from './YouTubeEmbed';

interface YouTubeGalleryProps {
  className?: string;
  columns?: number;
  showCategories?: boolean;
  defaultCategory?: string | null;
}

/**
 * YouTube Video Gallery Component
 * Displays a collection of tutorial and demo videos with category filtering
 */
export function YouTubeGallery({
  className = '',
  columns = 3,
  showCategories = true,
  defaultCategory = null,
}: YouTubeGalleryProps) {
  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(defaultCategory);

  const displayVideos = selectedCategory
    ? getVideosByCategory(selectedCategory)
    : DEMO_VIDEOS;

  const containerClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`w-full ${className}`}>
      {/* Category Filter */}
      {showCategories && categories.length > 0 && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-[#0055FF] text-white'
                  : 'bg-[#0055FF]/10 text-[#0055FF] hover:bg-[#0055FF]/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </motion.button>

            {categories.map((category, i) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#0055FF] text-white'
                    : 'bg-[#0055FF]/10 text-[#0055FF] hover:bg-[#0055FF]/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Video Grid */}
      {displayVideos.length > 0 ? (
        <motion.div
          className={`grid ${containerClass} gap-8`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {displayVideos.map((video, i) => (
            <motion.div
              key={video.id}
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Video Player */}
              <YouTubeEmbed
                videoId={video.id}
                title={video.title}
                className="mb-4"
              />

              {/* Video Info */}
              <div className="flex-1">
                {video.category && (
                  <span className="inline-block px-3 py-1 bg-[#0055FF]/10 text-[#0055FF] text-xs font-semibold rounded-full mb-2">
                    {video.category}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-2">{video.title}</h3>
                <p className="text-sm text-[#C5C5C5] mb-3">{video.description}</p>

                {video.duration && (
                  <p className="text-xs text-[#C5C5C5]/60">Duration: {video.duration}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[#C5C5C5]">No videos found in this category.</p>
        </motion.div>
      )}
    </div>
  );
}

export default YouTubeGallery;
