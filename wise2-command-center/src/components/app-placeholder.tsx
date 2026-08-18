import Link from "next/link";

export function AppPlaceholder({
  title,
  description,
  linkHref = "/demo/javon",
  linkLabel = "Open Javon demo",
}: {
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <main className="min-h-screen px-4 py-16 text-[#f6f0e4]">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center">
        <div className="w-full rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,8,10,0.88)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#d8a43a]">
            WISE² Command Center
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#b5aea6]">
            {description}
          </p>
          <div className="mt-8">
            <Link
              href={linkHref}
              className="rounded-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] px-6 py-3 text-sm font-semibold text-[#050505] transition hover:opacity-90"
            >
              {linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

