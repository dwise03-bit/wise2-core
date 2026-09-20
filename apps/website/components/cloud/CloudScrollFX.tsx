'use client';

import { useEffect } from 'react';

/** Lightweight scroll-craft for the Cloud landing page. Keeps motion on the compositor. */
export function CloudScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--cloud-scroll-progress', max > 0 ? String(window.scrollY / max) : '0');
      root.style.setProperty('--cloud-scroll-y', `${window.scrollY * -0.08}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onReveal = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = reduced.matches
      ? null
      : new IntersectionObserver(onReveal, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll<HTMLElement>('[data-cloud-reveal]').forEach((element) => {
      if (reduced.matches) element.classList.add('is-visible');
      else observer?.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return <div className="cloud-scroll-rail" aria-hidden="true"><span /></div>;
}
