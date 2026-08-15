'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MascotState } from './useWiseImpStore';
import { TOUR_STATES, targetReaction, tourSelectors } from './pageContext';

export interface TourStop {
  /** Viewport coordinates for the companion, already collision-adjusted. */
  top: number;
  left: number;
  state: MascotState;
  label: string;
  reaction: string;
}

const STEP_MS = 7000;
/**
 * Minimum width for roaming. Below this there is no room to sit beside an
 * element without covering it. Chosen from real windows: 900 excluded an
 * ordinary 894px Chrome window, which is well above tablet portrait.
 */
const MIN_WIDTH = 820;
const IMP_SIZE = 72;
const GUTTER = 16;

/**
 * Idle page tour.
 *
 * The companion drifts to interesting elements on the current route, points at
 * them, and says one short line. It is a character layer on top of the
 * assistant, not a replacement for it.
 *
 * Deliberate constraints, all from the handoff's behaviour rules:
 *  - Never runs while the panel is open — the assistant takes priority.
 *  - Never runs under prefers-reduced-motion.
 *  - Never runs on narrow viewports, where there is no room to move without
 *    covering content.
 *  - Positions beside a target, never over it, and clamps to the viewport.
 *  - Skips targets that are offscreen, too large, or unlabelled.
 */
export function useImpTour(pathname: string, panelOpen: boolean): TourStop | null {
  const [stop, setStop] = useState<TourStop | null>(null);
  const [wideEnough, setWideEnough] = useState(false);
  const stepRef = useRef(0);
  const selectors = useMemo(() => tourSelectors(pathname), [pathname]);

  // Width lives in state, not in a ref read once inside the effect, so that
  // widening a window actually restarts the tour instead of leaving it off
  // until the next navigation.
  useEffect(() => {
    const measure = () => setWideEnough(window.innerWidth >= MIN_WIDTH);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    // Reset when the route changes so a stop from the previous page never
    // lingers over unrelated content.
    stepRef.current = 0;
    setStop(null);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (panelOpen) {
      setStop(null);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tooNarrow = () => window.innerWidth < 900;

    if (reduceMotion.matches || tooNarrow()) {
      setStop(null);
      return;
    }

    const visit = () => {
      const candidates = selectors
        .flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)))
        .filter((element, index, all) => {
          if (all.indexOf(element) !== index) return false;
          // Never point at the companion's own UI.
          if (element.closest('[data-wise-imp]')) return false;

          const label =
            element.getAttribute('aria-label') ||
            element.getAttribute('alt') ||
            element.innerText?.trim();
          if (!label || label.length > 110) return false;

          const rect = element.getBoundingClientRect();
          return (
            rect.width >= 24 &&
            rect.height >= 20 &&
            rect.width <= 620 &&
            rect.height <= 440 &&
            rect.top > 80 &&
            rect.bottom < window.innerHeight - 80
          );
        });

      if (candidates.length === 0) {
        setStop(null);
        return;
      }

      const step = stepRef.current++;
      const element = candidates[step % candidates.length];
      const rect = element.getBoundingClientRect();
      const state = TOUR_STATES[step % TOUR_STATES.length];
      const label =
        element.getAttribute('aria-label') ||
        element.getAttribute('alt') ||
        element.innerText?.trim() ||
        'this';

      // Prefer the right of the target; fall back to the left when that would
      // leave the viewport. Never overlap the element itself.
      const rightOf = rect.right + GUTTER;
      const fitsRight = rightOf + IMP_SIZE < window.innerWidth - GUTTER;
      const left = fitsRight
        ? rightOf
        : Math.max(GUTTER, rect.left - IMP_SIZE - GUTTER);

      const top = Math.min(
        Math.max(GUTTER + 64, rect.top + rect.height / 2 - IMP_SIZE / 2),
        window.innerHeight - IMP_SIZE - GUTTER,
      );

      setStop({ top, left, state, label, reaction: targetReaction(state, label) });
    };

    visit();
    const timer = window.setInterval(visit, STEP_MS);

    const onMotionChange = () => {
      if (reduceMotion.matches) setStop(null);
    };
    reduceMotion.addEventListener('change', onMotionChange);

    return () => {
      window.clearInterval(timer);
      reduceMotion.removeEventListener('change', onMotionChange);
    };
  }, [selectors, panelOpen, pathname, wideEnough]);

  return stop;
}
