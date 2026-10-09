'use client';

import { useEffect } from 'react';

export default function BackgroundMusicPlayer() {
  useEffect(() => {
    // Create audio element directly in DOM
    const audio = new Audio();
    audio.src = '/music/blakkhail-ambient.mp3';
    audio.volume = 0.25;
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    
    // Try to play
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✓ Background music playing');
        })
        .catch((error) => {
          console.warn('Music autoplay blocked by browser:', error.message);
          // Try again on user interaction
          document.addEventListener('click', () => audio.play(), { once: true });
          document.addEventListener('scroll', () => audio.play(), { once: true });
        });
    }
    
    return () => {
      audio.pause();
    };
  }, []);

  return null; // Component doesn't render anything visible
}
