import type { MascotState } from './useWiseImpStore';

/**
 * Route-aware companion context.
 *
 * Ported from the Aug 15 partner handoff snapshot, which carried richer
 * per-route greetings and page tours than the small PAGE_HINTS map this
 * component started with. The behaviour is kept; the snapshot's monolithic
 * ChatWidget architecture is not, so the intake flow and the existing
 * /api/wise-imp/* contract stay untouched.
 */

/** Full greeting shown when the panel opens on a given route. */
export function pageGreeting(pathname: string): string {
  if (pathname === '/book/print')
    return "I'm with you in the print shop. I can explain DTF options, artwork prep, quantities, and what to include before you submit.";
  if (pathname === '/book/detailing')
    return "I can help scope your detail. Tell me the vehicle, condition, and the result you want, and I'll point you toward the right package.";
  if (pathname === '/piff-city')
    return 'Welcome to PIFF CITY Vandals. I can explain DTF transfers, custom apparel, gang sheets, and how to start a print request.';
  if (pathname === '/wise-shine')
    return 'Welcome to WISE SHINE. I can explain the detailing packages, WISE TOUCH products, or help you start a booking.';
  if (pathname === '/contact')
    return "Choose a lane and I'll help route you: WISE² systems, PIFF printing, WISE SHINE detailing, or Sound Labs.";
  if (pathname === '/pricing') return 'Happy to help you figure out which plan makes sense.';
  if (pathname === '/consulting')
    return "You're looking at consulting services — want the short version of which one fits?";
  if (pathname === '/audit')
    return "The AI Business Audit is a good first step if you're not sure where to start.";
  if (pathname === '/sound-labs')
    return 'Sound Labs is the creative side — I can walk you through creation, engineering, and publishing.';
  if (pathname.startsWith('/intake'))
    return 'I can help you shape your project brief before you submit it.';
  if (pathname.includes('service'))
    return "Tell me what you want to build and I'll help narrow down the right service.";
  return "I'm Wise Imp — your guide to WISE². Tell me what you're trying to build.";
}

/**
 * Elements the companion may visit while idling on each route.
 *
 * Selectors are scoped to `main` so the companion never points at its own UI
 * or at site chrome. Anything not listed falls back to the generic tour.
 */
export const PAGE_TOURS: Record<string, string[]> = {
  '/': [
    'main a[href="/audit"]',
    'main a[href="/platform"]',
    'main a[href="/pricing"]',
    'main a[href="/consulting"]',
    'main a[href="/powered-businesses"]',
  ],
  '/pricing': ['main a[href*="plan="]', 'main a[href="/contact"]'],
  '/platform': ['main h1', 'main h2', 'main a[href="/audit"]'],
  '/sound-labs': ['main h1', 'main h2'],
  '/audit': ['main h1', 'main h2', 'main button[type="submit"]'],
  '/contact': ['main h1', 'main form', 'main a[href="/audit"]'],
  '/piff-city': ['main h1', 'main a[href="/book/print"]', 'main h2'],
  '/wise-shine': ['main h1', 'main a[href="/book/detailing"]', 'main h2'],
  '/book/print': [
    'main h1',
    'main select[required]',
    'main input[type="file"]',
    'main button[type="submit"]',
  ],
  '/book/detailing': [
    'main h1',
    'main select[required]',
    'main input[type="file"]',
    'main button[type="submit"]',
  ],
};

export const GENERIC_TOUR: string[] = [
  'main h1',
  'main h2',
  'main a[href="/contact"]',
  'main a[href="/audit"]',
];

export function tourSelectors(pathname: string): string[] {
  return PAGE_TOURS[pathname] ?? GENERIC_TOUR;
}

/**
 * The handoff snapshot drove motion from an eight-frame sprite sheet. This
 * component already ships four hand-drawn poses per colour as webp, so the
 * tour reuses those instead of introducing a second, stylistically different
 * asset. Behaviour is preserved; the art system is not duplicated.
 */
export const TOUR_STATES: MascotState[] = ['wave', 'idle', 'thinking', 'celebrate'];

/** Short line spoken when the companion arrives at an element. */
export function targetReaction(state: MascotState, label: string): string {
  const trimmed = label.length > 60 ? `${label.slice(0, 57)}…` : label;
  if (state === 'wave') return `Look — ${trimmed}.`;
  if (state === 'thinking') return `Curious about ${trimmed}?`;
  if (state === 'celebrate') return `Oh! ${trimmed}.`;
  return `I'm checking out ${trimmed}.`;
}
