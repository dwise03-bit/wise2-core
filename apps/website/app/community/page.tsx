'use client';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-wise text-wise-primary">
      <nav className="sticky top-0 z-50 bg-wise/80 backdrop-blur-md border-b border-wise-subtle">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">WISE²</a>
          <a href="/" className="text-wise-primary hover:text-wise-primary-hover">← Back</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Community</h1>
          <p className="text-2xl text-wise-muted">Connect with 10,000+ WISE² users worldwide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-wise-surface border border-wise-subtle rounded-lg hover:border-wise-primary transition">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Discord Community</h3>
            <p className="text-wise-muted mb-4">Join our Discord server to chat with other users, get support, and share ideas.</p>
            <a href="#" className="text-wise-primary hover:text-wise-primary-hover font-semibold">Join Discord →</a>
          </div>

          <div className="p-8 bg-wise-surface border border-wise-subtle rounded-lg hover:border-wise-primary transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Documentation</h3>
            <p className="text-wise-muted mb-4">Explore comprehensive guides, tutorials, and API documentation to get started.</p>
            <a href="#" className="text-wise-primary hover:text-wise-primary-hover font-semibold">Read Docs →</a>
          </div>

          <div className="p-8 bg-wise-surface border border-wise-subtle rounded-lg hover:border-wise-primary transition">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">Tutorials</h3>
            <p className="text-wise-muted mb-4">Learn best practices and advanced techniques from experienced users.</p>
            <a href="#" className="text-wise-primary hover:text-wise-primary-hover font-semibold">View Tutorials →</a>
          </div>
        </div>

        <div className="mt-16 p-8 bg-wise-surface border border-wise-subtle rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Have questions?</h2>
          <p className="text-wise-muted mb-6">Our community team is here to help. Reach out to us anytime.</p>
          <a href="/auth/signup" className="inline-block px-8 py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md">
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}
