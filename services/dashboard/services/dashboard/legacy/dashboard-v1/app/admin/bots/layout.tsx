import Link from 'next/link';

export default function BotAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-40">
        <h1 className="heading-silver text-2xl mb-4">🤖 Bot Administration</h1>
        <nav className="flex gap-6 flex-wrap">
          <Link href="/admin/bots/members" className="text-gray hover:text-neon-red transition-colors">
            Members
          </Link>
          <Link href="/admin/bots/analytics" className="text-gray hover:text-neon-red transition-colors">
            Analytics
          </Link>
          <Link href="/admin/bots/schedule" className="text-gray hover:text-neon-red transition-colors">
            Scheduling
          </Link>
          <Link href="/admin/bots/moderation" className="text-gray hover:text-neon-red transition-colors">
            Moderation
          </Link>
        </nav>
      </header>
      <div className="max-w-7xl mx-auto p-4">
        {children}
      </div>
    </main>
  );
}
