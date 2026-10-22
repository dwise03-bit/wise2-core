'use client';

const features = [
  { number: '01', title: 'Always available', text: 'IMP stays on the desktop as a small, movable companion—ready when you choose to ask for help.', detail: 'No background task starts without your request.' },
  { number: '02', title: 'Low-friction work', text: 'Find approved project files, summarize project information, and build a local task list through an explicit permission step.', detail: 'No unrestricted shell access.' },
  { number: '03', title: 'Locked identity', text: 'The glossy black body, cyan eyes, hoodie, W² chest mark, horns, and tail are the companion’s approved visual language.', detail: 'One character across every surface.' }
];

function FeatureGlyph({ number }: { number: string }) {
  if (number === '01') return <svg aria-hidden="true" viewBox="0 0 64 64" className="h-16 w-16 fill-none stroke-[#00D9FF] stroke-[2]"><path d="M6 32s9-15 26-15 26 15 26 15-9 15-26 15S6 32 6 32Z"/><circle cx="32" cy="32" r="8" fill="#00D9FF" /></svg>;
  if (number === '02') return <svg aria-hidden="true" viewBox="0 0 64 64" className="h-16 w-16 fill-none stroke-[#00D9FF] stroke-[2]"><path d="m35 5-22 32h17l-2 22 23-34H34l1-20Z"/></svg>;
  return <svg aria-hidden="true" viewBox="0 0 64 64" className="h-16 w-16 fill-none stroke-[#00D9FF] stroke-[2]"><path d="m32 5 7 19 20 1-16 12 6 21-17-12-17 12 6-21L5 25l20-1 7-19Z" fill="#00D9FF" fillOpacity=".18"/></svg>;
}

export function ImpFeatures() {
  return <section className="border-y border-[#00D9FF]/15 bg-[#0A0E14] px-6 py-24 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-16 max-w-xl"><p className="text-xs font-bold tracking-[.18em] text-[#00D9FF]">DESIGNED FOR REAL WORK</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Companion behavior you can trust.</h2></div><div className="space-y-px bg-[#00D9FF]/20">{features.map((feature, index) => <article key={feature.number} className={`grid gap-8 bg-[#0A0E14] p-8 sm:p-12 md:grid-cols-[130px_1fr] ${index === 1 ? 'md:ml-16' : index === 2 ? 'md:mr-16' : ''}`}><div><FeatureGlyph number={feature.number} /><p className="mt-5 text-xs font-bold tracking-[.18em] text-[#00D9FF]">{feature.number}</p></div><div><h3 className="text-3xl font-black">{feature.title}</h3><p className="mt-4 max-w-2xl text-lg leading-8 text-[#C0C0C0]">{feature.text}</p><p className="mt-6 border-l-2 border-[#00D9FF] pl-4 text-sm leading-6 text-white">{feature.detail}</p></div></article>)}</div></div></section>;
}
