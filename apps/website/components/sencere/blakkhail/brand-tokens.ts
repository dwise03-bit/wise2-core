export const BLAKKHAIL = {
  // Rag & Bone inspired palette
  black: '#000000',
  white: '#ffffff',
  accentBrown: '#D6A331',
  accentBlue: '#3265e5',
  neutral50: '#0A0A0A',
  neutral100: '#2A2A2A',
  neutral200: '#8C6518',
  neutral600: '#A8A8A8',
  neutral700: '#A8A8A8',
  // Legacy aliases for compatibility
  jetBlack: '#000000',
  gunmetal: '#2A2A2A',
  steel: '#A8A8A8',
  gold: '#D6A331',
  darkGold: '#8C6518',
  amberGlow: 'rgba(214, 163, 49, 0.15)',
  concrete: '#2A2A2A',
} as const;

/** Shared layout tokens for consistent structure and scale. */
export const BLAKKHAIL_LAYOUT = {
  page: 'min-h-screen w-full min-w-0 bg-[#0A0A0A] scroll-smooth scroll-pt-[4rem] sm:scroll-pt-[5rem] lg:scroll-pt-[6rem]',
  section: 'scroll-mt-[4rem] sm:scroll-mt-[5rem] lg:scroll-mt-[6rem]',
  container: 'mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8',
  bleed: 'w-full',
  frame: 'overflow-hidden border border-[#f0f0f0]',
  sectionY: 'py-6 sm:py-10 lg:py-16',
} as const;

export const BLAKKHAIL_SERVICES = [
  'Apparel & Decoration',
  'Vinyl & Print',
  'Sublimation',
  'Laser Engraving',
  'Heat Press',
  'Sewing & Finishing',
  '3D Printing',
  'CNC & Fabrication',
  'Mac Studio (Design)',
] as const;
