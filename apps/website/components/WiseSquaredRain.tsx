'use client';

import { useEffect, useRef } from 'react';

/** Quiet W² digital rain. Decorative only; never intercepts site interactions. */
export function WiseSquaredRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let columns: Array<{ x: number; y: number; speed: number; opacity: number; spacing: number }> = [];
    let lastFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Keep plenty of negative space: one quiet stream per ~105px.
      const count = Math.max(2, Math.floor(width / (width < 700 ? 145 : 105)));
      columns = Array.from({ length: count }, (_, i) => ({
        x: (i + 0.25 + Math.random() * 0.5) * width / count,
        y: Math.random() * height,
        speed: 0.17 + Math.random() * 0.30,
        opacity: 0.055 + Math.random() * 0.055,
        spacing: 49 + Math.random() * 31,
      }));
    };

    const draw = (time: number) => {
      frame = window.requestAnimationFrame(draw);
      if (document.hidden || time - lastFrame < 32) return; // maximum ~30fps
      const delta = Math.min(time - (lastFrame || time), 64);
      lastFrame = time;
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 14px ui-monospace, SFMono-Regular, Menlo, monospace';
      for (const stream of columns) {
        stream.y += stream.speed * delta;
        if (stream.y > height + 200) stream.y = -120;
        for (let i = 0; i < 5; i++) {
          const y = stream.y - i * stream.spacing;
          if (y < -30 || y > height + 30) continue;
          ctx.fillStyle = 'rgba(82, 200, 133, ' + (stream.opacity * (1 - i / 5)).toFixed(3) + ')';
          ctx.fillText('W²', stream.x, y);
        }
      }
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-20" style={{ opacity: 0.75 }} />;
}
