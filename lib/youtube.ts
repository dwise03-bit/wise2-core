/**
 * YouTube Integration Utilities
 * Handles YouTube video embeds and channel links
 */

export const YOUTUBE_CONFIG = {
  channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'UCwise2channel',
  channelUrl: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@wise2channel',
  demoVideoId: process.env.NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID || 'dQw4w9WgXcQ',
  playlistId: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID || 'PLwise2tutorials',
  apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
};

/**
 * Build YouTube video embed URL
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: boolean;
}) {
  const params = new URLSearchParams();

  if (options?.autoplay) params.append('autoplay', '1');
  if (options?.controls === false) params.append('controls', '0');
  if (options?.modestbranding) params.append('modestbranding', '1');
  if (options?.rel === false) params.append('rel', '0');

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
}

/**
 * Build YouTube channel URL
 */
export function getChannelUrl() {
  return YOUTUBE_CONFIG.channelUrl;
}

/**
 * Build YouTube playlist URL
 */
export function getPlaylistUrl(playlistId?: string) {
  const id = playlistId || YOUTUBE_CONFIG.playlistId;
  return `https://www.youtube.com/playlist?list=${id}`;
}

/**
 * Build YouTube video thumbnail URL
 */
export function getVideoThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high') {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Generate structured data for video
 */
export function getVideoStructuredData(data: {
  title: string;
  description: string;
  videoId: string;
  duration?: string;
  uploadDate?: string;
  viewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.title,
    description: data.description,
    videoUrl: `https://www.youtube.com/watch?v=${data.videoId}`,
    thumbnailUrl: [getVideoThumbnail(data.videoId, 'high')],
    uploadDate: data.uploadDate,
    duration: data.duration,
    interactionCount: data.viewCount ? `${data.viewCount}` : undefined,
  };
}

/**
 * Video gallery data structure
 */
export interface VideoGalleryItem {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
}

/**
 * Sample tutorial videos
 */
export const DEMO_VIDEOS: VideoGalleryItem[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Getting Started with WISE²',
    description: 'Learn the basics of WISE² and how to set up your first project',
    category: 'Getting Started',
    duration: '5:32',
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Audio Production Basics',
    description: 'Master the fundamentals of audio mixing and production',
    category: 'Audio',
    duration: '12:45',
  },
  {
    id: 'W7qWa52k-nE',
    title: 'Brand Design System',
    description: 'Create a cohesive brand identity using our design system',
    category: 'Design',
    duration: '8:20',
  },
  {
    id: '9bZkp7q19f0',
    title: 'Advanced Automation',
    description: 'Automate your workflow and save hours every week',
    category: 'Advanced',
    duration: '15:10',
  },
];

/**
 * Get videos by category
 */
export function getVideosByCategory(category: string): VideoGalleryItem[] {
  return DEMO_VIDEOS.filter(video => video.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(DEMO_VIDEOS.map(v => v.category).filter(Boolean))) as string[];
}
