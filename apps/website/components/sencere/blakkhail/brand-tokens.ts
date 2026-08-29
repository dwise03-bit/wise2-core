export const BLAKKHAIL = {
  jetBlack: '#0A0A0A',
  gunmetal: '#2A2A2A',
  steel: '#A8A8A8',
  gold: '#D6A331',
  darkGold: '#8C6518',
} as const;

/** Shared layout tokens for consistent structure and scale. */
export const BLAKKHAIL_LAYOUT = {
  page: 'min-h-screen overflow-x-hidden bg-[#0A0A0A] scroll-pt-[11.5rem] sm:scroll-pt-[12.5rem]',
  section: 'scroll-mt-[11.5rem] sm:scroll-mt-[12.5rem]',
  container: 'mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8',
  bleed: 'w-full',
  frame: 'overflow-hidden border-[3px]',
  sectionY: 'py-8 sm:py-12 lg:py-16',
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
