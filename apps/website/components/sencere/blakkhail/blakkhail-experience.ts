export type BlakkhailCategory = 'tees' | 'hoodies' | 'hats';

export type CinematicPhase = 'idle' | 'lights-out' | 'chorus' | 'vault' | 'end-card' | 'complete';

export const BLAKKHAIL_ASSETS = {
  wordmark: '/sencere-assets/blakkhail/blakkhail-wordmark-gold.jpg',
  piffCitySkull: '/sencere-assets/blakkhail/piff-city-skull.jpg',
  sencereEmblem: '/sencere-assets/blakkhail/sencere-emblem.jpg',
} as const;

export const BLAKKHAIL_CATEGORIES: {
  id: BlakkhailCategory;
  label: string;
  intercomLabel: string;
}[] = [
  { id: 'tees', label: 'T-Shirts', intercomLabel: 'T-SHIRTS' },
  { id: 'hoodies', label: 'Hoodies', intercomLabel: 'HOODIES' },
  { id: 'hats', label: 'Hats', intercomLabel: 'HATS' },
];

/** Full mechanical chorus — storyboard panel 7 */
export const MECHANICAL_CHORUS_STEPS = [
  { label: 'Drills', icon: '⚙' },
  { label: 'Saws', icon: '⚙' },
  { label: 'Grinders', icon: '⚙' },
  { label: 'Hydraulics', icon: '⚙' },
  { label: 'Chains', icon: '⛓' },
  { label: 'Welders', icon: '🔥' },
  { label: 'Flamethrower', icon: '🔥' },
  { label: 'Conveyors', icon: '⚙' },
  { label: 'Fabric Rips', icon: '✂' },
  { label: 'Sewing', icon: '🪡' },
  { label: 'Heat Press', icon: '♨' },
  { label: 'Vacuum Seal', icon: '◉' },
  { label: 'Pack · Zip · Thunk', icon: '▣' },
] as const;

export const CINEMATIC_TIMING = {
  lightsOutMs: 700,
  chorusStepMs: 380,
  chorusSilenceMs: 600,
  vaultMs: 4200,
  endCardMs: 3200,
} as const;

export const CATEGORY_COMING_SOON: Record<Exclude<BlakkhailCategory, 'tees'>, string> = {
  hoodies: 'Hoodie vault opens soon. Drop your email — we will notify you first.',
  hats: 'Hat line in production. Stay locked on @blakkhail for the drop.',
};
