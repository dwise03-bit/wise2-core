'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FormFields from './FormFields';

interface FormLayoutProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  isSubmitting: boolean;
  onSubmit: (data: Record<string, any>) => void;
}

export default function FormLayout({
  currentStep,
  onStepChange,
  isSubmitting,
  onSubmit,
}: FormLayoutProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    projectType: '',
    projectDescription: '',
    primaryGoal: '',
    preferredTimeline: '',
    budgetRange: '',
    preferredContactMethod: [],
    phone: '',
    website: '',
    additionalInfo: '',
  });

  const isStep1Valid = () => {
    const { fullName, email, companyName, projectType, projectDescription } = formData;
    return (
      fullName.trim().length >= 2 &&
      email.includes('@') &&
      companyName.trim().length >= 1 &&
      projectType.trim().length >= 1 &&
      projectDescription.trim().length >= 10
    );
  };

  const getStep1Error = () => {
    const { fullName, email, companyName, projectType, projectDescription } = formData;

    if (fullName.trim().length < 2) return `Name must be at least 2 characters (${fullName.length}/2)`;
    if (!email.includes('@')) return 'Please enter a valid email';
    if (!companyName.trim()) return 'Please enter your company name';
    if (!projectType.trim()) return 'Please select what you need';
    if (projectDescription.trim().length < 10)
      return `Description must be at least 10 characters (${projectDescription.length}/10)`;

    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1 && !isStep1Valid()) {
      alert(getStep1Error());
      return;
    }
    if (currentStep === 2) {
      onSubmit(formData);
    }
  };

  const handleNext = () => {
    if (!isStep1Valid()) {
      alert(getStep1Error());
      return;
    }
    onStepChange(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto px-4"
    >
      <div className="border-2 border-[#00D9FF]/30 rounded-lg p-8 sm:p-12 bg-black/50 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && (
            <FormFields.Step1 formData={formData} onInputChange={handleInputChange} />
          )}

          {currentStep === 2 && (
            <FormFields.Step2 formData={formData} onInputChange={handleInputChange} />
          )}

          <div className="flex gap-4 pt-4">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => onStepChange(1)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-[#00D9FF] text-[#00D9FF] font-bold uppercase rounded hover:bg-[#00D9FF]/10 transition disabled:opacity-60"
              >
                Back
              </button>
            )}

            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#00D9FF] text-black font-bold uppercase rounded hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-60"
              >
                Next
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#FF4D4D] text-white font-bold uppercase rounded hover:shadow-lg hover:shadow-red-500/50 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
