import React from 'react';

type CardVariant = 'default' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

export const Card = ({ children, className = '', variant = 'default' }: CardProps) => {
  const variantClass = variant === 'elevated'
    ? 'bg-[#0D0D0D] border-[#2CD588]/30 shadow-lg'
    : 'bg-[#0A0A0A] border-[#1A1A1A]';

  return (
    <div className={`rounded-lg border ${variantClass} ${className}`}>
      {children}
    </div>
  );
};

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