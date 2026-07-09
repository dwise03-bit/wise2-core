'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import FormLayout from './FormLayout';
import WorkflowProgression from './WorkflowProgression';
import { BackgroundGrid } from './Background/BackgroundGrid';
import { FloatingParticles } from './Background/FloatingParticles';
import { FloatingCharacters } from './FloatingCharacters';
import { Header } from './Header';
import { trackFormStep } from '@/lib/services';

export default function BuildIntakeClient() {
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
        // Show success message (you can add a modal/toast here)
        alert(`Success! Your project ID: ${result.projectId}\n\n${result.message}`);
        // Reset form or redirect
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation Header */}
      <Header />

      {/* Background Effects */}
      <BackgroundGrid />
      <FloatingParticles />
      <FloatingCharacters />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
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
