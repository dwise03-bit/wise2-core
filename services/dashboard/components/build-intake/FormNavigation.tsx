'use client';

import { motion } from 'framer-motion';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: (formData?: Record<string, any>) => void;
  isSubmitting: boolean;
}

export default function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center justify-between gap-4 pt-8 border-t border-gray-800"
    >
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`px-6 py-3 border-2 rounded-sm font-bold uppercase text-sm tracking-wider transition ${
          isFirstStep
            ? 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
            : 'border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10'
        }`}
      >
        ← Previous
      </motion.button>

      {/* Step Indicator */}
      <div className="text-center text-sm text-gray-400">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Next or Submit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isLastStep ? onSubmit : onNext}
        disabled={isSubmitting}
        className={`px-6 py-3 border-2 rounded-sm font-bold uppercase text-sm tracking-wider transition ${
          isLastStep
            ? 'border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D]/10'
            : 'border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10'
        }`}
        style={{
          boxShadow:
            isLastStep && !isSubmitting
              ? '0 0 20px rgba(255, 77, 77, 0.3)'
              : '0 0 10px rgba(0, 217, 255, 0.3)',
        }}
      >
        {isLastStep ? (
          <>
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              'GET MY STRATEGY'
            )}
          </>
        ) : (
          <>
            Next →
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
