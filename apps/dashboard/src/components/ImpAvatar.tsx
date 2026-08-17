'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ImpExpression, ImpColorVariant, getImpImagePath } from '../types/imp';

export interface ImpAvatarProps {
  /**
   * The expression state of the IMP avatar
   */
  expression: ImpExpression;

  /**
   * The color variant of the IMP avatar
   * @default 'blue'
   */
  colorVariant?: ImpColorVariant;

  /**
   * The size of the avatar
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to animate transitions between images
   * @default true
   */
  animated?: boolean;

  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * ImpAvatar Component
 *
 * Renders the WISE² Personal IMP character with expression-based graphics.
 * Supports multiple color variants and sizes with smooth CSS transitions.
 *
 * @example
 * ```tsx
 * <ImpAvatar expression="idle" colorVariant="blue" size="md" />
 * <ImpAvatar expression="thinking" colorVariant="green" size="lg" animated={true} />
 * ```
 */
export const ImpAvatar = React.forwardRef<HTMLDivElement, ImpAvatarProps>(
  (
    {
      expression,
      colorVariant = 'blue',
      size = 'md',
      animated = true,
      className,
    },
    ref
  ) => {
    // Generate WebP and PNG paths for fallback support
    const webpPath = useMemo(
      () => getImpImagePath(expression, colorVariant, 'webp'),
      [expression, colorVariant]
    );

    const pngPath = useMemo(
      () => getImpImagePath(expression, colorVariant, 'png'),
      [expression, colorVariant]
    );

    // Size classes
    const sizeClasses = useMemo(() => {
      switch (size) {
        case 'sm':
          return 'w-16 h-16';
        case 'lg':
          return 'w-32 h-32';
        case 'md':
        default:
          return 'w-24 h-24';
      }
    }, [size]);

    // Transition classes
    const transitionClasses = animated ? 'transition-opacity duration-300' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-lg shadow-lg overflow-hidden',
          sizeClasses,
          className
        )}
      >
        <picture className={cn('w-full h-full', transitionClasses)}>
          {/* WebP format (modern, better compression) */}
          <source srcSet={webpPath} type="image/webp" />

          {/* PNG fallback (broader compatibility) */}
          <img
            src={pngPath}
            alt={`WISE² Personal IMP - ${expression}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </picture>
      </div>
    );
  }
);

ImpAvatar.displayName = 'ImpAvatar';
