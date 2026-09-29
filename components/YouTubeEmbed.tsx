'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl, getVideoThumbnail } from '@/lib/youtube';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: 'video' | 'square';
  autoplay?: boolean;
  showThumbnail?: boolean;
  onPlay?: () => void;
}

/**
 * YouTube Video Embed Component
 * Displays a YouTube video with lazy loading and thumbnail preview
 */
export function YouTubeEmbed({
  videoId,
  title = 'YouTube Video',
  className = '',
  width = '100%',
  height = '100%',
  aspectRatio = 'video',
  autoplay = false,
  showThumbnail = true,
  onPlay,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(!autoplay);

  const aspectRatioClass = aspectRatio === 'square'
    ? 'aspect-square'
    : 'aspect-video';

  const handlePlay = () => {
    setIsLoaded(true);
    setShowPlayButton(false);
    onPlay?.();
  };

  return (
    <motion.div
      className={`relative bg-black rounded-lg overflow-hidden ${aspectRatioClass} ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Thumbnail (before loading) */}
      {!isLoaded && showThumbnail && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={getVideoThumbnail(videoId, 'high')}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Play button overlay */}
          {showPlayButton && (
            <motion.button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="flex items-center justify-center w-16 h-16 bg-[#FF0000] rounded-full"
                whileHover={{ scale: 1.1 }}
              >
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </motion.div>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* YouTube iframe */}
      {isLoaded && (
        <motion.iframe
          src={getYouTubeEmbedUrl(videoId, {
            autoplay: true,
            controls: true,
            modestbranding: true,
            rel: false,
          })}
          title={title}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

export default YouTubeEmbed;
