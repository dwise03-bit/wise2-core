import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-wise-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-wise-muted mb-8">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-lg transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
