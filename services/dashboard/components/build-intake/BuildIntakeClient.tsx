'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import FormLayout from './FormLayout';
import WorkflowProgression from './WorkflowProgression';
import { BackgroundGrid } from './Background/BackgroundGrid';
import { FloatingParticles } from './Background/FloatingParticles';

export default function BuildIntakeClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-build-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message (you can add a modal/toast here)
        alert(`Success! Your project ID: ${result.projectId}\n\n${result.message}`);
        // Reset form or redirect
        setCurrentStep(1);
      } else {
        alert('Form submission failed. Please try again.');
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
      {/* Background Effects */}
      <BackgroundGrid />
      <FloatingParticles />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <HeroSection />

          {/* Form Container */}
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

          {/* Workflow Progression */}
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
