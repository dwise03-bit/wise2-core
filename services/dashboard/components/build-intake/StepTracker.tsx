'use client';

import { motion } from 'framer-motion';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepTracker({ currentStep, totalSteps }: StepTrackerProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase font-bold text-[#00D9FF]">
            Progress
          </span>
          <span className="text-sm text-gray-400">
            {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden border-b-2 border-[#00D9FF]/20">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00D9FF] to-[#FF4D4D]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Step Circles */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <motion.div
              key={stepNum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              className={`h-2 rounded-full transition-all ${
                isActive
                  ? 'bg-[#00D9FF] w-8'
                  : isCompleted
                  ? 'bg-[#FF4D4D] w-3'
                  : 'bg-gray-700 w-2'
              }`}
              style={{
                boxShadow: isActive ? '0 0 10px rgba(0, 217, 255, 0.8)' : 'none',
              }}
              title={`Step ${stepNum}`}
            />
          );
        })}
      </div>
    </div>
  );
}
