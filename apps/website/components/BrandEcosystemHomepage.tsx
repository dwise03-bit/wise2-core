import Link from 'next/link';

const destinations = [
  { number: '01', title: 'WISE² TRANSIT', tag: 'ENTER THE EXPERIENCE', text: 'A New York-inspired gateway into our connected world.', href: '/transit' },
  { number: '02', title: 'LIVING HIVE', tag: 'OUR ECOSYSTEM', text: 'Explore the systems, technology, and creative work we build.', href: '/systems' },
  { number: '03', title: 'HERMES', tag: 'AI & AUTOMATION', text: 'Connected intelligence for real businesses and real workflows.', href: '/hermes' },
  { number: '04', title: 'BUSINESS AUDITS', tag: 'START BUILDING', text: 'Find the gaps, uncover opportunities, and chart the next move.', href: '/business-audits' },
];

export function BrandEcosystemHomepage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] font-sans text-white">
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.wise-reveal{animation:rise .8s ease both}.wise-rail:before{content:'';position:absolute;top:0;bottom:0;left:0;width:2px;background:linear-gradient(#51ff81,transparent)}.wise-image:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#050607 2%,rgba(5,6,7,.6) 49%,rgba(5,6,7,.16)),linear-gradient(0deg,#050607,transparent 35%)}.wise-destination{transition:background .2s,border-color .2s,transform .2s}.wise-destination:hover{background:#101b1b;border-color:#54f78c;transform:translateY(-3px)}@media(prefers-reduced-motion:reduce){.wise-reveal{animation:none}.wise-destination{transition:none}}`}</style>
      <header className="relative z-20 mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-5 border-b border-white/15 px-6 py-5 md:px-12">
        <Link href="/" className="text-3xl font-black tracking-[-.08em] text-white" aria-label="WISE squared homepage">W²<span className="ml-3 text-xs font-bold tracking-[.2em] text-[#72fca5]">WISE²</span></Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-[.14em]">
          <Link href="/transit" className="text-white/80 hover:text-[#72fca5]">Transit</Link>
          <Link href="/systems" className="text-white/80 hover:text-[#72fca5]">Systems</Link>
          <Link href="/hermes" className="text-white/80 hover:text-[#72fca5]">Hermes</Link>
          <Link href="/business-audits" className="text-white/80 hover:text-[#72fca5]">Audits</Link>
          <Link href="/contact" className="border border-[#65ff98] px-4 py-3 text-[#65ff98] hover:bg-[#65ff98] hover:text-black">Contact ↗</Link>
        </nav>
      </header>
      <section className="relative isolate flex min-h-[720px] items-center border-b border-white/10 px-6 pb-24 pt-20 md:px-12">
        <div className="wise-image absolute inset-0 -z-10 bg-cover bg-[center_top] bg-no-repeat" style={{backgroundImage:"url('/brand/wise2-hero-united.webp')"}} aria-hidden="true"/>
        <div className="relative z-10 mx-auto w-full max-w-[1480px]">
          <div className="wise-reveal mb-7 flex items-center gap-4 text-xs font-bold tracking-[.24em] text-[#71ffa3]"><span className="inline-block h-[2px] w-11 bg-[#71ffa3]"/> NEW YORK BUILT / FUTURE READY</div>
          <h1 className="wise-reveal max-w-[1050px] text-[clamp(3.7rem,10vw,10rem)] font-black uppercase leading-[.82] tracking-[-.085em]" style={{animationDelay:'90ms'}}>TWO MINDS.<br/><span className="text-[#73ffa1]">ONE VISION.</span></h1>
          <p className="wise-reveal mt-10 max-w-[550px] text-lg leading-relaxed text-white/80 md:text-xl" style={{animationDelay:'150ms'}}>Intelligent tools, cinematic experiences, and connected systems built for the real world.</p>
          <div className="wise-reveal mt-10 flex flex-wrap gap-4" style={{animationDelay:'220ms'}}>
            <Link href="/transit" className="inline-flex min-h-14 items-center gap-5 bg-[#67fa97] px-7 py-4 text-sm font-black uppercase tracking-[.1em] text-[#041008] hover:bg-white">Enter WISE² Transit <span aria-hidden="true">↗</span></Link>
            <Link href="/business-audits" className="inline-flex min-h-14 items-center gap-5 border border-white/65 bg-black/40 px-7 py-4 text-sm font-bold uppercase tracking-[.1em] text-white hover:border-[#67fa97]">Explore our work <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 text-[10px] font-bold tracking-[.2em] text-white/50 md:left-12">WISE² / CONNECT THE DOTS / 2026</div>
      </section>
      <section className="mx-auto max-w-[1480px] px-6 py-24 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black tracking-[.3em] text-[#73ffa1]">THE WISE² NETWORK</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-.05em] md:text-6xl">One system.<br/>Many destinations.</h2></div>
          <p className="max-w-sm text-sm leading-7 text-white/60">Choose where to go. Every door connects to a real piece of the WISE² ecosystem.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {destinations.map((d)=><Link key={d.number} href={d.href} className="wise-destination group relative flex min-h-[230px] flex-col justify-between border border-white/15 bg-[#0b1010] p-7 md:p-9">
            <div className="flex justify-between gap-4"><span className="text-xs font-black tracking-[.2em] text-[#73ffa1]">{d.number} / {d.tag}</span><span className="text-2xl text-[#73ffa1]" aria-hidden="true">↗</span></div>
            <div><h3 className="text-3xl font-black tracking-[-.04em] md:text-4xl">{d.title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-white/60">{d.text}</p></div>
          </Link>)}
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#0c1512] px-6 py-20 md:px-12">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-9"><div><p className="text-xs font-black tracking-[.2em] text-[#73ffa1]">READY FOR WHAT'S NEXT?</p><h2 className="mt-3 text-4xl font-black uppercase tracking-[-.05em] md:text-6xl">Let's build something real.</h2></div><Link href="/contact" className="bg-[#73ffa1] px-8 py-5 text-sm font-black uppercase tracking-[.1em] text-black hover:bg-white">Work with WISE² ↗</Link></div>
      </section>
      <footer className="mx-auto flex max-w-[1480px] flex-wrap justify-between gap-3 px-6 py-8 text-xs uppercase tracking-[.15em] text-white/50 md:px-12"><span>WISE² · Two minds. One vision.</span><span>New York / Everywhere</span></footer>
    </main>
  );
}
