'use client';

import { ReactNode } from 'react';

interface HUDPanelProps {
  children: ReactNode;
  className?: string;
  intense?: boolean;
  animated?: boolean;
}

export function HUDPanel({ children, className = '', intense = false, animated = false }: HUDPanelProps) {
  return (
    <div
      className={`
        ${intense ? 'glow-box-intense' : 'glow-box'}
        rounded-sm p-6 backdrop-blur-sm
        ${animated ? 'pulse-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
