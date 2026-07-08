import React, { ReactNode } from 'react';
import Image from 'next/image';

// ============================================================================
// DESIGN TOKENS (CSS-in-JS)
// ============================================================================

export const tokens = {
  colors: {
    blue: {
      50: '#E0F7FF',
      100: '#B3EBFF',
      200: '#80DDFF',
      300: '#4DCFFF',
      400: '#1AC2FF',
      500: '#00D9FF', // Primary
      600: '#00A8CC',
      700: '#007799',
      800: '#004D66',
      900: '#002433',
    },
    red: {
      50: '#FFE8E8',
      100: '#FFCCCC',
      200: '#FF9999',
      300: '#FF6666',
      400: '#FF4D4D', // Primary
      500: '#FF3333',
      600: '#CC2929',
      700: '#991F1F',
      800: '#661414',
      900: '#330A0A',
    },
    neutral: {
      50: '#F5F5F5',
      100: '#E5E5E5',
      200: '#D0D0D0',
      300: '#A8A8A8',
      400: '#808080',
      500: '#5A5A5A',
      600: '#3D3D3D',
      700: '#2A2A2A',
      800: '#1A1A1A',
      900: '#000000',
    },
    semantic: {
      success: '#00FF00',
      warning: '#FFAA00',
      error: '#FF0040',
      info: '#00D9FF',
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
};

// ============================================================================
// ATOMS
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    font-bold uppercase text-xs sm:text-sm rounded transition-all
    focus:outline-none focus:offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none
  `;

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs h-8',
    md: 'px-8 py-3 text-sm h-10',
    lg: 'px-10 py-4 text-base h-12',
  };

  const variantStyles = {
    primary: `
      bg-[#00D9FF] text-black hover:shadow-lg hover:shadow-blue-500/50
      hover:scale-105 active:scale-95
    `,
    secondary: `
      bg-[#FF4D4D] text-white hover:shadow-lg hover:shadow-red-500/50
      hover:scale-105 active:scale-95
    `,
    ghost: `
      bg-transparent text-[#00D9FF] border border-[#00D9FF]
      hover:bg-[#00D9FF]/10 hover:shadow-lg hover:shadow-blue-500/30
    `,
    outline: `
      bg-transparent border-2 border-[#00D9FF] text-[#00D9FF]
      hover:bg-[#00D9FF]/5 hover:shadow-lg hover:shadow-blue-500/40
    `,
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  glow?: 'blue' | 'red' | 'dual' | 'none';
  children: ReactNode;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  glow = 'none',
  children,
  className = '',
}) => {
  const glowStyles = {
    blue: 'animate-glow text-shadow-blue',
    red: 'animate-glow-red',
    dual: 'animate-glow',
    none: '',
  };

  const variantStyles = {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-black leading-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-black leading-tight',
    h3: 'text-2xl md:text-3xl font-bold leading-snug',
    h4: 'text-xl md:text-2xl font-bold leading-snug',
    body: 'text-base md:text-lg leading-relaxed',
    small: 'text-sm md:text-base leading-normal',
  };

  return (
    <div className={`${variantStyles[variant]} ${glowStyles[glow]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// MOLECULES
// ============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  maxLength,
  autoComplete,
  required,
}) => {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="sr-only">
        {label} {required && '(required)'}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          flex-1 px-4 py-3.5 rounded bg-black/30 border-2 text-[#00D9FF]
          placeholder-gray-600 focus:outline-none transition-all
          focus:border-[#00D9FF] focus:shadow-lg focus:shadow-blue-500/50
          ${error ? 'border-[#FF0040]' : 'border-[#00D9FF]'}
          text-sm sm:text-base
        `}
      />
      {error && (
        <span id={`${id}-error`} className="text-[#FF6B35] text-sm mt-2">
          {error}
        </span>
      )}
    </div>
  );
};

interface NeonBorderProps {
  children: ReactNode;
  variant?: 'blue' | 'red';
  className?: string;
}

export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  variant = 'blue',
  className = '',
}) => {
  const glowColor = variant === 'blue' ? '#00D9FF' : '#FF4D4D';
  const glowRGBA = variant === 'blue' ? 'rgba(0, 217, 255, 0.25)' : 'rgba(255, 77, 77, 0.25)';
  const rgbValues = variant === 'blue' ? '0, 217, 255' : '255, 77, 77';

  return (
    <div
      className={`
        relative p-6 backdrop-filter backdrop-blur-md
        border-2 transition-all overflow-hidden group
        hover:shadow-2xl ${className}
      `}
      style={{
        borderColor: glowColor,
        backgroundColor: variant === 'blue'
          ? 'rgba(0, 217, 255, 0.05)'
          : 'rgba(255, 77, 77, 0.05)',
        boxShadow: `
          0 0 40px ${glowRGBA},
          inset 0 0 40px rgba(${rgbValues}, 0.08),
          0 0 80px rgba(${rgbValues}, 0.15)
        `,
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
      }}
    >
      {/* Tech corner accent - top right */}
      <div
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          borderRight: `2px solid ${glowColor}`,
          borderTop: `2px solid ${glowColor}`,
          opacity: 0.6,
        }}
      />
      {/* Tech corner accent - bottom left */}
      <div
        className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
        style={{
          borderLeft: `2px solid ${glowColor}`,
          borderBottom: `2px solid ${glowColor}`,
          opacity: 0.6,
        }}
      />
      {children}
    </div>
  );
};

interface FeatureBoxProps {
  icon?: ReactNode;
  title: string;
  description: string;
  variant?: 'blue' | 'red';
  children?: ReactNode;
  className?: string;
}

export const FeatureBox: React.FC<FeatureBoxProps> = ({
  icon,
  title,
  description,
  variant = 'blue',
  children,
  className = '',
}) => {
  return (
    <NeonBorder variant={variant} className={`hover:scale-105 ${className}`}>
      {icon && <div className="mb-4 text-2xl">{icon}</div>}
      <h3 className="text-lg md:text-xl font-bold mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-gray-300 mb-4">
        {description}
      </p>
      {children}
    </NeonBorder>
  );
};

interface HeroTitleProps {
  variant?: 'darrin' | 'danny' | 'dual';
  children: ReactNode;
  className?: string;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  variant = 'dual',
  children,
  className = '',
}) => {
  const glowClass = variant === 'darrin'
    ? 'animate-glow'
    : variant === 'danny'
    ? 'animate-glow-red'
    : 'animate-glow';

  return (
    <h2
      className={`
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black
        leading-[1.1] mb-8 md:mb-12
        ${glowClass}
        ${className}
      `}
      style={{
        textShadow: variant === 'darrin'
          ? '0 0 10px #00D9FF, 0 0 20px #00D9FF'
          : variant === 'danny'
          ? '0 0 10px #FF4D4D, 0 0 20px #FF4D4D'
          : '0 0 10px #00D9FF, 0 0 20px #00D9FF',
      }}
    >
      {children}
    </h2>
  );
};

// ============================================================================
// ORGANISMS
// ============================================================================

interface HeroSectionProps {
  backgroundImage: string;
  backgroundAlt: string;
  children: ReactNode;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  backgroundAlt,
  children,
  className = '',
}) => {
  return (
    <section className={`relative w-full min-h-screen md:h-screen bg-black overflow-hidden ${className}`}>
      <div className="relative w-full h-full min-h-screen md:h-screen">
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center items-center">
          {children}
        </div>
      </div>
    </section>
  );
};

interface EmailCaptureFormProps {
  onSubmit: (email: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export const EmailCaptureForm: React.FC<EmailCaptureFormProps> = ({
  onSubmit,
  placeholder = 'your@email.com',
  buttonText = 'Get Access',
  className = '',
}) => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const statusRef = React.useRef<HTMLDivElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Email address is required');
      setStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await onSubmit(email);
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto px-2 sm:px-0 ${className}`}
      noValidate
    >
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === 'success' && 'Email successfully added to waitlist. Check back soon!'}
        {status === 'error' && errorMessage && `Error: ${errorMessage}`}
        {status === 'loading' && 'Adding email to waitlist...'}
      </div>

      <FormField
        id="email-input"
        label="Email address"
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={setEmail}
        disabled={status === 'loading' || status === 'success'}
        error={status === 'error' ? errorMessage : undefined}
        maxLength={255}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        aria-busy={status === 'loading'}
        className="whitespace-nowrap"
      >
        {status === 'loading' && 'Adding...'}
        {status === 'success' && '✓ Added'}
        {status === 'idle' || status === 'error' ? buttonText : ''}
      </Button>
    </form>
  );
};

// ============================================================================
// GLOBAL STYLES (Include in layout)
// ============================================================================

export const GlobalStyles = () => {
  return (
    <style>{`
      @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF, 0 0 30px #00D9FF; }
        50% { text-shadow: 0 0 20px #00D9FF, 0 0 40px #00D9FF, 0 0 60px #00D9FF; }
      }

      @keyframes glow-red {
        0%, 100% { text-shadow: 0 0 10px #FF4D4D, 0 0 20px #FF4D4D, 0 0 30px #FF4D4D; }
        50% { text-shadow: 0 0 20px #FF4D4D, 0 0 40px #FF4D4D, 0 0 60px #FF4D4D; }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.4), inset 0 0 20px rgba(0, 217, 255, 0.1); }
        50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6), inset 0 0 30px rgba(0, 217, 255, 0.2); }
      }

      @keyframes scan-lines {
        0% { transform: translateY(0); }
        100% { transform: translateY(10px); }
      }

      @keyframes hologram-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.95; }
      }

      .animate-glow {
        animation: glow 3s ease-in-out infinite;
        letter-spacing: -0.02em;
      }

      .animate-glow-red {
        animation: glow-red 3s ease-in-out infinite;
        letter-spacing: -0.02em;
      }

      .float-panel {
        animation: float 4s ease-in-out infinite, hologram-flicker 0.1s ease-in-out infinite;
      }

      .fade-in-up {
        animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }

      /* Tech divider */
      .tech-divider {
        background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3) 20%, rgba(0, 217, 255, 0.3) 80%, transparent);
        position: relative;
      }

      .tech-divider::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 2px;
        background: #00D9FF;
        box-shadow: 0 0 10px #00D9FF;
      }

      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `}</style>
  );
};
