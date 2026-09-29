'use client';

import React from 'react';

// ============================================================================
// WISE² UI COMPONENT LIBRARY - Professional Polish & Micro-interactions
// ============================================================================

// Toast Notification System
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000 }) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor = {
    success: 'bg-wise-neon',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-wise-cyan',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-wise-navy px-6 py-3 rounded-lg font-semibold flex items-center gap-3 animate-fade-in shadow-lg`}>
      <span className="text-lg">{icon}</span>
      <span>{message}</span>
    </div>
  );
};

// Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-2 border-wise-cyan/30 border-t-wise-cyan rounded-full animate-spin`} />
  );
};

// Loading State Card
export const LoadingCard: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-wise-navy/40 border border-wise-cyan/10 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-wise-cyan/20 rounded w-3/4 mb-3" />
        <div className="h-3 bg-wise-cyan/15 rounded w-1/2 mb-2" />
        <div className="space-y-2">
          <div className="h-2 bg-wise-cyan/15 rounded w-full" />
          <div className="h-2 bg-wise-cyan/15 rounded w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

// Empty State
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="text-center py-16 px-4">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-wise-cyan mb-2">{title}</h3>
    <p className="text-wise-cyan/60 mb-6 max-w-sm">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-gradient-to-r from-wise-cyan to-wise-neon text-wise-navy rounded-lg font-semibold hover:shadow-lg hover:shadow-wise-cyan/50 transition-all transform hover:scale-105 active:scale-95"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Success State
export const SuccessState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="text-center py-12 px-4 bg-gradient-to-b from-wise-neon/10 to-transparent rounded-xl border border-wise-neon/20">
    <div className="text-5xl mb-4 animate-bounce">✓</div>
    <h3 className="text-2xl font-bold text-wise-neon mb-2">{title}</h3>
    <p className="text-wise-neon/70">{message}</p>
  </div>
);

// Error State
export const ErrorState: React.FC<{ title: string; message: string; onRetry?: () => void }> = ({
  title,
  message,
  onRetry,
}) => (
  <div className="text-center py-12 px-4 bg-gradient-to-b from-red-500/10 to-transparent rounded-xl border border-red-500/20">
    <div className="text-5xl mb-4">✕</div>
    <h3 className="text-2xl font-bold text-red-400 mb-2">{title}</h3>
    <p className="text-red-400/70 mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95"
      >
        Retry
      </button>
    )}
  </div>
);

// Professional Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-wise-cyan to-wise-neon text-wise-navy hover:shadow-lg hover:shadow-wise-cyan/50',
    secondary: 'bg-wise-cyan/20 text-wise-cyan border border-wise-cyan/40 hover:bg-wise-cyan/30',
    accent: 'bg-gradient-to-r from-wise-gold to-wise-gold/80 text-wise-navy hover:shadow-lg hover:shadow-wise-gold/50',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2`}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// Input Field with Validation
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, helperText, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-wise-cyan mb-2">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-3 text-lg">{icon}</span>}
      <input
        className={`w-full px-4 py-2.5 ${icon ? 'pl-10' : ''} bg-wise-navy/50 border ${error ? 'border-red-500' : 'border-wise-cyan/20'} rounded-lg text-white placeholder-wise-cyan/40 focus:outline-none focus:border-wise-cyan focus:ring-2 focus:ring-wise-cyan/30 transition-all`}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    {helperText && <p className="text-wise-cyan/60 text-sm mt-1">{helperText}</p>}
  </div>
);

// Textarea with Validation
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charLimit?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  charLimit,
  value,
  ...props
}) => {
  const charCount = (value as string)?.length || 0;
  const remaining = charLimit ? charLimit - charCount : null;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-wise-cyan mb-2">{label}</label>}
      <textarea
        className={`w-full px-4 py-2.5 bg-wise-navy/50 border ${error ? 'border-red-500' : 'border-wise-cyan/20'} rounded-lg text-white placeholder-wise-cyan/40 focus:outline-none focus:border-wise-cyan focus:ring-2 focus:ring-wise-cyan/30 transition-all resize-none`}
        value={value}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {helperText && <p className="text-wise-cyan/60 text-sm">{helperText}</p>}
        </div>
        {remaining !== null && (
          <p className={`text-xs ${remaining < 50 ? 'text-red-400' : 'text-wise-cyan/60'}`}>
            {charCount}/{charLimit}
          </p>
        )}
      </div>
    </div>
  );
};

// Progress Ring (Circular Progress)
export const ProgressRing: React.FC<{ value: number; max?: number; label?: string }> = ({
  value,
  max = 100,
  label,
}) => {
  const radius = 45;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(0, 217, 255, 0.1)"
          strokeWidth="4"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#00FF7F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <p className="text-3xl font-bold text-wise-cyan">{percentage}%</p>
        {label && <p className="text-sm text-wise-cyan/60">{label}</p>}
      </div>
    </div>
  );
};

// Modal/Dialog
interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' }[];
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-gradient-to-b from-wise-navy/95 to-wise-navy/80 border border-wise-cyan/20 rounded-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-wise-cyan">{title}</h2>
          <button
            onClick={onClose}
            className="text-wise-cyan/60 hover:text-wise-cyan transition-colors text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {actions && (
          <div className="flex gap-3 justify-end">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || 'secondary'}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Stat Card with Animation
interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; percent: number };
  color?: 'cyan' | 'neon' | 'gold' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'cyan' }) => {
  const colors = {
    cyan: 'text-wise-cyan bg-wise-cyan/10 border-wise-cyan/20',
    neon: 'text-wise-neon bg-wise-neon/10 border-wise-neon/20',
    gold: 'text-wise-gold bg-wise-gold/10 border-wise-gold/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
  };

  return (
    <div className={`${colors[color]} border rounded-xl p-6 transition-all duration-300 hover:border-opacity-40 hover:shadow-lg transform hover:scale-102`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className={`text-${color}/60 text-sm font-medium mb-1`}>{label}</p>
          <p className={`text-4xl font-bold text-${color}`}>{value}</p>
        </div>
        {icon && <span className="text-3xl opacity-60">{icon}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span className={trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-red-400' : 'text-wise-cyan/60'}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          </span>
          <span className={trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-red-400' : 'text-wise-cyan/60'}>
            {trend.percent}%
          </span>
        </div>
      )}
    </div>
  );
};

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'success' | 'warning' | 'error' }> = ({
  children,
  variant = 'primary',
}) => {
  const variants = {
    primary: 'bg-wise-cyan/20 text-wise-cyan border border-wise-cyan/40',
    success: 'bg-green-500/20 text-green-400 border border-green-500/40',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    error: 'bg-red-500/20 text-red-400 border border-red-500/40',
  };

  return <span className={`${variants[variant]} px-3 py-1 rounded-full text-xs font-semibold border`}>{children}</span>;
};

// Animation styles
export const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }

  .scale-102 {
    transform: scale(1.02);
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
