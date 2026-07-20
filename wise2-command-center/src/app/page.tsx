import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-black">WISE²</h1>

        <p className="text-gray-400">
          Organized Chaos Command Center
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="rounded bg-green-500 px-6 py-3">
            Dashboard
          </Link>

          <Link href="/studio" className="rounded border px-6 py-3">
            Studio
          </Link>

          <Link href="/live-studio" className="rounded border px-6 py-3">
            Live
          </Link>

          <Link href="/ai" className="rounded border px-6 py-3">
            AI
          </Link>
        </div>
      </div>
    </main>
  );
}
