'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Prospect {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  primaryProblem: string;
  leadSource: string;
  estimatedOpportunity: number;
  status: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  auditScheduledAt?: string;
  auditCompletedAt?: string;
  proposalSentAt?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
}

const STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'AUDIT_SCHEDULED',
  'AUDIT_COMPLETE',
  'PROPOSAL_SENT',
  'WON',
  'LOST',
];

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prospectId = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<Prospect>>({});

  useEffect(() => {
    fetchProspect();
  }, [prospectId]);

  const fetchProspect = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/prospects/${prospectId}`);
      if (!response.ok) throw new Error('Failed to fetch prospect');

      const data = await response.json();
      setProspect(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimatedOpportunity' ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/v1/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update prospect');

      const updated = await response.json();
      setProspect(updated);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/prospects/${prospectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updated = await response.json();
      setProspect(updated);
      setFormData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading prospect...</p>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded border border-red-500 bg-red-500/10 p-4">
            <p className="text-red-200">Prospect not found</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-500/20 bg-gradient-to-r from-black via-black to-green-950/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {prospect.businessName}
              </h1>
              <p className="mt-2 text-gray-400">
                {prospect.contactName} • {prospect.email}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/crm/prospects')}
                className="rounded border border-gray-600 px-4 py-2 text-white hover:bg-gray-900"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-green-400">
                Pipeline Status
              </h2>
              <select
                value={prospect.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white focus:border-green-400 focus:outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-green-400">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Contact Name
                  </label>
                  <p className="mt-1 text-white">{prospect.contactName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <p className="mt-1">
                    <a
                      href={`mailto:${prospect.email}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {prospect.email}
                    </a>
                  </p>
                </div>
                {prospect.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Phone
                    </label>
                    <p className="mt-1">
                      <a
                        href={`tel:${prospect.phone}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {prospect.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-green-400">
                Business Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Industry
                  </label>
                  <p className="mt-1 text-white">{prospect.industry || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Lead Source
                  </label>
                  <p className="mt-1 text-white">{prospect.leadSource}</p>
                </div>
              </div>
              {prospect.website && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Website
                  </label>
                  <p className="mt-1">
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {prospect.website}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Problem & Notes */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-green-400">
                Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Primary Problem
                </label>
                <p className="mt-2 whitespace-pre-wrap text-white">
                  {prospect.primaryProblem}
                </p>
              </div>
              {prospect.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Notes
                  </label>
                  <p className="mt-2 whitespace-pre-wrap text-white">
                    {prospect.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Opportunity Card */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-green-400">
                Opportunity
              </h2>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(prospect.estimatedOpportunity)}
              </p>
            </div>

            {/* Timeline */}
            <div className="rounded border border-green-500/20 bg-green-950/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-green-400">
                Timeline
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white">
                    {formatDate(prospect.createdAt)}
                  </p>
                </div>
                {prospect.auditScheduledAt && (
                  <div className="border-t border-green-500/10 pt-3">
                    <p className="text-gray-400">Audit Scheduled</p>
                    <p className="text-white">
                      {formatDate(prospect.auditScheduledAt)}
                    </p>
                  </div>
                )}
                {prospect.auditCompletedAt && (
                  <div className="border-t border-green-500/10 pt-3">
                    <p className="text-gray-400">Audit Completed</p>
                    <p className="text-white">
                      {formatDate(prospect.auditCompletedAt)}
                    </p>
                  </div>
                )}
                {prospect.proposalSentAt && (
                  <div className="border-t border-green-500/10 pt-3">
                    <p className="text-gray-400">Proposal Sent</p>
                    <p className="text-white">
                      {formatDate(prospect.proposalSentAt)}
                    </p>
                  </div>
                )}
                {prospect.wonAt && (
                  <div className="border-t border-green-500/10 pt-3">
                    <p className="text-gray-400">Won</p>
                    <p className="text-green-400">
                      {formatDate(prospect.wonAt)}
                    </p>
                  </div>
                )}
                {prospect.lostAt && (
                  <div className="border-t border-green-500/10 pt-3">
                    <p className="text-gray-400">Lost</p>
                    <p className="text-red-400">
                      {formatDate(prospect.lostAt)}
                    </p>
                    {prospect.lostReason && (
                      <p className="mt-1 text-xs text-gray-500">
                        {prospect.lostReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
