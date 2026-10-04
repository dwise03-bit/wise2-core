'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  src: string;
}

interface PlayerState {
  current: Track | null;
  isPlaying: boolean;
  progress: number; // 0..1
  play: (t: Track) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  setQueue: (tracks: Track[]) => void;
  queue: Track[];
}

const Ctx = createContext<PlayerState | null>(null);

export function useStudioPlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStudioPlayer must be used within StudioPlayerProvider');
  return ctx;
}

export function StudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = new Audio();
    a.preload = 'metadata';
    audioRef.current = a;
    const onTime = () => a.duration && setProgress(a.currentTime / a.duration);
    const onEnd = () => setIsPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => {
      a.pause();
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  const play = useCallback((t: Track) => {
    const a = audioRef.current;
    if (!a) return;
    if (current?.id !== t.id) {
      a.src = t.src;
      setCurrent(t);
      setProgress(0);
    }
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [current?.id]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) {
      if (queue[0]) play(queue[0]);
      return;
    }
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [current, isPlaying, play, queue]);

  const step = useCallback((dir: 1 | -1) => {
    if (!queue.length) return;
    const idx = current ? queue.findIndex((t) => t.id === current.id) : -1;
    const nextIdx = (idx + dir + queue.length) % queue.length;
    play(queue[nextIdx]);
  }, [current, play, queue]);

  const seek = useCallback((ratio: number) => {
    const a = audioRef.current;
    if (a && a.duration) {
      a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
      setProgress(ratio);
    }
  }, []);

  const value = useMemo<PlayerState>(() => ({
    current,
    isPlaying,
    progress,
    play,
    toggle,
    next: () => step(1),
    prev: () => step(-1),
    seek,
    setQueue: setQueueState,
    queue,
  }), [current, isPlaying, progress, play, toggle, step, seek, queue]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
