import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-gd-neon">
          Get Down Command Center
        </p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm leading-6 text-gd-steel">
          That route isn&apos;t part of the command center. Everything in the owner demo is reachable
          from the sidebar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gd-electric/45 bg-gd-electric/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gd-electric transition hover:bg-gd-electric/25"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/dispatch"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.06]"
          >
            Open Dispatch
          </Link>
        </div>
      </div>
    </div>
  );
}
