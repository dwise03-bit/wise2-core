'use client';

const platforms = [
  { title: 'Browser', eyebrow: 'Live companion', href: '/imp', description: 'Try the companion before installing anything. Its controls, task tools, and local settings stay in the browser.', features: ['Instant launch', 'No account required', 'Local settings', 'Safe task confirmations'], size: 'md:col-span-6 lg:col-span-6 p-8 sm:p-12' },
  { title: 'Windows', eyebrow: 'Desktop companion', href: '/imp/downloads', description: 'A transparent, always-on-top companion for the machine where the work happens.', features: ['Drag and wander', 'Tray controls', 'Emergency quit'], size: 'md:col-span-4 lg:col-span-4 p-8 sm:p-10' },
  { title: 'K10', eyebrow: 'Hardware edition', href: '/products/imps', description: 'Explore the physical companion platform.', features: [], size: 'md:col-span-2 lg:col-span-2 p-8' }
];

function PlatformGlyph({ title }: { title: string }) {
  if (title === 'Browser') return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10 fill-none stroke-[#00D9FF] stroke-[2]"><circle cx="24" cy="24" r="17" /><path d="M7 24h34M24 7c5 5 7 11 7 17s-2 12-7 17c-5-5-7-11-7-17S19 12 24 7Z" /></svg>;
  if (title === 'Windows') return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10 fill-none stroke-[#00D9FF] stroke-[2]"><rect x="7" y="9" width="34" height="28" rx="2" /><path d="M7 16h34M14 12h1M19 12h1M24 12h1" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10 fill-none stroke-[#00D9FF] stroke-[2]"><rect x="13" y="6" width="22" height="36" rx="4" /><circle cx="24" cy="35" r="1" /></svg>;
}

export function ImpPlatforms() {
  return <section className="bg-[#050607] px-6 py-24 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-12 max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-[#00D9FF]">ONE COMPANION · THREE FORMS</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Choose where IMP works with you.</h2></div><div className="grid gap-px bg-[#00D9FF]/20 md:grid-cols-6 lg:grid-cols-12">{platforms.map((platform) => <a key={platform.title} href={platform.href} className={`group bg-[#0A0E14] ${platform.size} transition-colors hover:bg-[#101923}`}><PlatformGlyph title={platform.title} /><p className="mt-8 text-xs font-bold tracking-[.16em] text-[#00D9FF]">{platform.eyebrow}</p><h3 className="mt-2 text-3xl font-black">{platform.title}</h3><p className="mt-4 max-w-md text-sm leading-6 text-[#C0C0C0]">{platform.description}</p>{platform.features.length > 0 && <ul className="mt-7 space-y-2 border-t border-[#00D9FF]/15 pt-5 text-sm text-white">{platform.features.map((feature) => <li key={feature}>— {feature}</li>)}</ul>}<span className="mt-8 inline-block text-sm font-bold text-[#00D9FF] group-hover:text-white">Explore →</span></a>)}</div></div></section>;
}
