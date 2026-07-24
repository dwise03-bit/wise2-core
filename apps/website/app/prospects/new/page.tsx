'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LEAD_SOURCES = [
  { value: 'DIRECT', label: 'Direct' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'CONTENT', label: 'Content/Blog' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProspectIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        estimatedOpportunity: formData.estimatedOpportunity
          ? parseFloat(formData.estimatedOpportunity)
          : 0,
      };

      const response = await fetch('/api/v1/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to create prospect'
        );
      }

      setSuccess(true);
      setFormData({
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

      // Redirect to CRM dashboard after 2 seconds
      setTimeout(() => {
        router.push('/crm/prospects');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-500/20 bg-gradient-to-r from-black via-black to-green-950/10">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            New Prospect Intake
          </h1>
          <p className="mt-2 text-gray-400">
            Capture prospect information to feed the sales pipeline
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 rounded-lg border border-green-500 bg-green-500/10 p-4">
            <p className="text-sm text-green-200">
              ✓ Prospect created successfully. Redirecting to dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-green-500/20 bg-gradient-to-br from-green-950/5 to-black p-6 sm:p-8"
        >
          {/* Business Information Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-green-400">
              Business Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="Acme Corporation"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="SaaS, Healthcare, etc."
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Lead Source
                </label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white focus:border-green-400 focus:outline-none"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-green-400">
              Contact Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Opportunity Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-green-400">
              Opportunity Details
            </h2>
            <div className="grid gap-6">
              {/* Estimated Opportunity */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Estimated Opportunity ($)
                </label>
                <input
                  type="number"
                  name="estimatedOpportunity"
                  value={formData.estimatedOpportunity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="50000"
                  step="1000"
                  min="0"
                />
              </div>

              {/* Primary Problem */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Primary Problem *
                </label>
                <textarea
                  name="primaryProblem"
                  value={formData.primaryProblem}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="What business problem are they trying to solve?"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="Any additional context about this prospect..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded border border-gray-600 px-6 py-2 text-white hover:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
