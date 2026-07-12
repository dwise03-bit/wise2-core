export default function Home() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">WISE² Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome to your WISE² Creator Dashboard</p>

        <nav className="space-y-4">
          <a href="/live" className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800">
            <h2 className="text-xl font-bold">LIVE Command Center</h2>
            <p className="text-gray-400">Stream and interact with your audience in real-time</p>
          </a>

          <a href="/community" className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800">
            <h2 className="text-xl font-bold">Community</h2>
            <p className="text-gray-400">Leaderboards, events, and creator connections</p>
          </a>
        </nav>
      </div>
    </div>
  );
}
