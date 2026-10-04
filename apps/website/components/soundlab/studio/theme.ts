// WISE² Sound Lab — approved BLUE + BLACK direction.
// Single source of truth for the studio palette (used via inline styles /
// Tailwind arbitrary values so it never touches the global site config).
export const SL = {
  black: '#02050A',
  navy: '#040B18',
  panel: '#071321',
  panelHi: '#0B1B2E',
  electric: '#008CFF',
  cyan: '#24C8FF',
  ice: '#8BE8FF',
  white: '#F7FBFF',
  muted: '#8D9BAC',
  line: 'rgba(36,200,255,0.14)',
} as const;

// Shared class fragments
export const glass =
  'bg-[#071321]/70 backdrop-blur-xl border border-[#24C8FF]/12';
export const glassHover =
  'hover:border-[#24C8FF]/35 hover:shadow-[0_0_28px_rgba(0,140,255,0.18)]';
