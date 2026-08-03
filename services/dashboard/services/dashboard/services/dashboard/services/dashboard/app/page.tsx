import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        <h1 className="text-6xl md:text-8xl font-black"
          style={{
            color: '#FFFFFF',
            textShadow: '0 0 60px rgba(0, 217, 255, 0.5)',
            letterSpacing: '-0.03em',
          }}>
          W²
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-[#00D9FF]">
          WISE² BUILD INTAKE
        </h2>
        <p className="text-xl text-gray-300">
          Transform your vision into production-ready solutions.
        </p>
        <Link
          href="/start-your-build"
          className="inline-block px-8 py-4 bg-[#FF4D4D] text-white font-bold uppercase rounded hover:shadow-lg hover:shadow-red-500/50 transition"
        >
          Start Your Build →
        </Link>
      </div>
    </div>
  );
}
