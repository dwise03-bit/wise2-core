interface TrendIconProps {
  positive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TrendIcon({ positive, size = 'md' }: TrendIconProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  if (positive) {
    return (
      <svg className={`${sizeClass} inline mr-1`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5z" />
      </svg>
    );
  }

  return (
    <svg className={`${sizeClass} inline mr-1`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}
