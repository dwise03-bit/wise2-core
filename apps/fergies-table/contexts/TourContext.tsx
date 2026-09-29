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
import {
  GUEST_TOUR_KEY,
  GUEST_TOUR_STEPS,
  OWNER_TOUR_KEY,
  OWNER_TOUR_STEPS,
  type FergieTourStep,
} from '@/lib/tour-steps';
import { useOwner } from '@/contexts/OwnerContext';
import { unlockSavoreVoice } from '@/lib/speech';

type TourContextValue = {
  active: boolean;
  index: number;
  step: FergieTourStep | null;
  steps: FergieTourStep[];
  totalSteps: number;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  completed: boolean;
  dismissPrompt: () => void;
  showPrompt: boolean;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useFergieTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useFergieTour must be used within TourProvider');
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOwner } = useOwner();
  const steps = isOwner ? OWNER_TOUR_STEPS : GUEST_TOUR_STEPS;
  const storageKey = isOwner ? OWNER_TOUR_KEY : GUEST_TOUR_KEY;
  const homeRoute = isOwner ? '/business' : '/home';

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  const step = active ? steps[index] ?? null : null;

  useEffect(() => {
    setActive(false);
    setIndex(0);
    const done = localStorage.getItem(storageKey) === 'true';
    setCompleted(done);
  }, [storageKey]);

  useEffect(() => {
    const onHome = pathname === homeRoute || pathname.endsWith(homeRoute);
    if (active) {
      setShowPrompt(false);
      return;
    }
    const done = localStorage.getItem(storageKey) === 'true';
    setShowPrompt(!done && onHome);
  }, [pathname, storageKey, homeRoute, active]);

  useEffect(() => {
    if (!step) return;
    if (pathname !== step.route && !pathname.endsWith(step.route)) {
      router.push(step.route);
    }
  }, [step, pathname, router]);

  const start = useCallback(() => {
    unlockSavoreVoice();
    setShowPrompt(false);
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    localStorage.setItem(storageKey, 'true');
    setCompleted(true);
  }, [storageKey]);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current >= steps.length - 1) {
        setActive(false);
        localStorage.setItem(storageKey, 'true');
        setCompleted(true);
        return current;
      }
      return current + 1;
    });
  }, [steps.length, storageKey]);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(storageKey, 'true');
    setCompleted(true);
  }, [storageKey]);

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
      steps,
      totalSteps: steps.length,
      start,
      stop,
      next,
      prev,
      completed,
      dismissPrompt,
      showPrompt,
    }),
    [active, index, step, steps, start, stop, next, prev, completed, dismissPrompt, showPrompt],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
