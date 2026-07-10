'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FormLayout from './FormLayout';
import { trackFormStep } from '@/lib/services';

export default function FormSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    trackFormStep(currentStep);
  }, [currentStep]);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    console.log('📤 Submitting form data:', formData);
    console.log('📤 Data keys:', Object.keys(formData));
    console.log('📤 Data stringified:', JSON.stringify(formData));

    try {
      const requestBody = JSON.stringify(formData);
      console.log('📤 Request body:', requestBody);

      const response = await fetch('/api/submit-build-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();

      console.log('🔍 API Response:', result);

      if (result.success) {
        alert(`Success! Your project ID: ${result.projectId}\n\n${result.message}`);
        setCurrentStep(1);
      } else {
        console.error('❌ Validation Error:', result);
        const errorMsg = result.details
          ? JSON.stringify(result.details, null, 2)
          : result.error || 'Form submission failed';
        alert(`Validation Error:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="mt-24"
    >
      <FormLayout
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        isSubmitting={isSubmitting}
        onSubmit={(formData) => handleFormSubmit(formData)}
      />
    </motion.div>
  );
}
