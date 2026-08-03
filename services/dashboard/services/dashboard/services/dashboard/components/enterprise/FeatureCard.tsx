'use client';

import { ReactNode } from 'react';

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}

export function FeatureCard({ icon, title, description, children }: FeatureCardProps) {
  return (
    <div className="glow-box rounded-sm p-6 h-full flex flex-col">
      {icon && (
        <div className="text-chaos-ice text-3xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-chaos-ice mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4 flex-grow">{description}</p>
      {children}
    </div>
  );
}
