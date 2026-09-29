'use client';

/**
 * WISE² Brand Icon System
 * Professional SVG icons matching the WISE² design system
 * Colors: Primary Blue #0094FF, Accent Red #FF5535, Success Green #2CD588
 */

interface IconProps {
  size?: number; // Default: 24
  color?: string; // Default: currentColor
  className?: string;
  strokeWidth?: number;
}

// AUDIO & MIXER ICONS
export const MicIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 12C8 15.31 10.13 18.08 13 18.71V22H11V23H13H15V22H13V18.71C15.87 18.08 18 15.31 18 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const SpeakerIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9V15H7L12 20V4L7 9H3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.54 8.46C16.5 9.41 17.07 10.76 17.07 12.15C17.07 13.54 16.5 14.89 15.54 15.84" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const MuteIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9V15H7L12 20V4L7 9H3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 9L9 23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const SoloIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// STREAM & BROADCAST ICONS
export const LiveIcon = ({ size = 24, color = '#FF5535', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" opacity="0.4" />
  </svg>
);

export const StreamIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 7V17C23 18.66 21.66 20 20 20H4C2.34 20 1 18.66 1 17V7C1 5.34 2.34 4 4 4H20C21.66 4 23 5.34 23 7Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 16L16 12L10 8V16Z" fill={color} />
  </svg>
);

export const CameraIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ANALYTICS & PERFORMANCE ICONS
export const ChartIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V21H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 18V9M12 18V5M17 18V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendUpIcon = ({ size = 24, color = '#2CD588', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 6L13.5 15.5M13.5 15.5L9 11M13.5 15.5L23 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6H23V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendDownIcon = ({ size = 24, color = '#FF5535', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 18L13.5 8.5M13.5 8.5L9 13M13.5 8.5L23 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 18H23V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ActivityIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 12H18M6 12H2M12 22V18M12 6V2M20.49 3.51L17.66 6.34M6.34 17.66L3.51 20.49M20.49 20.49L17.66 17.66M6.34 6.34L3.51 3.51" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// CONTROL & ACTION ICONS
export const PlayIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 3L19 12L5 21V3Z" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
  </svg>
);

export const PauseIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="4" width="4" height="16" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
    <rect x="14" y="4" width="4" height="16" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
  </svg>
);

export const StopIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
  </svg>
);

export const RecordIcon = ({ size = 24, color = '#FF5535', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill={color} opacity="0.8" />
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" opacity="0.4" />
  </svg>
);

// STATUS & INDICATORS
export const CheckIcon = ({ size = 24, color = '#2CD588', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WarningIcon = ({ size = 24, color = '#FF9500', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L2 20H22L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 9V13M12 17H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const ErrorIcon = ({ size = 24, color = '#FF5535', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 7V13M12 17H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const InfoIcon = ({ size = 24, color = '#0094FF', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 16V12M12 8H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// NAVIGATION & UI
export const MenuIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21M3 12H21M3 18H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const SettingsIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const SearchIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// EXPORT ALL AS OBJECT FOR EASY REFERENCE
export const Icons = {
  Mic: MicIcon,
  Speaker: SpeakerIcon,
  Mute: MuteIcon,
  Solo: SoloIcon,
  Live: LiveIcon,
  Stream: StreamIcon,
  Camera: CameraIcon,
  Chart: ChartIcon,
  TrendUp: TrendUpIcon,
  TrendDown: TrendDownIcon,
  Activity: ActivityIcon,
  Play: PlayIcon,
  Pause: PauseIcon,
  Stop: StopIcon,
  Record: RecordIcon,
  Check: CheckIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Info: InfoIcon,
  Menu: MenuIcon,
  Settings: SettingsIcon,
  Search: SearchIcon,
  Close: CloseIcon,
};
