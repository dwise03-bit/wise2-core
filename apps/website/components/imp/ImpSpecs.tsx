'use client';

const facts = [
  ['Local first', 'Settings and task lists remain on the device.'],
  ['Permissioned skills', 'Sensitive actions require confirmation.'],
  ['Safe boundaries', 'No arbitrary shell commands or silent deletion.'],
  ['Desktop controls', 'Drag, sleep, wake, tray, and emergency quit.']
];

export function ImpSpecs() {
  return <section className="bg-[#050607] px-6 py-12 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-px bg-[#00D9FF]/20 sm:grid-cols-2 lg:grid-cols-4">{facts.map(([title, text]) => <div key={title} className="bg-[#050607] p-6"><p className="text-sm font-black">{title}</p><p className="mt-2 text-sm leading-6 text-[#808080]">{text}</p></div>)}</div></section>;
}
