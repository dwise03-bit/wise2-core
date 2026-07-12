'use client';

import { ReactNode } from 'react';

interface ChromeTitleProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
}

export function ChromeTitle({ children, as: Component = 'h2', className = '' }: ChromeTitleProps) {
  return (
    <Component className={`chrome-text ${className}`}>
      {children}
    </Component>
  );
}
