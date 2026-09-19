export function BrandEcosystemHomepage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-36">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#39FF14]">WISE² Business Operating Systems</p>
        <h1 className="mt-5 text-5xl font-black leading-none sm:text-7xl">Intelligent tools for real-world businesses.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#B7C0CB]">Find the systems, workflows, and AI opportunities that give your business room to grow.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <a href="/ai-audit" className="bg-[#39FF14] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:-translate-y-0.5 hover:bg-[#C7FF2E]">Get a free business snapshot</a>
          <a href="/consulting" className="border border-white/20 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#39FF14] hover:text-[#39FF14]">Explore services</a>
        </div>
      </div>
    </main>
  );
}
