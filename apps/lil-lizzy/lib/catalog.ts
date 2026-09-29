export type Product = {
  id: string;
  name: string;
  price: number;
  category: 'tag' | 'accessory' | 'pack';
  blurb: string;
  features: string[];
  image: string;
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 'led-tag',
    name: 'Lil Lizzy LED Tag',
    price: 129,
    category: 'tag',
    badge: 'Hero drop',
    blurb: 'Collect. Trade. Play. Repeat. Your 8-bit world, your way.',
    features: [
      'Full color screen',
      'USB-C rechargeable',
      'Bluetooth tag-to-tag',
      'NFC tap-to-trade',
      'Boom Buddy sound',
      'Boom Stars currency',
    ],
    image: '/brand/boom-tag.jpg',
  },
  {
    id: 'star-clip',
    name: 'Star Hair Clip',
    price: 14,
    category: 'accessory',
    blurb: 'The signature sparkle that starts every set.',
    features: ['Stage-ready finish', 'Kids-safe clip', 'Pairs with every outfit'],
    image: '/brand/lizzy-sheet.jpg',
  },
  {
    id: 'sparkle-mic',
    name: 'Sparkle Mic',
    price: 24,
    category: 'accessory',
    blurb: 'Sing it. Shine it. Boom it.',
    features: ['Play mic', 'Star grille', 'Tour-night pink'],
    image: '/brand/lizzy-hero.jpg',
  },
  {
    id: 'star-necklace',
    name: 'Star Necklace',
    price: 18,
    category: 'accessory',
    blurb: 'Lead-singer gold for everyday shine.',
    features: ['Adjustable chain', 'Star pendant', 'Lightweight'],
    image: '/brand/style-board.jpg',
  },
  {
    id: 'boom-bracelets',
    name: 'Boom Bracelets',
    price: 16,
    category: 'accessory',
    blurb: 'Stack your colors. Trade extras with the crew.',
    features: ['3-pack', 'Pink / cyan / yellow', 'Stretch fit'],
    image: '/brand/lookbook-strip.jpg',
  },
  {
    id: 'stage-pack',
    name: 'Stage Ready Pack',
    price: 159,
    category: 'pack',
    badge: 'Best boom',
    blurb: 'LED Tag plus the four signature accessories.',
    features: ['LED Tag', 'Clip, mic, necklace, bracelets', 'Gift-ready'],
    image: '/brand/spec-board.jpg',
  },
];

export const TAG_SPECS = [
  { label: 'Brain', value: 'ESP32-S3' },
  { label: 'Sound', value: 'MAX98357A + speaker' },
  { label: 'Save', value: 'MicroSD progress' },
  { label: 'Power', value: 'USB-C + LiPo' },
  { label: 'Play', value: 'D-pad, A/B, Menu' },
  { label: 'Trade', value: 'Bluetooth + NFC' },
] as const;

export const TAG_FEATURES = [
  'Boot-up animation to Lil Lizzy',
  '8-bit character and animations',
  'Menus, mini-games, Boom Stars',
  'Sound + Boom Buddy companion',
  'Tag-to-tag Bluetooth play',
  'NFC tap-to-trade',
  'Rechargeable and portable',
  'Progress saved to SD card',
] as const;

export function money(n: number) {
  return `$${n.toFixed(0)}`;
}

export function getProduct(id: string) {
  return PRODUCTS.find((item) => item.id === id);
}
