export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="border-b border-[#8C6518]/30 bg-[#080808] py-14">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        <p className="text-xs font-bold tracking-[0.2em] text-[#D6A331]">{eyebrow}</p>
        <h1
          className="mt-2 text-3xl font-bold uppercase tracking-tight text-[#F7F7F7] sm:text-4xl"
          style={{ fontFamily: 'var(--font-headers)' }}
        >
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#C8C8C8]">{description}</p>}
      </div>
    </section>
  );
}
