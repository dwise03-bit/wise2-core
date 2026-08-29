'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Barcode, QrCode } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_CONTAINERS } from '@/lib/demo-data';

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-white/50">Loading scanner...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}

function ScanPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'barcode' ? 'barcode' : 'qr';
  const isBarcode = mode === 'barcode';

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-cherry-hot/40 bg-cherry-hot/5">
          {isBarcode ? (
            <Barcode className="h-10 w-10 text-cherry-hot" />
          ) : (
            <QrCode className="h-10 w-10 text-cherry-hot" />
          )}
        </div>
        <h1 className="font-serif text-2xl font-bold uppercase">
          {isBarcode ? 'Barcode Scan' : 'QR Scan'}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isBarcode ? 'Scan product barcodes at checkout' : 'Scan container codes to see contents'}
        </p>
      </header>

      <GlassCard className="mb-6 text-center" glow>
        <p className="text-sm text-white/70">
          Camera scanning is mocked in this demo. Tap a container below to simulate a scan.
        </p>
        <button type="button" className={`mt-4 ${CHERRY_LAYOUT.btnPrimary}`}>
          Simulate Scan
        </button>
      </GlassCard>

      <SectionHeader title="Demo Containers" />
      <div className="space-y-3">
        {DEMO_CONTAINERS.map((container) => (
          <GlassCard key={container.id} className="py-3">
            <p className="font-semibold">{container.name}</p>
            <p className="text-sm text-cherry-bubblegum">{container.description}</p>
            <p className="mt-1 text-xs text-white/40">{container.qrCode}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
