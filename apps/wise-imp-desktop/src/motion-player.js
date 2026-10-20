import { resolveMotion } from './imp-motion-catalog.js';

// Vanilla equivalent of the command-center sprite contract. Existing PNG poses
// render immediately; future `sheet` entries use the same frames/duration/once
// metadata without changing companion logic.
export function createMotionPlayer({ image, sheet, catalog }) {
  let animation;
  let timer;
  const clear = () => { animation?.cancel(); clearTimeout(timer); };

  function play(requested, { onComplete } = {}) {
    clear();
    const { id, spec } = resolveMotion(catalog, requested);
    image.className = `pose-${spec.pose || id}${spec.className ? ` ${spec.className}` : ''}`;
    image.style.setProperty('--sprite-bottom-crop', spec.crop || '0%');
    image.style.setProperty('--sprite-clip-path', 'inset(0 0 var(--sprite-bottom-crop, 0%) 0)');

    if (spec.sheet?.src && spec.sheet.frames > 1) {
      image.hidden = true;
      sheet.hidden = false;
      sheet.style.backgroundImage = `url("${spec.sheet.src}")`;
      sheet.style.backgroundSize = `${spec.sheet.frames * 100}% 100%`;
      animation = sheet.animate(
        [{ backgroundPosition: '0 0' }, { backgroundPosition: '100% 0' }],
        { duration: spec.sheet.duration * 1000, iterations: spec.sheet.once ? 1 : Infinity, easing: `steps(${spec.sheet.frames}, end)` }
      );
    } else {
      sheet.hidden = true;
      image.hidden = false;
      image.src = spec.src;
    }
    if (spec.once && onComplete) timer = window.setTimeout(onComplete, spec.duration);
    return spec;
  }

  return { play, stop: clear };
}
