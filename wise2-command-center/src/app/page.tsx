import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 text-[#f6f0e4]">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(17,119,255,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(216,164,58,0.18),transparent_22%),linear-gradient(180deg,rgba(10,10,12,0.98),rgba(5,5,5,1))]"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <div className="max-w-3xl rounded-[2rem] border border-[rgba(216,164,58,0.24)] bg-[rgba(8,8,10,0.86)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#d8a43a]">
            WISE² Command Center
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
            Business OS for brand, CRM, automation, content, and analytics.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b5aea6]">
            Open the personalized Javon demo or jump into the command center
            surfaces that power the rest of the workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo/javon"
              className="rounded-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] px-6 py-3 text-sm font-semibold text-[#050505] transition hover:opacity-90"
            >
              Open Javon demo
            </Link>
            <Link
              href="/demo/admin"
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#f6f0e4] transition hover:border-[rgba(216,164,58,0.3)]"
            >
              Demo admin
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#f6f0e4] transition hover:border-[rgba(17,119,255,0.3)]"
            >
              Command center
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
