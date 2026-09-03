import React from 'react';
import { cn } from '@/lib/utils';

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContainer({ children, className }: CardContainerProps) {
  return (
    <div className={cn(
      'bg-black border border-neon-green rounded-lg p-4 h-full',
      'shadow-lg shadow-neon-green/20',
      'hover:shadow-neon-green/40 transition-shadow',
      className
    )}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-neon-green font-bold text-sm uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

interface CardValueProps {
  children: React.ReactNode;
  className?: string;
}

export function CardValue({ children, className }: CardValueProps) {
  return (
    <div className={cn('text-white text-4xl font-bold mt-3', className)}>
      {children}
    </div>
  );
}

interface CardMetaProps {
  children: React.ReactNode;
  positive?: boolean;
  className?: string;
}

export function CardMeta({ children, positive, className }: CardMetaProps) {
  return (
    <div className={cn(
      'text-sm mt-2 font-semibold',
      positive ? 'text-neon-green' : 'text-red-500',
      className
    )}>
      {children}
    </div>
  );
}

interface CardLoadingProps {
  className?: string;
}

export function CardLoading({ className }: CardLoadingProps) {
  return (
    <CardContainer className={className}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/3" />
      </div>
    </CardContainer>
  );
}

interface CardErrorProps {
  error?: Error;
  className?: string;
}

export function CardError({ error, className }: CardErrorProps) {
  return (
    <CardContainer className={cn('border-red-500', className)}>
      <CardTitle>Error</CardTitle>
      <p className="text-red-500 text-sm mt-2">{error?.message || 'Failed to load data'}</p>
    </CardContainer>
  );
}
