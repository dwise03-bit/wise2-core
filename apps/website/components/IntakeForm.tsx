'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateCheckboxArray,
  validateFiles,
  validateIntakeForm,
} from '@/lib/intake-validation';
import type { IntakeFormErrors } from '@/lib/intake-validation';

interface IntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntakeForm({ isOpen, onClose }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    projectDescription: '',
    services: [] as string[],
    files: null as FileList | null,
    agreement: false,
  });

  const [errors, setErrors] = useState<IntakeFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      let validationResult;
      if (name === 'email') validationResult = validateEmail(value);
      else if (name === 'phone') validationResult = validatePhone(value);
      else validationResult = validateRequired(value);

      setErrors((prev) => ({
        ...prev,
        [name]: validationResult.valid ? undefined : validationResult.error,
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === 'services') {
      const updated = checked
        ? [...formData.services, value]
        : formData.services.filter((s) => s !== value);
      setFormData((prev) => ({ ...prev, services: updated }));
    } else if (name === 'agreement') {
      setFormData((prev) => ({ ...prev, agreement: checked }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const result = validateFiles(Array.from(files));
      if (!result.valid) {
        setErrors((prev) => ({ ...prev, files: result.error }));
      } else {
        setFormData((prev) => ({ ...prev, files }));
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateIntakeForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let fileUrls: string[] = [];

      if (formData.files && formData.files.length > 0) {
        const uploadFormData = new FormData();
        Array.from(formData.files).forEach((file) => {
          uploadFormData.append('files', file);
        });

        const uploadRes = await fetch('/api/intake/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadRes.json();
        fileUrls = uploadData.urls || [];
      }

      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          companyName: formData.companyName,
          phone: formData.phone,
          email: formData.email,
          projectDescription: formData.projectDescription,
          services: formData.services.join(', '),
          fileUrls: fileUrls.join(', '),
          agreement: formData.agreement,
        }),
      });

      if (!res.ok) {
        throw new Error('Submission failed');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setFormData({
          fullName: '',
          companyName: '',
          phone: '',
          email: '',
          projectDescription: '',
          services: [],
          files: null,
          agreement: false,
        });
      }, 3000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        _submit: 'Submission failed. Please try again or contact support.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-wise-surface-2 border border-wise-surface-3 p-8"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl mb-4"
                >
                  ✓
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                <p className="text-wise-text-secondary text-center">
                  We received your intake form. We'll review your information and contact you
                  within 2 business days.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Book Your Consultation</h2>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Contact Information</h3>
                  <Input
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Project Description
                  </label>
                  <Textarea
                    name="projectDescription"
                    placeholder="Tell us about your project..."
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-white">
                    Services Needed (select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Branding', 'Web Design', 'AI Content', 'Video Production'].map((service) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          checked={formData.services.includes(service)}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4"
                        />
                        <span className="text-white">{service}</span>
                      </label>
                    ))}
                  </div>
                  {errors.services && (
                    <p className="text-red-500 text-sm">{errors.services}</p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Upload Assets (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.png,.gif"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded-lg bg-wise-surface-3 border border-wise-surface-4 text-white"
                  />
                  {errors.files && <p className="text-red-500 text-sm">{errors.files}</p>}
                </div>

                {/* Agreement */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4"
                  />
                  <span className="text-wise-text-secondary text-sm">
                    I agree to share my information and be contacted
                  </span>
                </label>
                {errors.agreement && <p className="text-red-500 text-sm">{errors.agreement}</p>}

                {/* Error Summary */}
                {errors._submit && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                    {errors._submit}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
