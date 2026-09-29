export const LIZZY = {
  ink: '#0B0318',
  deep: '#160428',
  card: '#1C0A33',
  pink: '#FF3DA8',
  magenta: '#FF2D8A',
  cyan: '#3DF0FF',
  yellow: '#FFE14A',
  purple: '#8B5CFF',
  white: '#FFFFFF',
} as const;

export const LIZZY_LAYOUT = {
  page: 'min-h-screen bg-lizzy-ink text-white overflow-x-hidden',
  container: 'mx-auto w-full max-w-6xl px-4 sm:px-6',
  glass:
    'rounded-lizzy border border-lizzy-pink/25 bg-lizzy-card/80 backdrop-blur-xl shadow-pink',
  panel: 'rounded-lizzy border border-white/10 bg-lizzy-deep/80 backdrop-blur-lg',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lizzy-magenta to-lizzy-pink px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white shadow-pink transition hover:brightness-110 active:scale-[0.98]',
  btnCyan:
    'inline-flex items-center justify-center gap-2 rounded-full bg-lizzy-cyan px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-lizzy-ink shadow-cyan transition hover:brightness-110 active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-full border border-lizzy-cyan/40 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-lizzy-cyan transition hover:bg-lizzy-cyan/10',
} as const;

export const LIZZY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/meet', label: 'Meet Lil Lizzy' },
  { href: '/led-tag', label: 'LED Tag' },
  { href: '/accessories', label: 'Accessories' },
  { href: '/boompopsters', label: 'The BoomPopsters' },
  { href: '/shop', label: 'Shop' },
  { href: '/parents', label: 'Parents' },
] as const;

export const PERSONALITY = ['Confident', 'Creative', 'Kind', 'Determined', 'Fun & Playful'] as const;
export const STYLE_TRAITS = ['Trendy', 'Colorful', 'Stage Ready', 'Bold', 'Unique'] as const;
export const FAVORITES = [
  { label: 'Music', icon: 'Music' },
  { label: 'Dancing', icon: 'Sparkles' },
  { label: 'Performing', icon: 'Mic2' },
  { label: 'Fans', icon: 'Heart' },
] as const;

export const PALETTE = [
  { name: 'Hot Pink', hex: '#FF3DA8' },
  { name: 'Deep Purple', hex: '#5B2BFF' },
  { name: 'Cyan', hex: '#3DF0FF' },
  { name: 'Boom Yellow', hex: '#FFE14A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Stage Black', hex: '#0B0318' },
] as const;

export const EXPRESSIONS = ['Happy', 'Wink', 'Hearts', 'Surprised', 'Glow', 'Laugh'] as const;

export const ACCESSORY_LOOKS = [
  { name: 'Star Hair Clip', note: 'Stage sparkle, always on.' },
  { name: 'Sparkle Mic', note: 'The voice of the Boom.' },
  { name: 'Star Necklace', note: 'Lead-singer shine.' },
  { name: 'Boom Bracelets', note: 'Stack them. Trade them.' },
] as const;

export const OUTFITS = [
  { name: 'Pink Boom', note: 'Signature stage look' },
  { name: 'Cyan Drop', note: 'Tour-night remix' },
  { name: 'Violet Star', note: 'Finale fit' },
] as const;

export const UNIVERSE = [
  { title: 'Music', copy: 'Original songs, 8-bit covers, and stage drops that live on the tag.' },
  { title: 'Friendship', copy: 'Tag-to-tag trades, Boom Buddy chats, and crew codes with friends.' },
  { title: 'Adventure', copy: 'Mini-games, collectible stars, and a world that grows with every tap.' },
] as const;
