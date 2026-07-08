import React from 'react';

// Animated HUD corner brackets
export const HUDCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'red';
  className?: string;
}> = ({ position, size = 'md', variant = 'blue', className = '' }) => {
  const sizeMap = { sm: '20px', md: '32px', lg: '48px' };
  const color = variant === 'blue' ? '#00D9FF' : '#FF4D4D';

  const positionMap = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <div
      className={`absolute pointer-events-none ${positionMap[position]} ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        animation: 'hud-pulse 2s ease-in-out infinite',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {position === 'top-left' && (
          <>
            <line x1="0" y1="0" x2="40" y2="0" stroke={color} strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="40" stroke={color} strokeWidth="2" />
          </>
        )}
        {position === 'top-right' && (
          <>
            <line x1="0" y1="0" x2="40" y2="0" stroke={color} strokeWidth="2" />
            <line x1="40" y1="0" x2="40" y2="40" stroke={color} strokeWidth="2" />
          </>
        )}
        {position === 'bottom-left' && (
          <>
            <line x1="0" y1="40" x2="40" y2="40" stroke={color} strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="40" stroke={color} strokeWidth="2" />
          </>
        )}
        {position === 'bottom-right' && (
          <>
            <line x1="0" y1="40" x2="40" y2="40" stroke={color} strokeWidth="2" />
            <line x1="40" y1="0" x2="40" y2="40" stroke={color} strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  );
};

// Animated horizontal scan line
export const ScanLine: React.FC<{
  variant?: 'blue' | 'red';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}> = ({ variant = 'blue', speed = 'normal', className = '' }) => {
  const color = variant === 'blue' ? '#00D9FF' : '#FF4D4D';
  const speedMap = { slow: '8s', normal: '4s', fast: '2s' };

  return (
    <div
      className={`absolute left-0 right-0 h-1 pointer-events-none ${className}`}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 20px ${color}`,
        animation: `scan-line-move ${speedMap[speed]} linear infinite`,
      }}
    />
  );
};

// Tech line connecting two points
export const TechLine: React.FC<{
  animated?: boolean;
  variant?: 'blue' | 'red';
  className?: string;
}> = ({ animated = true, variant = 'blue', className = '' }) => {
  const color = variant === 'blue' ? '#00D9FF' : '#FF4D4D';

  return (
    <div
      className={`relative h-1 ${className}`}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 10px ${color}`,
        overflow: 'hidden',
      }}
    >
      {animated && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
            animation: 'tech-line-flow 2s linear infinite',
          }}
        />
      )}
    </div>
  );
};

// HUD box with animated corners
export const HUDBox: React.FC<{
  children: React.ReactNode;
  variant?: 'blue' | 'red';
  className?: string;
}> = ({ children, variant = 'blue', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <HUDCorner position="top-left" variant={variant} size="sm" />
      <HUDCorner position="top-right" variant={variant} size="sm" />
      <HUDCorner position="bottom-left" variant={variant} size="sm" />
      <HUDCorner position="bottom-right" variant={variant} size="sm" />
      {children}
    </div>
  );
};

// Global HUD animations
export const HUDStyles = () => {
  return (
    <style>{`
      @keyframes hud-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      @keyframes scan-line-move {
        0% { top: -100%; }
        100% { top: 100%; }
      }

      @keyframes tech-line-flow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes hud-flicker {
        0%, 100% { opacity: 1; }
        2% { opacity: 0.95; }
        4% { opacity: 1; }
        19% { opacity: 1; }
        21% { opacity: 0.95; }
        23% { opacity: 1; }
        54% { opacity: 1; }
        56% { opacity: 0.95; }
        100% { opacity: 1; }
      }

      @keyframes circuit-pulse {
        0%, 100% {
          stroke-dashoffset: 1000;
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          stroke-dashoffset: 0;
          opacity: 0;
        }
      }

      .hud-flicker {
        animation: hud-flicker 0.15s infinite;
      }

      .tech-line-vertical {
        position: relative;
        width: 2px;
        background: linear-gradient(180deg, transparent, #00D9FF, transparent);
        box-shadow: 0 0 10px #00D9FF;
      }

      .tech-line-vertical::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 20%;
        background: #00D9FF;
        box-shadow: 0 0 20px #00D9FF;
        animation: tech-line-flow 3s linear infinite;
      }
    `}</style>
  );
};
