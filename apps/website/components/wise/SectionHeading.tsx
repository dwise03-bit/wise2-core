import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  accent?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  accent = true,
  className = '',
  align = 'center',
}) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`${alignStyles[align]} ${className}`}>
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-wise-text-primary leading-tight mb-4">
        {title.split('\n').map((line, idx) => (
          <span key={idx}>
            {accent && line.toUpperCase().includes('WISE') && (
              <>
                <span className="text-wise-accent-green">WISE</span>
                {line.substring(4)}
                <br />
              </>
            )}
            {!accent || !line.toUpperCase().includes('WISE') ? (
              <>
                {line}
                {idx < title.split('\n').length - 1 && <br />}
              </>
            ) : null}
          </span>
        ))}
      </h2>
      {subtitle && (
        <p className="text-lg text-wise-text-muted mt-4 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};
