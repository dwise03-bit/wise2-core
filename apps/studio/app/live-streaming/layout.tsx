'use client';

import type { ReactNode } from 'react';

export default function LiveStreamingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <style>{`
        :root {
          --color-primary: #0034FF;
          --color-primary-hover: #2340FF;
          --color-accent: #E53935;
          --color-background: #0F0F23;
          --color-foreground: #F8FAFC;
          --color-muted: #1D1F1B;
          --color-border: rgba(0, 52, 255, 0.2);
          --color-success: #22C55E;
          --space-0: 0px;
          --space-1: 4px;
          --space-2: 8px;
          --space-3: 12px;
          --space-4: 16px;
          --space-6: 24px;
          --space-8: 32px;
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --duration-fast: 150ms;
          --duration-normal: 300ms;
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
