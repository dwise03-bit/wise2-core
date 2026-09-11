'use client';

import { useEffect, useState } from 'react';

interface BootStep {
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface BootScreenProps {
  onComplete: () => void;
  isLoading?: boolean;
}

export function BootScreen({ onComplete, isLoading = true }: BootScreenProps) {
  const [steps, setSteps] = useState<BootStep[]>([
    { label: 'SYSTEM', status: 'loading' },
    { label: 'NETWORK', status: 'pending' },
    { label: 'INTELLIGENCE', status: 'pending' },
    { label: 'SDR', status: 'pending' },
    { label: 'MESH', status: 'pending' },
    { label: 'WISE²', status: 'pending' },
  ]);

  useEffect(() => {
    const sequence = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSteps((p) => [{ ...p[0], status: 'complete' }, { ...p[1], status: 'loading' }, ...p.slice(2)]);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSteps((p) => [
        ...p.slice(0, 1),
        { ...p[1], status: 'complete' },
        { ...p[2], status: 'loading' },
        ...p.slice(3),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSteps((p) => [
        ...p.slice(0, 2),
        { ...p[2], status: 'complete' },
        { ...p[3], status: 'loading' },
        ...p.slice(4),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));
      setSteps((p) => [
        ...p.slice(0, 3),
        { ...p[3], status: 'complete' },
        { ...p[4], status: 'loading' },
        ...p.slice(5),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSteps((p) => [
        ...p.slice(0, 4),
        { ...p[4], status: 'complete' },
        { ...p[5], status: 'loading' },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSteps((p) => [...p.slice(0, 5), { ...p[5], status: 'complete' }]);

      await new Promise((resolve) => setTimeout(resolve, 800));
      onComplete();
    };

    if (isLoading) {
      sequence();
    }
  }, [isLoading, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-16 p-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl font-black text-green-400 mb-2">WISE²</div>
        <div className="text-3xl font-bold text-gray-400 mb-4">DEFENSE</div>
        <div className="text-xl font-mono text-gray-500">IMP</div>
        <div className="text-xs text-gray-600 mt-4">EDGE INTELLIGENCE NODE</div>
      </div>

      {/* Boot sequence */}
      <div className="w-96 space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{step.label}</span>
              <span
                className={
                  step.status === 'complete'
                    ? 'text-green-400'
                    : step.status === 'loading'
                      ? 'text-blue-400 animate-pulse'
                      : step.status === 'error'
                        ? 'text-red-400'
                        : 'text-gray-600'
                }
              >
                {step.status === 'complete' && '✓ ONLINE'}
                {step.status === 'loading' && '⟳ INITIALIZING'}
                {step.status === 'error' && '✗ ERROR'}
                {step.status === 'pending' && '• waiting'}
              </span>
            </div>
            <div className="h-0.5 bg-gray-800 mt-1">
              <div
                className={`h-full ${
                  step.status === 'complete' ? 'bg-green-500 w-full' : 'bg-blue-500'
                } transition-all duration-500`}
                style={{
                  width:
                    step.status === 'loading'
                      ? '70%'
                      : step.status === 'complete'
                        ? '100%'
                        : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="text-xs text-green-600 font-mono tracking-widest">
        TRAIN. TEACH. PROTECT.
      </div>
    </div>
  );
}
