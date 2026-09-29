'use client';

import React from 'react';

export function ExportPanel() {
  const exportOptions = [
    { label: 'Export as PDF', icon: '📄' },
    { label: 'Export as CSV', icon: '📊' },
    { label: 'Share Report', icon: '📤' },
    { label: 'Schedule Report', icon: '📅' },
  ];

  return (
    <div className="flex gap-2">
      {exportOptions.map((opt, i) => (
        <button
          key={i}
          className="flex items-center gap-2 px-3 py-2 bg-[#101010] border border-[#161616] rounded hover:border-emerald-500/30 transition text-xs font-semibold"
          title={opt.label}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
