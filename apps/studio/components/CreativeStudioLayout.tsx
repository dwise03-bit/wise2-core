'use client';

import React, { useEffect } from 'react';
import { useCreativeStudioStore } from '@/lib/creativeStudioStore';
import {
  CommandCenterPage,
  SoundLabPage,
  LiveStudioPage,
  JingleLabPage,
  VoiceLabPage,
  ContentFactoryPage,
  ClientShowcasePage,
} from './StudioPages';

/**
 * Minimal Creative Studio shell for verification gate.
 * Renders: top bar, left nav, command palette toggle, main area placeholder.
 * All 7 page buttons work and switch content.
 * Used by app/studio/page.tsx.
 */
export default function CreativeStudioLayout() {
  const {
    page,
    goToPage,
    paletteOpen,
    openPalette,
    closePalette,
    paletteQ,
    setPaletteQuery,
    notifOpen,
    profileOpen,
    toggleNotif,
    toggleProfile,
    closeDropdowns,
    credits,
    viewers,
    isLive,
    checkoutOpen,
    openCheckout,
  } = useCreativeStudioStore();

  // Escape key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        closePalette();
        closeDropdowns();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette, closePalette, closeDropdowns]);

  const pages = [
    { id: 'command' as const, label: 'Command Center', glyph: 'CC' },
    { id: 'sound' as const, label: 'Sound Lab', glyph: 'SL' },
    { id: 'live' as const, label: 'Live Studio', glyph: 'LV' },
    { id: 'jingle' as const, label: 'Jingle Lab', glyph: 'JL' },
    { id: 'voice' as const, label: 'Voice Lab', glyph: 'VL' },
    { id: 'factory' as const, label: 'Content Factory', glyph: 'CF' },
    { id: 'showcase' as const, label: 'Client Showcase', glyph: 'SH' },
  ];

  const currentPageLabel = pages.find((p) => p.id === page)?.label || 'Creative Studio';

  return (
    <div className="h-screen flex flex-col bg-studio-bg text-white font-studio overflow-hidden">
      {/* TOP BAR */}
      <div className="flex items-center gap-5 h-14 px-5 bg-studio-raised border-b border-studio-line flex-none">
        {/* Logo */}
        <div className="flex items-baseline gap-0.5">
          <span className="font-display font-black text-xl bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent tracking-wider">
            WISE
          </span>
          <span className="font-display font-black text-xs text-wise-accent drop-shadow-lg" style={{ textShadow: '0 0 8px rgba(57,255,20,.6)' }}>
            ²
          </span>
        </div>

        {/* Divider + Label */}
        <div className="text-xs tracking-widest text-gray-600 uppercase border-l border-studio-line pl-3.5">
          Creative Studio
        </div>

        {/* Breadcrumb */}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span className="uppercase">Workspace</span>
          <span className="text-gray-700">/</span>
          <button className="bg-studio-input border border-studio-line text-gray-300 px-2.5 py-1 rounded text-xs font-semibold hover:border-wise-accent transition-colors flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-sm bg-wise-accent"></span>
            Wise Defense HQ
            <span className="text-gray-600 text-[10px]">▾</span>
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-semibold">{currentPageLabel}</span>
        </div>

        {/* Right Controls */}
        <div className="ml-6 flex items-center gap-4 border-l border-studio-line pl-4">
          {/* Credits + Buy Button */}
          <button
            onClick={openCheckout}
            className="px-3 py-1 rounded text-xs font-semibold bg-wise-accent text-black hover:bg-wise-accent-bright transition"
            title="Buy credits"
          >
            {credits?.toLocaleString?.() || '7,214'} ⚡ Buy
          </button>

          {/* Notifications */}
          <button
            onClick={toggleNotif}
            className="relative p-1.5 hover:bg-studio-input rounded transition-colors"
            title="Notifications (not implemented yet)"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-studio-raised border border-studio-line rounded shadow-lg z-50 p-3">
                <div className="text-xs text-gray-500">Notifications (mock)</div>
              </div>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={toggleProfile}
            className="relative p-1.5 hover:bg-studio-input rounded transition-colors"
            title="Profile (not implemented yet)"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-studio-raised border border-studio-line rounded shadow-lg z-50">
                <div className="text-xs text-gray-400 p-3 border-b border-studio-line">Profile Menu (mock)</div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* MAIN FLEX */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* LEFT NAV */}
        <div className="w-20 bg-studio-panel border-r border-studio-line flex flex-col items-center py-6 gap-2 flex-none overflow-y-auto">
          {pages.map((p) => {
            const isActive = page === p.id;
            const isLiveAndActive = p.id === 'live' && isLive;
            return (
              <button
                key={p.id}
                onClick={() => goToPage(p.id)}
                className={`relative w-16 h-16 rounded flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-wise-accent/10 border border-wise-accent/40 text-white'
                    : 'text-gray-600 border border-transparent hover:border-studio-line'
                }`}
                title={p.label}
              >
                {isLiveAndActive && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                <div className="font-display font-black text-sm">{p.glyph}</div>
                <div className="text-[9px] mt-0.5 opacity-75">{p.id}</div>
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-studio-bg">
          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {page === 'command' && <CommandCenterPage />}
              {page === 'sound' && <SoundLabPage />}
              {page === 'live' && <LiveStudioPage />}
              {page === 'jingle' && <JingleLabPage />}
              {page === 'voice' && <VoiceLabPage />}
              {page === 'factory' && <ContentFactoryPage />}
              {page === 'showcase' && <ClientShowcasePage />}
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {/* COMMAND PALETTE (MODAL) */}
      {paletteOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={closePalette}
        >
          <div
            className="bg-studio-raised border border-studio-line rounded-lg shadow-2xl w-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-4 border-b border-studio-line">
              <input
                type="text"
                autoFocus
                placeholder="Search pages, commands..."
                value={paletteQ}
                onChange={(e) => setPaletteQuery(e.target.value)}
                className="w-full bg-studio-input border border-studio-line rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-wise-accent/50 transition-colors"
              />
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {pages.length > 0 ? (
                <div>
                  {pages
                    .filter((p) => !paletteQ || p.label.toLowerCase().includes(paletteQ.toLowerCase()))
                    .slice(0, 9)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          goToPage(p.id);
                          closePalette();
                        }}
                        className="w-full px-4 py-3 text-sm text-left hover:bg-studio-input border-b border-studio-line/50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{p.label}</span>
                          <span className="text-xs text-gray-600 bg-studio-panel px-2 py-1 rounded">GO TO</span>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">No results found</div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-studio-line text-xs text-gray-600">
              <div className="flex gap-2 items-center">
                <kbd className="bg-studio-input px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      <CheckoutModal open={checkoutOpen} />
    </div>
  );
}

function CheckoutModal({ open }: { open: boolean }) {
  const { closeCheckout, payDone } = useCreativeStudioStore();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={closeCheckout}
    >
      <div
        className="bg-studio-raised border border-studio-line rounded-lg shadow-2xl w-96 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-studio-line flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Credit Packs</h2>
          <button
            onClick={closeCheckout}
            className="text-gray-500 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Packs */}
        {!payDone ? (
          <div className="p-4 space-y-2">
            {[
              { name: 'Starter', credits: 1000, price: '$49' },
              { name: 'Pro', credits: 5000, price: '$199' },
              { name: 'Studio', credits: 10000, price: '$349' },
            ].map((pack) => (
              <div key={pack.name} className="p-3 border border-studio-line rounded hover:border-wise-accent cursor-pointer transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{pack.name}</div>
                    <div className="text-xs text-gray-600">{pack.credits.toLocaleString()} credits</div>
                  </div>
                  <div className="font-bold text-wise-accent">{pack.price}</div>
                </div>
              </div>
            ))}
            <button className="w-full mt-4 px-4 py-2 bg-wise-accent text-black font-semibold rounded hover:bg-wise-accent-bright transition">
              Proceed to Payment
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <div className="text-white font-semibold mb-1">Purchase Complete</div>
            <div className="text-sm text-gray-400">5,000 credits added to your account</div>
            <button
              onClick={closeCheckout}
              className="mt-4 px-4 py-2 bg-wise-accent text-black font-semibold rounded hover:bg-wise-accent-bright transition w-full"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
