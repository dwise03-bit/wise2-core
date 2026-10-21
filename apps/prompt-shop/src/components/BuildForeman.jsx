import React, { useEffect, useMemo, useState } from "react";

const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;
const ATLAS_COLUMNS = 8;
const ATLAS_ROWS = 11;

export const FOREMAN_STATES = Object.freeze({
  idle: { row: 0, frames: 6, fps: 3 },
  "running-right": { row: 1, frames: 8, fps: 10 },
  "running-left": { row: 2, frames: 8, fps: 10 },
  waving: { row: 3, frames: 4, fps: 5 },
  jumping: { row: 4, frames: 5, fps: 8 },
  failed: { row: 5, frames: 8, fps: 6 },
  waiting: { row: 6, frames: 6, fps: 3 },
  running: { row: 7, frames: 6, fps: 7 },
  review: { row: 8, frames: 6, fps: 4 },
});

export default function BuildForeman({ state = "idle", size = 144, label = "Build Foreman" }) {
  const animation = FOREMAN_STATES[state] || FOREMAN_STATES.idle;
  const [frame, setFrame] = useState(0);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    setFrame(0);
    if (reducedMotion || animation.frames <= 1) return undefined;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % animation.frames),
      Math.round(1000 / animation.fps),
    );
    return () => window.clearInterval(timer);
  }, [animation.frames, animation.fps, animation.row, reducedMotion]);

  const scale = size / CELL_WIDTH;
  return (
    <div
      className="wt-foreman-sprite"
      role="img"
      aria-label={`${label}, ${state}`}
      data-state={state}
      style={{
        width: size,
        height: Math.round(CELL_HEIGHT * scale),
        backgroundImage: "url('/assets/foreman/build-foreman-runtime.webp')",
        backgroundSize: `${ATLAS_COLUMNS * size}px ${Math.round(ATLAS_ROWS * CELL_HEIGHT * scale)}px`,
        backgroundPosition: `${-frame * size}px ${-Math.round(animation.row * CELL_HEIGHT * scale)}px`,
      }}
    />
  );
}
