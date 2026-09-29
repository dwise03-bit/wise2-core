'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const FormField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: string[];
  index: number;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ label, name, type = 'text', value, onChange, placeholder, required, rows, options, index, isFocused, onFocus, onBlur }) => {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: index * 0.06,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <label className="block text-sm font-bold text-wise-text-primary mb-2 transition-colors duration-300 group-focus-within:text-wise-accent-green">
        {label} {required && <span className="text-wise-accent-green">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          rows={rows || 5}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border-2 transition-all duration-300 text-wise-text-primary placeholder-wise-text-muted focus:outline-none resize-none ${
            isFocused
              ? 'border-wise-accent-green bg-wise-accent-green/5 shadow-lg shadow-wise-accent-green/30'
              : 'border-wise-accent-green-border hover:border-wise-accent-green/50'
          }`}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          className={`w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border-2 transition-all duration-300 text-wise-text-primary focus:outline-none ${
            isFocused
              ? 'border-wise-accent-green bg-wise-accent-green/5 shadow-lg shadow-wise-accent-green/30'
              : 'border-wise-accent-green-border hover:border-wise-accent-green/50'
          }`}
        >
          <option value="">{placeholder || 'Select an option...'}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border-2 transition-all duration-300 text-wise-text-primary placeholder-wise-text-muted focus:outline-none ${
            isFocused
              ? 'border-wise-accent-green bg-wise-accent-green/5 shadow-lg shadow-wise-accent-green/30'
              : 'border-wise-accent-green-border hover:border-wise-accent-green/50'
          }`}
        />
      )}
    </motion.div>
  );
};

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitProgress, setSubmitProgress] = useState(0);
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
      const progressInterval = setInterval(() => {
        setSubmitProgress((prev) => (prev < 90 ? prev + Math.random() * 40 : prev));
      }, 100);

      if (onSubmit) {
        onSubmit(formData);
      } else {
        const response = await fetch('/api/intake', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Submission failed');
      }

      clearInterval(progressInterval);
      setSubmitProgress(100);
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

      setTimeout(() => {
        setIsSuccess(false);
        setSubmitProgress(0);
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="w-full max-w-2xl mx-auto p-8 rounded-2xl border-2 border-wise-accent-green bg-gradient-to-br from-wise-accent-green/10 via-wise-bg-secondary to-wise-bg-primary text-center backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.div
            className="text-6xl inline-block"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              repeat: 2,
              ease: 'easeInOut',
            }}
          >
            ✓
          </motion.div>
        </motion.div>

        <motion.h3
          className="text-3xl font-bold font-display text-wise-accent-green mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Project Received! 🎉
        </motion.h3>
        <motion.p
          className="text-wise-text-secondary mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Your project brief has been successfully submitted.
        </motion.p>
        <motion.p
          className="text-wise-text-muted text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Our team will review your details and be in touch within 24-48 hours. Get ready to bring your vision to life!
        </motion.p>
      </motion.div>
    );
  }

  const fields = [
    { label: 'Your Name', name: 'name', type: 'text', placeholder: 'Darrin Johnson', required: true },
    { label: 'Business Name', name: 'business', type: 'text', placeholder: 'WISE² Defense LLC', required: true },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'darrin@wise2.com', required: true },
    { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+1 (615) 555-0123', required: true },
    { label: 'Website or Portfolio', name: 'website', type: 'url', placeholder: 'https://wise2.com', required: false },
    { label: 'Primary Service Needed', name: 'services', type: 'select', options: wise2Content.serviceOptions, required: true },
    { label: 'Budget Range', name: 'budget', type: 'select', options: wise2Content.budgetOptions, required: true },
    { label: 'Desired Start Date', name: 'startDate', type: 'date', required: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {fields.slice(0, 6).map((field, index) => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            value={formData[field.name as keyof FormData] as string}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            options={field.type === 'select' ? field.options : undefined}
            index={index}
            isFocused={focusedField === field.name}
            onFocus={() => setFocusedField(field.name)}
            onBlur={() => setFocusedField(null)}
          />
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {fields.slice(6).map((field, index) => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            value={formData[field.name as keyof FormData] as string}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            options={field.type === 'select' ? field.options : undefined}
            index={index + 6}
            isFocused={focusedField === field.name}
            onFocus={() => setFocusedField(field.name)}
            onBlur={() => setFocusedField(null)}
          />
        ))}
      </motion.div>

      {/* File Upload */}
      <motion.div
        className="group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: 0.5,
        }}
        whileHover={{ scale: 1.02 }}
      >
        <label className="block text-sm font-bold text-wise-text-primary mb-2 transition-colors duration-300 group-focus-within:text-wise-accent-green">
          Upload Reference Materials (optional)
        </label>
        <label className="relative block w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border-2 border-dashed border-wise-accent-green-border hover:border-wise-accent-green/70 cursor-pointer transition-all duration-300 hover:bg-wise-accent-green/5 group">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-center">
            <div className="text-2xl mb-1">📎</div>
            <div className="text-sm text-wise-text-muted group-hover:text-wise-accent-green transition-colors">
              {formData.file ? `📄 ${formData.file.name}` : 'Click to upload or drag and drop'}
            </div>
          </div>
        </label>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: 0.56,
        }}
      >
        <FormField
        label="Tell Us About Your Vision"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe your project, goals, and any specific requirements..."
        required
        rows={5}
        index={8}
        isFocused={focusedField === 'description'}
        onFocus={() => setFocusedField('description')}
        onBlur={() => setFocusedField(null)}
      />
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="w-full h-1 bg-wise-bg-secondary rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-wise-accent-green to-white/50"
              style={{ width: `${submitProgress}%` }}
              transition={{ type: 'tween', duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-wise-accent-green hover:bg-white text-wise-bg-primary font-bold rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: 0.62,
        }}
        whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: isLoading ? 'none' : '0 0 25px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-wise-bg-primary border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              ✦ Submit Project Brief
            </>
          )}
        </div>
      </motion.button>

      <motion.p
        className="text-xs text-wise-text-muted text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.68 }}
      >
        * Required fields
      </motion.p>
    </form>
  );
};
