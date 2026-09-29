'use client';

import React, { ReactNode, CSSProperties } from 'react';

/**
 * WISE² Production UI Component Library
 *
 * Provides consistent, production-ready UI components with:
 * - Unified spacing and typography
 * - Dark theme consistency (#0a0a0a, #39FF14 accents)
 * - Hover/focus/active states
 * - Loading states and skeletons
 * - Error/success feedback
 * - Full keyboard accessibility
 * - Responsive design patterns
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const UITokens = {
  // Colors
  colors: {
    bg: '#0a0a0a',
    bgSecondary: '#161616',
    surface: '#0d0d0d',
    surfaceHover: '#1a1a1a',
    border: '#262626',
    borderHover: '#3a3a3a',
    text: '#ffffff',
    textMuted: '#999999',
    textDimmed: '#666666',
    accent: '#39FF14',
    accentDim: '#1f4d18',
    accentBright: '#b6ff9e',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#0094ff',
  },

  // Spacing (8px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },

  // Shadows for depth
  shadows: {
    sm: 'inset 0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.6)',
    accent: '0 0 8px rgba(57,255,20,0.3)',
    accentBright: '0 0 16px rgba(57,255,20,0.6)',
  },

  // Typography
  typography: {
    fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    fontFamilyDisplay: "'Orbitron', sans-serif",
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 100,
    overlay: 1100,
    modal: 1200,
    tooltip: 1300,
  },
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    fullWidth,
    className = '',
    children,
    disabled,
    ...props
  }, ref) => {
    // Base styles
    let baseClass = 'font-semibold rounded-lg transition-all duration-150 font-studio disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    // Size variants
    const sizeClass = {
      sm: 'px-3 py-1.5 text-xs h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    }[size];

    // Variant styles
    const variantClass = {
      primary: `
        bg-wise-accent text-black font-bold
        hover:bg-wise-accent-bright hover:shadow-[0_0_16px_rgba(57,255,20,0.4)]
        active:bg-wise-accent-dim
        focus:outline-none focus:ring-2 focus:ring-wise-accent focus:ring-offset-2 focus:ring-offset-studio-bg
      `,
      secondary: `
        bg-studio-raised border border-studio-line text-white
        hover:border-wise-accent hover:bg-studio-panel
        active:bg-studio-bg
        focus:outline-none focus:ring-2 focus:ring-wise-accent focus:ring-offset-2 focus:ring-offset-studio-bg
      `,
      tertiary: `
        bg-transparent text-wise-accent border border-transparent
        hover:border-wise-accent hover:bg-wise-accent-dim
        active:bg-wise-accent-dim
        focus:outline-none focus:ring-2 focus:ring-wise-accent
      `,
      danger: `
        bg-red-600 text-white font-bold
        hover:bg-red-700 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]
        active:bg-red-800
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-studio-bg
      `,
      ghost: `
        bg-transparent text-gray-300
        hover:text-wise-accent hover:bg-studio-raised
        active:bg-studio-panel
        focus:outline-none focus:ring-2 focus:ring-wise-accent
      `,
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClass} ${sizeClass} ${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading && <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {icon && !isLoading && <span className="inline-flex">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, fullWidth, className = '', ...props }, ref) => (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-studio-input border border-studio-line
            text-white text-sm font-studio
            placeholder:text-gray-600
            focus:outline-none focus:border-wise-accent focus:ring-2 focus:ring-wise-accent focus:ring-offset-2 focus:ring-offset-studio-bg
            hover:border-studio-line transition-colors duration-150
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 font-semibold">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-600 mt-1.5">{hint}</p>}
    </div>
  )
);

Input.displayName = 'Input';

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  hoverable?: boolean;
  children: ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, hoverable, className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        rounded-lg border border-studio-line
        bg-studio-panel p-4
        transition-all duration-200
        ${elevated ? 'shadow-lg' : ''}
        ${hoverable ? 'hover:border-wise-accent hover:shadow-[inset_0_0_12px_rgba(57,255,20,0.1)] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

// ============================================================================
// LOADING SKELETON
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  count?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, rounded, count = 1, className = '', ...props }, ref) => (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            ref={ref}
            className={`
              bg-studio-line animate-pulse
              ${rounded ? 'rounded-lg' : 'rounded-md'}
              ${className}
            `}
            style={{
              width: width || '100%',
              height: height || '16px',
            }}
            {...props}
          />
        ))}
    </>
  )
);

Skeleton.displayName = 'Skeleton';

// ============================================================================
// TOAST/FEEDBACK COMPONENTS
// ============================================================================

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, title, message, action, onClose }) => {
  const colors = {
    success: { bg: '#10b981', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    warning: { bg: '#f59e0b', icon: '⚠' },
    info: { bg: '#0094ff', icon: 'ℹ' },
  };

  const { bg, icon } = colors[type];

  return (
    <div className="fixed bottom-6 right-6 z-[1300] max-w-sm animate-[slideIn_0.3s_ease-out]">
      <div className={`rounded-lg border-l-4 p-4 bg-studio-panel border-studio-line`} style={{ borderLeftColor: bg }}>
        <div className="flex items-start gap-3">
          <span className="flex-none text-xl font-bold" style={{ color: bg }}>
            {icon}
          </span>
          <div className="flex-1">
            {title && <p className="font-semibold text-white text-sm">{title}</p>}
            <p className="text-gray-400 text-sm">{message}</p>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-semibold text-white hover:underline flex-none"
            >
              {action.label}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white flex-none transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', size = 'sm', className = '', children, ...props }) => {
  const variants = {
    primary: 'bg-wise-accent-dim text-wise-accent',
    success: 'bg-emerald-900 text-emerald-300',
    warning: 'bg-amber-900 text-amber-300',
    error: 'bg-red-900 text-red-300',
    info: 'bg-blue-900 text-blue-300',
    neutral: 'bg-studio-line text-gray-300',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-studio-line ${className}`} />;
  }
  return <div className={`h-px bg-studio-line ${className}`} />;
};

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position = 'top', children }) => {
  const positionClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[position];

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`
          absolute ${positionClass} left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none
          bg-studio-raised border border-studio-line rounded-lg px-3 py-2
          text-xs text-gray-300 whitespace-nowrap z-[1300]
        `}
      >
        {content}
        <div className={`
          absolute w-2 h-2 bg-studio-raised border-studio-line
          ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' : ''}
          ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' : ''}
          ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' : ''}
          ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b' : ''}
        `} />
      </div>
    </div>
  );
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

// ============================================================================
// KEYBOARD SHORTCUTS HANDLER
// ============================================================================

export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+G: Generate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        shortcuts['generate']?.();
      }
      // Space: Play/Pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        shortcuts['playPause']?.();
      }
      // Ctrl+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        shortcuts['save']?.();
      }
      // Escape: Close
      if (e.key === 'Escape') {
        shortcuts['close']?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// ============================================================================
// ANIMATION CSS
// ============================================================================

export const AnimationStyles = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  -100% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.animate-slideIn {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-scaleIn {
  animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

export default UITokens;
