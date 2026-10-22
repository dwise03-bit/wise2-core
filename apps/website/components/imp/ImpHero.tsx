'use client';

import Image from 'next/image';
import Link from 'next/link';

function StatusMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-[#00D9FF]"><circle cx="12" cy="12" r="5" /></svg>;
}

export function ImpHero() {
  return (
    <section className="border-b border-[#00D9FF]/15 bg-[#050607] pt-24 text-white">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-end gap-12 px-6 pb-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="max-w-xl pb-4">
          <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-[.18em] text-[#00D9FF]"><StatusMark /> WISE² IMP · DESKTOP COMPANION</div>
          <h1 className="max-w-[11ch] text-5xl font-black leading-[.94] tracking-[-.055em] text-white sm:text-7xl">Your desktop just got smarter.</h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#C0C0C0] sm:text-lg">A local-first companion for project review, task lists, approved app launches, and focused workflow support—without changing the work on your behalf.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/imp" className="inline-flex items-center justify-center bg-[#00D9FF] px-6 py-3 text-sm font-extrabold text-[#050607] transition-colors hover:bg-white">Launch live IMP</Link>
            <Link href="/imp/downloads" className="inline-flex items-center justify-center border border-[#00D9FF]/60 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:border-white hover:bg-white hover:text-[#050607]">Download for Windows</Link>
          </div>
          <dl className="mt-12 grid grid-cols-3 border-t border-[#00D9FF]/15 pt-5 text-sm"><div><dt className="font-bold text-white">Local</dt><dd className="mt-1 text-[#808080]">settings</dd></div><div><dt className="font-bold text-white">Explicit</dt><dd className="mt-1 text-[#808080]">permissions</dd></div><div><dt className="font-bold text-white">Windows</dt><dd className="mt-1 text-[#808080]">desktop pet</dd></div></dl>
        </div>
        <div className="relative flex min-h-[430px] items-end justify-center overflow-hidden border-x border-t border-[#00D9FF]/20 bg-[#0A0E14] sm:min-h-[570px]">
          <div className="absolute left-6 top-6 border border-[#00D9FF]/30 px-3 py-2 text-[10px] font-bold tracking-[.2em] text-[#00D9FF]">IDENTITY LOCKED</div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 border-t border-[#00D9FF]/15" />
          <Image src="/products/wise-imp.png" alt="WISE² IMP, the approved glossy black companion with cyan eyes and W² chest mark" width={512} height={512} priority className="relative z-10 h-[600px] w-[600px] max-w-none object-contain [clip-path:inset(0_0_22%_0)] sm:h-[720px] sm:w-[720px]" />
          <p className="absolute bottom-6 left-6 z-20 max-w-[22ch] text-xs leading-5 text-[#808080]">Glossy black body. Cyan eyes. W² chest mark. The character design stays locked.</p>
        </div>
      </div>
    </section>
  );
}
