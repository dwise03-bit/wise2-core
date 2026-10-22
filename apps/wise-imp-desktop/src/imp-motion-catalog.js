// Portable character-motion contract. Visual companions replace this catalog;
// task orchestration remains unaware of their art.
export function createImpMotionCatalog(base) {
  const asset = (name) => `${base}assets/${name}`;
  return {
    idle: { src: asset('idle_hover.png'), crop: '22%', pose: 'idle', loop: true },
    left: { src: asset('fly_left.png'), crop: '0%', pose: 'left' },
    right: { src: asset('fly_right.png'), crop: '0%', pose: 'right' },
    land: { src: asset('land_perch.png'), crop: '22%', pose: 'land' },
    sit: { fallback: 'land' },
    sleep: { src: asset('sleep.png'), crop: '53%', pose: 'sleep' },
    click: { src: asset('click_react.png'), crop: '50%', pose: 'click' },
    drag: { src: asset('drag_dangle.png'), crop: '0%', pose: 'drag' },
    look: { fallback: 'idle', className: 'motion-look', once: true, duration: 1100 },
    fidget: { fallback: 'idle', className: 'motion-fidget', once: true, duration: 1300 },
    hover: { fallback: 'right', className: 'motion-hover', once: true, duration: 1200 },
    thinking: {
      // The approved pose pack is the visual source of truth. Keep task
      // feedback expressive with CSS motion until an animator supplies a
      // reviewed IMP-only frame sequence.
      fallback: 'idle',
      className: 'motion-thinking',
      loop: true
    },
    working: {
      fallback: 'idle',
      className: 'motion-working',
      loop: true
    },
    success: { fallback: 'click', className: 'motion-celebrate', once: true, duration: 1100 },
    error: { fallback: 'land', className: 'motion-error', once: true, duration: 800 }
  };
}

export function resolveMotion(catalog, requested) {
  const seen = new Set();
  let id = requested;
  while (catalog[id]?.fallback && !seen.has(id)) {
    seen.add(id);
    id = catalog[id].fallback;
  }
  return { id, spec: { ...catalog[id], ...catalog[requested] } };
}
