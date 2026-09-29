'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';

export default function ProspectIntakePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    primaryProblem: '',
    leadSource: 'DIRECT',
    estimatedOpportunity: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.primaryProblem.trim()) newErrors.primaryProblem = 'Problem statement is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedOpportunity: formData.estimatedOpportunity ? parseInt(formData.estimatedOpportunity) : 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/crm/prospects';
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex items-center justify-center py-12">
        <Container maxWidth="md">
          <Card variant="elevated" className="text-center space-y-6">
            <div className="text-6xl">✓</div>
            <h1 className="text-3xl font-bold text-[#2CD588]">Submission Received!</h1>
            <p className="text-[#A0A0A0]">Thank you for your interest. We'll be in touch soon.</p>
            <p className="text-sm text-[#727272]">Redirecting to dashboard...</p>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] py-12 sm:py-16 lg:py-24">
      <Container maxWidth="md">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="info">Consulting Inquiry</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold">
              Tell Us About Your <span className="text-[#2CD588]">Project</span>
            </h1>
            <p className="text-[#A0A0A0] text-lg">
              Help us understand your needs so we can provide the best solution for your business.
            </p>
          </div>

          {/* Form */}
          <Card variant="elevated">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 text-[#EF4444] text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Business Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#2CD588]">Business Information</h2>
                
                <div>
                  <Label htmlFor="businessName" required>Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Your company name"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName" required>Contact Name</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={handleChange}
                      error={errors.contactName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" required>Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="e.g., Technology, Marketing, etc."
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadSource">How did you hear about us?</Label>
                    <select
                      id="leadSource"
                      name="leadSource"
                      value={formData.leadSource}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#101114] text-[#F5F5F5] border border-[#1A1A1A] focus:outline-none focus:border-[#2CD588] focus:ring-2 focus:ring-[#2CD588]/20 transition-all duration-150"
                    >
                      <option value="DIRECT">Direct</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="SEARCH">Search Engine</option>
                      <option value="SOCIAL">Social Media</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4 border-t border-[#1A1A1A] pt-6">
                <h2 className="text-lg font-bold text-[#2CD588]">Project Details</h2>

                <div>
                  <Label htmlFor="primaryProblem" required>What's your main challenge?</Label>
                  <textarea
                    id="primaryProblem"
                    name="primaryProblem"
                    placeholder="Describe the problem you're trying to solve..."
                    value={formData.primaryProblem}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-[#101114] text-[#F5F5F5] border border-[#1A1A1A] placeholder-[#727272] focus:outline-none focus:border-[#2CD588] focus:ring-2 focus:ring-[#2CD588]/20 transition-all duration-150 resize-none"
                  />
                  {errors.primaryProblem && (
                    <p className="mt-2 text-sm text-[#EF4444]">{errors.primaryProblem}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedOpportunity">Estimated Project Value ($)</Label>
                  <Input
                    id="estimatedOpportunity"
                    name="estimatedOpportunity"
                    type="number"
                    placeholder="0"
                    value={formData.estimatedOpportunity}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Any other details we should know..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[#101114] text-[#F5F5F5] border border-[#1A1A1A] placeholder-[#727272] focus:outline-none focus:border-[#2CD588] focus:ring-2 focus:ring-[#2CD588]/20 transition-all duration-150 resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t border-[#1A1A1A]">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="flex-1"
                  isLoading={loading}
                  disabled={loading}
                >
                  Submit Inquiry
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  className="flex-1"
                  disabled={loading}
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
