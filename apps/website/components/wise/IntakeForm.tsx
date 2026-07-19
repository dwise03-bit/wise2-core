'use client';

import { useState } from 'react';
import { Button } from './Button';
import { wise2Content } from '@/data/wise2-content';

interface FormData {
  name: string;
  business: string;
  email: string;
  phone: string;
  website: string;
  services: string;
  budget: string;
  file: File | null;
  description: string;
  startDate: string;
}

interface IntakeFormProps {
  onSubmit?: (data: FormData) => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    business: '',
    email: '',
    phone: '',
    website: '',
    services: '',
    budget: '',
    file: null,
    description: '',
    startDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Default: send to API
        const response = await fetch('/api/intake', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Submission failed');
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        business: '',
        email: '',
        phone: '',
        website: '',
        services: '',
        budget: '',
        file: null,
        description: '',
        startDate: '',
      });

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-lg border border-wise-accent-green bg-wise-bg-secondary text-center">
        <div className="text-6xl mb-4">✓</div>
        <h3 className="text-3xl font-bold font-display text-wise-accent-green mb-2">
          Thank You!
        </h3>
        <p className="text-wise-text-muted">
          We've received your project details. Our team will review and be in touch within 24-48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
            placeholder="Darrin Johnson"
          />
        </div>

        {/* Business */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="business"
            value={formData.business}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
            placeholder="WISE² Defense LLC"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
            placeholder="darrin@wise2.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
            placeholder="+1 (615) 555-0123"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Website or Portfolio (optional)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
            placeholder="https://wise2.com"
          />
        </div>

        {/* Services Dropdown */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Primary Service Needed *
          </label>
          <select
            name="services"
            value={formData.services}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
          >
            <option value="">Select a service...</option>
            {wise2Content.serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Dropdown */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Budget Range *
          </label>
          <select
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
          >
            <option value="">Select a budget range...</option>
            {wise2Content.budgetOptions.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-bold text-wise-text-primary mb-2">
            Desired Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green"
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-bold text-wise-text-primary mb-2">
          Upload Reference Materials (optional)
        </label>
        <input
          type="file"
          name="file"
          onChange={handleFileChange}
          className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green file:bg-wise-accent-green file:text-wise-bg-primary file:border-0 file:px-4 file:py-2 file:rounded file:font-bold file:cursor-pointer"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-wise-text-primary mb-2">
          Tell Us About Your Vision *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-3 rounded bg-wise-bg-secondary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green focus:ring-1 focus:ring-wise-accent-green resize-none"
          placeholder="Describe your project, goals, and any specific requirements..."
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Submitting...' : 'Submit Project Brief'}
      </Button>

      <p className="text-xs text-wise-text-muted text-center">
        * Required fields
      </p>
    </form>
  );
};
