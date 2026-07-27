import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² Sound Labs | Creative Studio',
  description: 'Professional audio production and music creation studio.',
};

export default function SoundLabsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Sound Labs</h1>
        <p className="text-text-secondary">
          Professional audio production and music creation studio.
        </p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-wise-surface/30 p-12 backdrop-blur-sm text-center">
        <div className="space-y-4">
          <div className="text-6xl">🎵</div>
          <h2 className="text-2xl font-semibold text-text-primary">Sound Labs Studio</h2>
          <p className="text-text-secondary">
            Professional audio production tools and features available.
          </p>
        </div>
      </div>
    </div>
  );
}
