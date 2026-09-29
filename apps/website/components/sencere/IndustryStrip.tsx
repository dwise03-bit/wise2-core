import { industries } from '@/lib/sencere/industries';

export function IndustryStrip() {
  return (
    <section className="border-y border-[#8C6518]/30 bg-[#080808]">
      <div className="mx-auto flex max-w-[1536px] flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 py-5 sm:px-10">
        <span className="text-xs font-bold tracking-[0.15em] text-[#D6A331]">
          TRUSTED BY BUSINESSES IN:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {industries.map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 ${idx > 0 ? 'sm:border-l sm:border-[#8C6518]/30 sm:pl-8' : ''}`}
            >
              <item.icon className="h-4 w-4 text-[#D6A331]" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-wide text-[#C8C8C8]">
                {item.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
