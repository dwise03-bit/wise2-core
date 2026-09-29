'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Accessibility utilities for WISE² Studio
 * WCAG AA+ compliant helpers: focus management, ARIA, keyboard, contrast, screen readers
 */

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Focusable element selector — matches all naturally focusable/interactive elements
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'summary',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (
  container: HTMLElement | Document = document
): HTMLElement[] => {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  // Filter out elements that are hidden or have display: none
  return elements.filter((el) => {
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      el.offsetParent !== null
    );
  });
};

/**
 * Trap focus within a container (for modals, dialogs, dropdowns)
 * Returns cleanup function to remove trap
 *
 * @example
 * useEffect(() => {
 *   if (isModalOpen) return trapFocus(modalRef.current);
 * }, [isModalOpen]);
 */
export const trapFocus = (container: HTMLElement | null): (() => void) => {
  if (!container) return () => {};

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Store the previously focused element to restore later
  const previouslyFocused = document.activeElement as HTMLElement;

  // Focus first element
  firstElement.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    // Restore focus to previously focused element
    previouslyFocused?.focus();
  };
};

/**
 * React hook for trapping focus within a ref'd container
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen);
 */
export const useFocusTrap = (
  ref: React.RefObject<HTMLElement>,
  isActive: boolean
) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;
    return trapFocus(ref.current);
  }, [isActive, ref]);
};

/**
 * Hook to restore focus to a triggering element after a modal/dialog closes
 *
 * @example
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * const { saveFocus, restoreFocus } = useFocusRestore();
 * // On open: saveFocus()
 * // On close: restoreFocus()
 */
export const useFocusRestore = () => {
  const savedFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    savedFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    savedFocusRef.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
};

/**
 * Move focus to an element by ref or selector, with optional delay
 * for elements that mount asynchronously
 */
export const focusElement = (
  target: HTMLElement | string | null,
  delay: number = 0
): void => {
  const focus = () => {
    const element =
      typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)
        : target;
    element?.focus();
  };

  if (delay > 0) {
    setTimeout(focus, delay);
  } else {
    focus();
  }
};

/**
 * Hook that focuses an element on mount
 * Useful for auto-focusing the first field in a form or the heading of a new page
 */
export const useAutoFocus = <T extends HTMLElement>(
  shouldFocus: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  return ref;
};

/**
 * Detect keyboard vs mouse navigation for focus-visible styling
 * Adds/removes a `using-keyboard` class on <body> for CSS targeting
 */
export const initKeyboardFocusDetection = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  };

  const handleMouseDown = () => {
    document.body.classList.remove('using-keyboard');
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('mousedown', handleMouseDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handleMouseDown);
  };
};

// ============================================================================
// FOCUS RING STYLING (electric blue per WISE² brand)
// ============================================================================

/**
 * Tailwind classes for a visible, WCAG-compliant focus indicator
 * Uses the WISE² electric blue accent (#00D9FF) at 3:1+ contrast against dark bg
 */
export const focusRingClasses =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wise-electric focus-visible:ring-offset-2 focus-visible:ring-offset-wise-bg';

/**
 * Focus ring for elements on light/inverted backgrounds
 */
export const focusRingClassesInverted =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wise-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white';

// ============================================================================
// ARIA HELPERS
// ============================================================================

/**
 * Generate a stable, unique ID for ARIA relationships (labels, descriptions)
 * Falls back gracefully for SSR (React 18's useId is preferred where available)
 */
let idCounter = 0;
export const generateA11yId = (prefix: string = 'wise2'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now().toString(36)}`;
};

/**
 * Build common ARIA attribute sets for interactive components
 */
export const ariaAttributes = {
  /** For a button that toggles expanded content (accordion, dropdown) */
  expandable: (isExpanded: boolean, controlsId?: string) => ({
    'aria-expanded': isExpanded,
    ...(controlsId ? { 'aria-controls': controlsId } : {}),
  }),

  /** For a modal/dialog container */
  dialog: (labelId: string, descriptionId?: string) => ({
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': labelId,
    ...(descriptionId ? { 'aria-describedby': descriptionId } : {}),
  }),

  /** For a form field with an associated error message */
  invalidField: (isInvalid: boolean, errorId?: string) => ({
    'aria-invalid': isInvalid,
    ...(isInvalid && errorId ? { 'aria-describedby': errorId } : {}),
  }),

  /** For a required form field */
  required: (isRequired: boolean) => ({
    'aria-required': isRequired,
  }),

  /** For a currently selected/active item in a list, tab, or nav */
  current: (
    isCurrent: boolean,
    type: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' = 'page'
  ) => ({
    'aria-current': isCurrent ? type : undefined,
  }),

  /** For a live region that should be announced to screen readers */
  liveRegion: (
    politeness: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
  ) => ({
    role: 'status' as const,
    'aria-live': politeness,
    'aria-atomic': atomic,
  }),

  /** For a busy/loading state */
  busy: (isBusy: boolean) => ({
    'aria-busy': isBusy,
  }),

  /** For a disabled interactive element that must remain in the tab order (visual explanation) */
  disabled: (isDisabled: boolean, describedById?: string) => ({
    'aria-disabled': isDisabled,
    ...(isDisabled && describedById ? { 'aria-describedby': describedById } : {}),
  }),

  /** For a hidden decorative element (icons paired with visible text) */
  decorative: () => ({
    'aria-hidden': true,
  }),

  /** For a visually-hidden but screen-reader-accessible label */
  labelOnly: (label: string) => ({
    'aria-label': label,
  }),

  /** For a tab within a tablist */
  tab: (isSelected: boolean, panelId: string) => ({
    role: 'tab' as const,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    tabIndex: isSelected ? 0 : -1,
  }),

  /** For a tabpanel associated with a tab */
  tabPanel: (tabId: string) => ({
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
  }),
} as const;

/**
 * Visually-hidden (screen-reader-only) Tailwind class
 * Content remains accessible to assistive tech but invisible on screen
 */
export const srOnlyClass =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]';

/**
 * Reveals sr-only content on focus (for skip links)
 */
export const srOnlyFocusableClass =
  'focus:absolute focus:w-auto focus:h-auto focus:p-3 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:[clip:auto] focus:z-[100]';

// ============================================================================
// SKIP LINKS
// ============================================================================

/**
 * Standard skip-link targets for WISE² Studio layouts
 */
export const skipLinkTargets = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'main-navigation', label: 'Skip to navigation' },
  { id: 'footer', label: 'Skip to footer' },
] as const;

/**
 * Tailwind classes for a skip link (hidden until focused)
 */
export const skipLinkClasses = `${srOnlyClass} ${srOnlyFocusableClass} bg-wise-primary text-white rounded-md focus:top-2 focus:left-2 focus:ring-2 focus:ring-wise-electric`;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

export interface KeyboardShortcut {
  /** Key to match, e.g. 'k', 'Escape', 'Tab' */
  key: string;
  /** Require ⌘ (Mac) or Ctrl (Windows/Linux) */
  meta?: boolean;
  /** Require Ctrl explicitly (use meta for cross-platform ⌘/Ctrl) */
  ctrl?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Require Alt/Option */
  alt?: boolean;
  handler: KeyboardShortcutHandler;
  /** Prevent default browser behavior (recommended for most shortcuts) */
  preventDefault?: boolean;
  /** Disable while an input/textarea is focused */
  ignoreInInputs?: boolean;
}

const isTypingContext = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
};

/**
 * Register global keyboard shortcuts
 * Returns a cleanup function
 *
 * @example
 * useEffect(() => registerKeyboardShortcuts([
 *   { key: 'k', meta: true, handler: () => openCommandPalette(), preventDefault: true },
 *   { key: 'Escape', handler: () => closeModal() },
 * ]), []);
 */
export const registerKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[]
): (() => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const metaMatches = shortcut.meta
        ? e.metaKey || e.ctrlKey // ⌘ on Mac, Ctrl on Windows/Linux
        : true;
      const ctrlMatches = shortcut.ctrl ? e.ctrlKey : true;
      const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey || shortcut.shift === undefined;
      const altMatches = shortcut.alt ? e.altKey : true;
      const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (shortcut.ignoreInInputs && isTypingContext(e.target)) {
        continue;
      }

      if (keyMatches && metaMatches && ctrlMatches && altMatches) {
        if (shortcut.preventDefault) {
          e.preventDefault();
        }
        shortcut.handler(e);
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
};

/**
 * React hook for keyboard shortcuts, with automatic cleanup
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', meta: true, handler: () => setCommandPaletteOpen(true), preventDefault: true },
 *   { key: 'Escape', handler: () => setCommandPaletteOpen(false) },
 * ]);
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    return registerKeyboardShortcuts(shortcuts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(shortcuts.map((s) => [s.key, s.meta, s.ctrl, s.shift, s.alt]))]);
};

/**
 * Common WISE² Studio keyboard shortcuts (documented convention)
 */
export const STANDARD_SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', meta: true, label: '⌘K / Ctrl+K' },
  ESCAPE: { key: 'Escape', label: 'Esc' },
  SEARCH: { key: '/', label: '/' },
  SAVE: { key: 's', meta: true, label: '⌘S / Ctrl+S' },
  NEW: { key: 'n', meta: true, label: '⌘N / Ctrl+N' },
  HELP: { key: '?', shift: true, label: '?' },
  NEXT: { key: 'ArrowDown', label: '↓' },
  PREVIOUS: { key: 'ArrowUp', label: '↑' },
  TAB_FORWARD: { key: 'Tab', label: 'Tab' },
  TAB_BACKWARD: { key: 'Tab', shift: true, label: 'Shift+Tab' },
} as const;

/**
 * Hook that closes a component (modal, dropdown, popover) on Escape key
 *
 * @example
 * useEscapeKey(() => setIsOpen(false), isOpen);
 */
export const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isActive]);
};

/**
 * Hook for ⌘K / Ctrl+K command palette pattern
 *
 * @example
 * useCommandPaletteShortcut(() => setIsPaletteOpen(true));
 */
export const useCommandPaletteShortcut = (onTrigger: () => void) => {
  useKeyboardShortcuts([
    { key: 'k', meta: true, handler: onTrigger, preventDefault: true },
  ]);
};

/**
 * Hook to enable arrow-key navigation within a list of items (roving tabindex pattern)
 * Returns the active index and key handler to attach to the container
 *
 * @example
 * const { activeIndex, onKeyDown } = useRovingIndex(items.length);
 */
export const useRovingIndex = (
  itemCount: number,
  options: { loop?: boolean; orientation?: 'horizontal' | 'vertical' | 'both' } = {}
) => {
  const { loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isNext =
        (orientation !== 'horizontal' && e.key === 'ArrowDown') ||
        (orientation !== 'vertical' && e.key === 'ArrowRight');
      const isPrev =
        (orientation !== 'horizontal' && e.key === 'ArrowUp') ||
        (orientation !== 'vertical' && e.key === 'ArrowLeft');

      if (isNext) {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          if (next >= itemCount) return loop ? 0 : prev;
          return next;
        });
      } else if (isPrev) {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          if (next < 0) return loop ? itemCount - 1 : prev;
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(itemCount - 1);
      }
    },
    [itemCount, loop, orientation]
  );

  return { activeIndex, setActiveIndex, onKeyDown };
};

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

let liveRegionPolite: HTMLDivElement | null = null;
let liveRegionAssertive: HTMLDivElement | null = null;

const ensureLiveRegion = (
  politeness: 'polite' | 'assertive'
): HTMLDivElement => {
  const existingRegion = politeness === 'polite' ? liveRegionPolite : liveRegionAssertive;
  if (existingRegion && document.body.contains(existingRegion)) {
    return existingRegion;
  }

  const region = document.createElement('div');
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  region.className = srOnlyClass
    .split(' ')
    .concat(`wise2-live-region-${politeness}`)
    .join(' ');
  // Apply visually-hidden styles inline as a fallback (Tailwind class may not be
  // present if consumer's build purges dynamically-injected DOM nodes)
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });

  document.body.appendChild(region);

  if (politeness === 'polite') {
    liveRegionPolite = region;
  } else {
    liveRegionAssertive = region;
  }

  return region;
};

/**
 * Announce a message to screen readers via a live region
 * Use 'polite' for non-urgent updates (default), 'assertive' for critical/urgent ones
 *
 * @example
 * announce('3 items added to cart');
 * announce('Error: unable to save changes', 'assertive');
 */
export const announce = (
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void => {
  if (typeof document === 'undefined') return;

  const region = ensureLiveRegion(politeness);

  // Clear then set content on next tick to ensure screen readers register the change,
  // even if the same message is announced twice in a row
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
};

/**
 * React hook for screen reader announcements
 *
 * @example
 * const announceMessage = useAnnounce();
 * announceMessage('Form submitted successfully');
 */
export const useAnnounce = () => {
  return useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      announce(message, politeness);
    },
    []
  );
};

/**
 * Hook that announces route/page changes to screen readers
 * Call with the new page title whenever navigation occurs
 *
 * @example
 * usePageAnnouncement(pageTitle);
 */
export const usePageAnnouncement = (pageTitle: string) => {
  useEffect(() => {
    if (pageTitle) {
      announce(`Navigated to ${pageTitle}`, 'polite');
    }
  }, [pageTitle]);
};

// ============================================================================
// COLOR CONTRAST CHECKER (WCAG AA / AAA)
// ============================================================================

/**
 * Parse a hex color string into RGB components
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleanHex = hex.replace('#', '');
  const normalizedHex =
    cleanHex.length === 3
      ? cleanHex.split('').map((c) => c + c).join('')
      : cleanHex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) return null;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);

  return { r, g, b };
};

/**
 * Calculate relative luminance per WCAG 2.x formula
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export const getRelativeLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

/**
 * Calculate WCAG contrast ratio between two colors (1:1 to 21:1)
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @example
 * getContrastRatio('#FFFFFF', '#050505') // ~19.8
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

export type WcagLevel = 'AA' | 'AAA';
export type WcagTextSize = 'normal' | 'large';

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
  recommendation: string;
}

/**
 * Full WCAG contrast check with pass/fail for all size/level combinations
 *
 * WCAG AA: 4.5:1 normal text, 3:1 large text (18pt+/14pt bold+)
 * WCAG AAA: 7:1 normal text, 4.5:1 large text
 *
 * @example
 * const result = checkContrast('#FFFFFF', '#0055FF');
 * if (!result.passesAA) console.warn(result.recommendation);
 */
export const checkContrast = (
  foreground: string,
  background: string
): ContrastResult => {
  const ratio = getContrastRatio(foreground, background);

  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;
  const passesAALarge = ratio >= 3;
  const passesAAALarge = ratio >= 4.5;

  let recommendation = '';
  if (passesAAA) {
    recommendation = `Excellent: ${ratio}:1 passes WCAG AAA for all text sizes.`;
  } else if (passesAA) {
    recommendation = `Good: ${ratio}:1 passes WCAG AA for normal text. Passes AAA only for large text (${passesAAALarge ? 'yes' : 'no'}).`;
  } else if (passesAALarge) {
    recommendation = `Warning: ${ratio}:1 passes WCAG AA only for large text (18pt+/14pt bold+). Fails for normal body text.`;
  } else {
    recommendation = `Fail: ${ratio}:1 does not meet WCAG AA minimums. Increase contrast to at least 4.5:1 for normal text or 3:1 for large text.`;
  }

  return {
    ratio,
    passesAA,
    passesAAA,
    passesAALarge,
    passesAAALarge,
    recommendation,
  };
};

/**
 * Verify a color pair meets a target WCAG level for a given text size
 *
 * @example
 * meetsWcagLevel('#FFFFFF', '#0055FF', 'AA', 'normal') // true
 */
export const meetsWcagLevel = (
  foreground: string,
  background: string,
  level: WcagLevel = 'AA',
  textSize: WcagTextSize = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return textSize === 'large' ? ratio >= 3 : ratio >= 4.5;
};

/**
 * WISE² brand color contrast audit against the primary dark background
 * Pre-computed reference for design decisions (see tailwind.config.js `wise` palette)
 */
export const WISE_CONTRAST_AUDIT: Record<string, ContrastResult> = {
  'text-primary on bg': checkContrast('#FFFFFF', '#050505'),
  'text-secondary on bg': checkContrast('#C9CED6', '#050505'),
  'text-muted on bg': checkContrast('#8D98A5', '#050505'),
  'primary on bg': checkContrast('#0055FF', '#050505'),
  'electric on bg': checkContrast('#00D9FF', '#050505'),
  'white on primary': checkContrast('#FFFFFF', '#0055FF'),
  'white on danger': checkContrast('#FFFFFF', '#FF0040'),
  'white on success': checkContrast('#FFFFFF', '#22C55E'),
};

// ============================================================================
// REDUCED MOTION
// ============================================================================

/**
 * Check (non-reactive, one-time) if user prefers reduced motion
 * For use outside React components. Prefer useReducedMotion() hook in components.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration respecting reduced-motion preference
 * Returns 0 (instant) if user prefers reduced motion
 */
export const getAnimationDuration = (defaultDurationMs: number): number => {
  return prefersReducedMotion() ? 0 : defaultDurationMs;
};

/**
 * Tailwind class helper for conditionally disabling animation/transition classes
 * Pair with the `motion-reduce:` variant, which Tailwind supports by default
 *
 * @example
 * className={`transition-transform motion-reduce:transition-none ${baseClasses}`}
 */
export const motionSafeClasses = {
  transition: 'transition-all motion-reduce:transition-none',
  transform: 'transform motion-reduce:transform-none',
  animatePulse: 'animate-pulse-glow motion-reduce:animate-none',
} as const;

// ============================================================================
// SEMANTIC HTML HELPERS
// ============================================================================

/**
 * Heading level validator to prevent skipped heading levels (h1 -> h3)
 * Call during development/testing to audit a page's heading structure
 */
export const validateHeadingOrder = (
  container: HTMLElement | Document = document
): { valid: boolean; issues: string[] } => {
  const headings = Array.from(
    container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
  );

  const issues: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = Number(heading.tagName.charAt(1));

    if (index === 0 && level !== 1) {
      issues.push(`First heading is <h${level}>, should start with <h1>.`);
    }

    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push(
        `Heading level skipped: <h${previousLevel}> followed by <h${level}> ("${heading.textContent?.trim()}").`
      );
    }

    previousLevel = level;
  });

  return { valid: issues.length === 0, issues };
};

/**
 * Check that every image has alt text (or is explicitly decorative)
 */
export const validateImageAltText = (
  container: HTMLElement | Document = document
): { valid: boolean; issues: string[] } => {
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  const issues: string[] = [];

  images.forEach((img) => {
    const hasAlt = img.hasAttribute('alt');
    const isDecorative = img.getAttribute('role') === 'presentation' || img.getAttribute('alt') === '';

    if (!hasAlt) {
      issues.push(`Image missing alt attribute: ${img.src || '(no src)'}`);
    } else if (!isDecorative && img.alt.trim().length === 0) {
      // empty alt is valid ONLY when explicitly decorative
      issues.push(`Image has empty alt text without decorative role: ${img.src || '(no src)'}`);
    }
  });

  return { valid: issues.length === 0, issues };
};

/**
 * Check that all form inputs have associated labels
 */
export const validateFormLabels = (
  container: HTMLElement | Document = document
): { valid: boolean; issues: string[] } => {
  const inputs = Array.from(
    container.querySelectorAll<HTMLElement>('input, select, textarea')
  ).filter((el) => el.getAttribute('type') !== 'hidden');

  const issues: string[] = [];

  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    const hasAssociatedLabel = id
      ? !!document.querySelector(`label[for="${id}"]`)
      : false;

    if (!hasAssociatedLabel && !ariaLabel && !ariaLabelledBy) {
      const identifier = id || input.getAttribute('name') || input.tagName.toLowerCase();
      issues.push(`Form field "${identifier}" has no associated label, aria-label, or aria-labelledby.`);
    }
  });

  return { valid: issues.length === 0, issues };
};

/**
 * Run a full accessibility audit combining heading, image, and form checks
 * Intended for development-time use (e.g. logged in a debug panel), not production
 */
export const runA11yAudit = (
  container: HTMLElement | Document = document
): {
  valid: boolean;
  headings: ReturnType<typeof validateHeadingOrder>;
  images: ReturnType<typeof validateImageAltText>;
  forms: ReturnType<typeof validateFormLabels>;
} => {
  const headings = validateHeadingOrder(container);
  const images = validateImageAltText(container);
  const forms = validateFormLabels(container);

  return {
    valid: headings.valid && images.valid && forms.valid,
    headings,
    images,
    forms,
  };
};

// ============================================================================
// MISC HELPERS
// ============================================================================

/**
 * Minimum touch target size per WCAG 2.5.5 / 2.5.8 (44x44 CSS px)
 */
export const MIN_TOUCH_TARGET_PX = 44;

/**
 * Tailwind class ensuring an element meets the minimum touch target size
 */
export const minTouchTargetClass = 'min-h-[44px] min-w-[44px]';

/**
 * Hook to detect if the "using-keyboard" body class is currently active
 * (i.e. the user is currently navigating via keyboard, not mouse/touch)
 */
export const useIsKeyboardUser = (): boolean => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const cleanup = initKeyboardFocusDetection();

    const observer = new MutationObserver(() => {
      setIsKeyboardUser(document.body.classList.contains('using-keyboard'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, []);

  return isKeyboardUser;
};
