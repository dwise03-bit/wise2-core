'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FormSection from './FormSection';
import { FormInput, FormTextarea, FormCheckboxGroup, FormSelect } from './FormFields';
import FormNavigation from './FormNavigation';
import StepTracker from './StepTracker';

interface FormLayoutProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  isSubmitting: boolean;
  onSubmit: (formData: Record<string, any>) => void;
}

export default function FormLayout({
  currentStep,
  onStepChange,
  isSubmitting,
  onSubmit,
}: FormLayoutProps) {
  // Form state — OPTIMIZED 2-STEP FORM
  const [formData, setFormData] = useState({
    // STEP 1: Tell Us About Your Project (5 required fields)
    fullName: '',
    email: '',
    companyName: '',
    projectType: '',
    projectDescription: '',

    // STEP 2: Let's Dive Deeper (optional progressive profiling)
    primaryGoal: '',
    preferredTimeline: '',
    budgetRange: '',
    preferredContactMethod: [] as string[],

    // Conditional fields (show based on projectType)
    hasExistingWebsite: '',
    importantPlatforms: [] as string[],
    processesToAutomate: [] as string[],
    currentTools: '',
    brandAssetsAvailable: [] as string[],

    // Optional fields
    phone: '',
    website: '',
    additionalInfo: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const projectTypeOptions = [
    { value: 'website', label: 'Website / Redesign' },
    { value: 'ecommerce', label: 'E-Commerce Store' },
    { value: 'branding', label: 'Branding / Logo' },
    { value: 'marketing', label: 'Marketing / Growth' },
    { value: 'automation', label: 'AI Automation' },
    { value: 'other', label: 'Other (please describe)' },
  ];

  const platformOptions = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'pwa', label: 'PWA (App-like)' },
  ];

  const automationOptions = [
    { value: 'lead-followup', label: 'Lead Follow-up' },
    { value: 'email', label: 'Email Automation' },
    { value: 'crm', label: 'CRM Integration' },
    { value: 'scheduling', label: 'Scheduling' },
    { value: 'content', label: 'Content Generation' },
    { value: 'other', label: 'Other' },
  ];

  const brandAssetOptions = [
    { value: 'logo', label: 'Logo' },
    { value: 'colors', label: 'Brand Colors' },
    { value: 'fonts', label: 'Fonts' },
    { value: 'guide', label: 'Brand Guide' },
    { value: 'none', label: 'None yet' },
  ];

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'text', label: 'Text' },
    { value: 'zoom', label: 'Zoom Call' },
  ];

  return (
    <div className="space-y-8">
      {/* Step Tracker — Now 2 steps */}
      <StepTracker currentStep={currentStep} totalSteps={2} />

      {/* STEP 1: Tell Us About Your Project */}
      {currentStep === 1 && (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
        >
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            <FormSection title="Your Details" number={1} side="left">
              <FormInput
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Sarah Chen"
              />
              <FormInput
                label="Work Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@company.com"
              />
              <p className="text-xs text-gray-500 mt-1">We'll never spam you</p>
            </FormSection>
          </div>

          {/* Center: Hero messaging */}
          <div className="hidden lg:flex lg:col-span-6 items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">STEP 1 OF 2</p>
              <p className="text-white font-bold text-lg">Tell Us About Your Project</p>
              <p className="text-gray-500 text-sm max-w-xs">Quick intake to get started — just the essentials</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <FormSection title="Your Project" number={1} side="right">
              <FormInput
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Acme Corp (or 'Freelancer')"
              />
              <FormSelect
                label="What do you need?"
                options={projectTypeOptions}
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
              />
              <FormTextarea
                label="Brief Description"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="e.g., We need a modern website that converts visitors to leads"
              />
              <p className="text-xs text-gray-500">Min 10 characters</p>
            </FormSection>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Let's Dive Deeper (Progressive Profiling) */}
      {currentStep === 2 && (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
        >
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            <FormSection title="Your Timeline" number={2} side="left">
              <div className="space-y-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider">
                  When do you want to start?
                </label>
                {[
                  { value: 'asap', label: 'ASAP (within 2 weeks)' },
                  { value: 'this-month', label: 'This month' },
                  { value: 'next-month', label: 'Next month' },
                  { value: 'flexible', label: 'Flexible / TBD' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="timeline"
                      value={option.value}
                      checked={formData.preferredTimeline === option.value}
                      onChange={(e) => handleInputChange('preferredTimeline', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-[#00D9FF]">{option.label}</span>
                  </label>
                ))}
              </div>
            </FormSection>
          </div>

          {/* Center: Hero messaging */}
          <div className="hidden lg:flex lg:col-span-6 items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">✨</div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">STEP 2 OF 2</p>
              <p className="text-white font-bold text-lg">Let's Dive Deeper</p>
              <p className="text-gray-500 text-sm max-w-xs">Optional details to help us tailor your strategy</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <FormSection title="Your Budget & Goals" number={2} side="right">
              <FormSelect
                label="Budget Range"
                options={[
                  { value: '2500-5000', label: '$2,500 - $5,000' },
                  { value: '5000-10000', label: '$5,000 - $10,000' },
                  { value: '10000-25000', label: '$10,000 - $25,000' },
                  { value: '25000-50000', label: '$25,000 - $50,000' },
                  { value: '50000+', label: '$50,000+' },
                  { value: 'discuss', label: "Let's discuss" },
                ]}
                value={formData.budgetRange}
                onChange={(e) => handleInputChange('budgetRange', e.target.value)}
              />
              <p className="text-xs text-gray-500">Helps us recommend the right package</p>
            </FormSection>
          </div>
        </motion.div>
      )}

      {/* Conditional content for Step 2 continued (scrollable section) */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Primary Goal */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              What's your primary goal?
            </h3>
            <FormTextarea
              label=""
              value={formData.primaryGoal}
              onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
              placeholder="e.g., Increase leads by 40% in 6 months"
            />
          </div>

          {/* How to reach you */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Best way to reach you
            </h3>
            <FormCheckboxGroup
              options={contactMethodOptions}
              selected={formData.preferredContactMethod}
              onChange={(values) => handleInputChange('preferredContactMethod', values)}
              accentColor="blue"
            />
          </div>

          {/* Conditional Fields Based on Project Type */}
          {formData.projectType === 'website' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Website Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-white uppercase tracking-wider mb-3 block">
                    Do you have an existing website?
                  </label>
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No, starting fresh' },
                    { value: 'unsure', label: 'Not sure' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group mb-2">
                      <input
                        type="radio"
                        name="existing-website"
                        value={option.value}
                        checked={formData.hasExistingWebsite === option.value}
                        onChange={(e) => handleInputChange('hasExistingWebsite', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-[#00D9FF]">{option.label}</span>
                    </label>
                  ))}
                </div>
                <FormCheckboxGroup
                  label="Important platforms?"
                  options={platformOptions}
                  selected={formData.importantPlatforms}
                  onChange={(values) => handleInputChange('importantPlatforms', values)}
                  accentColor="blue"
                />
              </div>
            </div>
          )}

          {formData.projectType === 'automation' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Automation Details
              </h3>
              <FormCheckboxGroup
                label="What processes need automation?"
                options={automationOptions}
                selected={formData.processesToAutomate}
                onChange={(values) => handleInputChange('processesToAutomate', values)}
                accentColor="blue"
              />
              <FormInput
                label="Current tools you use"
                value={formData.currentTools}
                onChange={(e) => handleInputChange('currentTools', e.target.value)}
                placeholder="e.g., Zapier, Make, custom API"
              />
            </div>
          )}

          {formData.projectType === 'branding' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Branding Assets
              </h3>
              <FormCheckboxGroup
                label="What brand assets do you have?"
                options={brandAssetOptions}
                selected={formData.brandAssetsAvailable}
                onChange={(values) => handleInputChange('brandAssetsAvailable', values)}
                accentColor="blue"
              />
            </div>
          )}

          {/* Optional Fields */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Optional Details
            </h3>
            <FormInput
              label="Phone (optional)"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
            <FormInput
              label="Website (optional)"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yoursite.com"
            />
            <FormTextarea
              label="Anything else we should know?"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Challenges, team size, special requirements, etc."
            />
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <FormNavigation
        currentStep={currentStep}
        totalSteps={2}
        onPrevious={() => onStepChange(Math.max(1, currentStep - 1))}
        onNext={() => onStepChange(Math.min(2, currentStep + 1))}
        onSubmit={() => onSubmit(formData)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
