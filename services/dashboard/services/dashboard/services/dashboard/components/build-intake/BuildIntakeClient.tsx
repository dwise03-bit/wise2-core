'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import FormLayout from './FormLayout';
import WorkflowProgression from './WorkflowProgression';
import { BackgroundGrid } from './Background/BackgroundGrid';
import { FloatingParticles } from './Background/FloatingParticles';
import { Header } from './Header';

export default function BuildIntakeClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    console.log('📤 Submitting form data:', formData);

    try {
      const response = await fetch('/api/submit-build-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('🔍 API Response:', result);

      if (result.success) {
        alert(`Success! Your project ID: ${result.projectId}\n\n${result.message}`);
        setCurrentStep(1);
      } else {
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />
      <BackgroundGrid />
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <HeroSection />

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

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-32"
          >
            <WorkflowProgression />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
