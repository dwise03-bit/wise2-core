import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-wise-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-wise-electric mb-6">WISE²</h1>
        <p className="text-xl text-text-secondary mb-8">Command Center</p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-wise-electric text-wise-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
