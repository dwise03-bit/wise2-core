import React from 'react';

export const Card = ({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'elevated' }) => (
  <div className={`rounded-lg border ${variant === 'elevated' ? 'shadow-lg' : ''} ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);
