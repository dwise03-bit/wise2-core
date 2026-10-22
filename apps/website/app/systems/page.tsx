import Link from 'next/link';

const lines = [
 { title: 'HERMES CONTROL', subtitle: 'AI, automation and intelligent operations', href: '/hermes', id: '01' },
 { title: 'BUSINESS AUDITS', subtitle: 'Diagnose. Build. Deploy.', href: '/business-audits', id: '02' },
 { title: 'WISE² TRANSIT', subtitle: 'Follow the IMP into the network', href: '/transit', id: '03' },
 { title: 'SERVICES & SOLUTIONS', subtitle: 'Explore our tools and services', href: '/services', id: '04' },
 { title: 'CONTACT THE STUDIO', subtitle: 'Start your next project', href: '/contact', id: '05' },
];
export default function SystemsPage() {
 return <main className="wise-station min-h-screen bg-[#050607] text-white">
  <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#64f59a]/20 px-6 py-5"><Link href="/" className="text-2xl font-black">W²</Link><Link href="/transit" className="text-xs font-bold uppercase tracking-[.2em] text-[#72ffa3]">Transit Network ↗</Link></header>
  <section className="relative isolate overflow-hidden border-b border-[#71fca3]/20 px-6 py-28 md:py-40">
   <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-45" style={{backgroundImage:"url('/brand/wise2-hero-united.webp')"}}/>
   <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050607] via-[#050607]/90 to-transparent"/>
   <div className="mx-auto max-w-7xl">
    <p className="mb-6 text-xs font-black uppercase tracking-[.3em] text-[#72ffa3]">Station 02 / WISE² Underground</p>
    <h1 className="max-w-5xl text-5xl font-black uppercase leading-[.92] tracking-[-.06em] md:text-8xl">LIVING HIVE<br/><span className="text-[#72ffa3]">JUNCTION</span></h1>
    <p className="mt-9 max-w-2xl text-lg leading-8 text-white/75">One connected network. Explore the places where WISE² builds technology, automation, creative experiences, and practical business systems.</p>
   </div>
  </section>
  <section className="mx-auto max-w-7xl px-6 py-20">
   <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4"><h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Choose a destination</h2><span className="text-xs font-bold tracking-[.2em] text-[#72ffa3]">NETWORK DIRECTORY / FIVE ROUTES</span></div>
   <div className="grid gap-4 md:grid-cols-2">{lines.map(d=><Link key={d.id} href={d.href} className="group flex min-h-48 flex-col justify-between border border-[#72ffa3]/25 bg-[#0b1411]/95 p-7 transition hover:border-[#72ffa3] hover:bg-[#10241a]">
    <div className="flex justify-between"><span className="text-sm font-black text-[#72ffa3]">ROUTE {d.id}</span><span className="text-2xl text-[#72ffa3]">↗</span></div><div><h3 className="text-2xl font-black md:text-3xl">{d.title}</h3><p className="mt-2 text-sm text-white/65">{d.subtitle}</p></div>
   </Link>)}</div>
   <p className="mt-10 text-sm text-white/50">All stations remain accessible through ordinary links. Motion is optional and never blocks navigation.</p>
  </section>
 </main>;
}
