export const BLAKKHAIL = {
  // Rag & Bone inspired palette
  black: '#000000',
  white: '#ffffff',
  accentBrown: '#80503d',
  accentBlue: '#3265e5',
  neutral50: '#f6f8fe',
  neutral100: '#f8f8f8',
  neutral200: '#f0f0f0',
  neutral600: '#666666',
  neutral700: '#505050',
  // Legacy aliases for compatibility
  jetBlack: '#000000',
  gunmetal: '#2A2A2A',
  steel: '#A8A8A8',
  gold: '#80503d',
  darkGold: '#505050',
  amberGlow: 'rgba(128, 80, 61, 0.15)',
  concrete: '#f0f0f0',
} as const;

/** Shared layout tokens for consistent structure and scale. */
export const BLAKKHAIL_LAYOUT = {
  page: 'min-h-screen w-full min-w-0 bg-white scroll-smooth scroll-pt-[4rem] sm:scroll-pt-[5rem] lg:scroll-pt-[6rem]',
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
