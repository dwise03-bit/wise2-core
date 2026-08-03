'use client';

import { Share2, Mail } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export default function SocialShare({ title, text, url, hashtags = [] }: SocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const hashtagString = hashtags.length > 0 ? ` ${hashtags.map(h => `#${h}`).join(' ')}` : '';
  const shareText = `${text}${hashtagString}`;

  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`,
  };

  const handleShare = (platform: string) => {
    const link = socialLinks[platform as keyof typeof socialLinks];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-neon-red text-black rounded font-semibold hover:bg-opacity-90 transition-all duration-200"
      >
        <Share2 size={18} />
        Share
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-secondary-black border-2 border-neon-red rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
          <button
            onClick={() => {
              handleShare('twitter');
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray hover:text-neon-red hover:bg-gray-900 rounded transition-colors"
          >
            <Share2 size={18} />
            <span>Twitter</span>
          </button>

          <button
            onClick={() => {
              handleShare('linkedin');
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray hover:text-neon-red hover:bg-gray-900 rounded transition-colors"
          >
            <Share2 size={18} />
            <span>LinkedIn</span>
          </button>

          <button
            onClick={() => {
              handleShare('facebook');
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray hover:text-neon-red hover:bg-gray-900 rounded transition-colors"
          >
            <Share2 size={18} />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => {
              handleShare('email');
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray hover:text-neon-red hover:bg-gray-900 rounded transition-colors"
          >
            <Mail size={18} />
            <span>Email</span>
          </button>
        </div>
      )}
    </div>
  );
}
