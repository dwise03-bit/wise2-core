'use client';

import { MainNav } from './components/navigation/MainNav';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#050505] to-[#1a1a2e]">
      <MainNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
