import React from "react";

export default function PlaceholderPage({ title }) {
  return (
    <div className="p-8" data-testid={`page-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="card-panel p-10 text-center">
        <div className="font-display text-3xl text-white mb-2">{title}</div>
        <div className="text-slate-400">This module is part of the WISE² Enterprise suite.</div>
        <div className="mt-6 text-neon-cyan text-sm">Coming soon — currently in Sound Labs preview.</div>
      </div>
    </div>
  );
}
