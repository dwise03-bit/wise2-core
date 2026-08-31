'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CHERRY_TOUR_STEPS, TOUR_STORAGE_KEY } from '@/lib/tour-steps';

interface TourContextValue {
  active: boolean;
  index: number;
  step: (typeof CHERRY_TOUR_STEPS)[number] | null;
  totalSteps: number;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  completed: boolean;
  dismissPrompt: () => void;
  showPrompt: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useCherryTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useCherryTour must be used within TourProvider');
  }
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  const step = active ? CHERRY_TOUR_STEPS[index] ?? null : null;

  useEffect(() => {
    const done = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    setCompleted(done);
    if (!done && pathname.includes('/dashboard')) {
      setShowPrompt(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!step) return;
    if (pathname !== step.route && !pathname.endsWith(step.route)) {
      router.push(step.route);
    }
  }, [step, pathname, router]);

  const start = useCallback(() => {
    setShowPrompt(false);
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setCompleted(true);
  }, []);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current >= CHERRY_TOUR_STEPS.length - 1) {
        setActive(false);
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setCompleted(true);
        return current;
      }
      return current + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setCompleted(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, prev, stop]);

  const value = useMemo(
    () => ({
      active,
      index,
      step,
      totalSteps: CHERRY_TOUR_STEPS.length,
      start,
      stop,
      next,
      prev,
      completed,
      dismissPrompt,
      showPrompt,
    }),
    [active, index, step, start, stop, next, prev, completed, dismissPrompt, showPrompt],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
