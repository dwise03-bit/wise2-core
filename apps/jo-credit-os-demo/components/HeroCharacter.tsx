'use client';

import { useEffect, useState } from 'react';

interface HeroCharacterProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Animated hero character for website welcome section
 * Generates sprite sheet animations using Kling AI
 */
export default function HeroCharacter({
  className = '',
  width = 300,
  height = 300,
}: HeroCharacterProps) {
  const [keyframes, setKeyframes] = useState('');

  useEffect(() => {
    // CSS for hero character animation
    // When sprite sheet is available from Kling, add to public/animations/
    const css = `
      @keyframes hero-entrance {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes hero-float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-15px);
        }
      }

      @keyframes hero-glow {
        0%, 100% {
          filter: drop-shadow(0 0 5px rgba(0, 148, 255, 0.3));
        }
        50% {
          filter: drop-shadow(0 0 15px rgba(0, 148, 255, 0.6));
        }
      }
    `;
    setKeyframes(css);
  }, []);

  return (
    <>
      <style>{keyframes}</style>
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          animation: 'hero-entrance 0.8s ease-out, hero-float 3s ease-in-out infinite 0.8s, hero-glow 2s ease-in-out infinite 1.6s',
        }}
      >
        {/* Placeholder - replace with sprite sheet when ready */}
        <div className="text-8xl animate-bounce">🚀</div>
      </div>
    </>
  );
}

/**
 * Hero sprite sheet metadata (to be populated by Kling)
 * Command: /animate-character ./character.png "entrance animation with celebration"
 */
export const HERO_SPRITE_CONFIG = {
  welcome: {
    spriteUrl: '/animations/hero-welcome-sprite.png',
    frameCount: 32,
    frameWidth: 300,
    frameHeight: 300,
    fps: 12,
    description: 'Character entrance with wave and celebration',
  },
  celebration: {
    spriteUrl: '/animations/hero-celebration-sprite.png',
    frameCount: 24,
    frameWidth: 300,
    frameHeight: 300,
    fps: 12,
    description: 'Happy celebration with jumping and clapping',
  },
};
