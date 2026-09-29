import React from 'react';
import type { Metadata } from 'next';
import { RevenueHeader } from '../../src/components/revenue-os';

export const metadata: Metadata = {
  title: 'Contractor OS | WISE²',
  description: 'AI workforce, pipeline, and attribution for the WISE² Contractor OS.',
  robots: 'noindex, nofollow',
};

export default function RevenueOsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <RevenueHeader />
      {children}
    </div>
  );
}
