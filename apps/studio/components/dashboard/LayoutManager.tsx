'use client';

import React, { useState } from 'react';

interface Widget {
  id: string;
  title: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  isDragging: boolean;
}

export function LayoutManager() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', title: 'System Health', position: 'top-left', size: 'medium', isDragging: false },
    { id: '2', title: 'Analytics', position: 'top-right', size: 'medium', isDragging: false },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  const handleDragStart = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isDragging: true } : w))
    );
  };

  const handleDrop = (targetPosition: Widget['position'], id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: targetPosition, isDragging: false } : w))
    );
  };

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">DASHBOARD LAYOUT</h3>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition"
        >
          {isEditMode ? 'Save' : 'Edit Layout'}
        </button>
      </div>

      {isEditMode ? (
        <div className="grid grid-cols-2 gap-4">
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
            <div
              key={pos}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {}}
              className="min-h-32 bg-[#050505] border-2 border-dashed border-emerald-500/30 rounded p-4 text-center text-xs text-gray-500"
            >
              Drop widget here ({pos})
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Click "Edit Layout" to rearrange widgets</p>
      )}
    </div>
  );
}
