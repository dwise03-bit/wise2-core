'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, Footer } from '@/components/wise';

interface Consultant {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
}

const EXPERTISE_OPTIONS = [
  'Strategy',
  'Product',
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'AI/ML',
  'DevOps',
];

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpertise, setFilterExpertise] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: '',
    expertise: [],
    hourlyRate: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  // Fetch consultants
  const fetchConsultants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/consultants');
      if (!response.ok) throw new Error('Failed to fetch consultants');
      const data = await response.json();
      setConsultants(data.consultants || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  // Filter consultants
  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise =
      !filterExpertise || consultant.expertise.includes(filterExpertise);
    return matchesSearch && matchesExpertise;
  });

  // Paginate
  const totalPages = Math.ceil(filteredConsultants.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedConsultants = filteredConsultants.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      expertise: [],
      hourlyRate: 0,
    });
  };

  const handleAddClick = () => {
    resetForm();
    setSelectedConsultant(null);
    setShowAddModal(true);
  };

  const handleEditClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setFormData({
      name: consultant.name,
      email: consultant.email,
      bio: consultant.bio,
      expertise: consultant.expertise,
      hourlyRate: consultant.hourlyRate,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowDeleteModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/consultants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add consultant');
      await fetchConsultants();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add consultant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultant) return;
    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/admin/consultants/${selectedConsultant.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error('Failed to update consultant');
      await fetchConsultants();
      setShowEditModal(false);
      setSelectedConsultant(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update consultant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConsultant) return;
    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/admin/consultants/${selectedConsultant.id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete consultant');
      await fetchConsultants();
      setShowDeleteModal(false);
      setSelectedConsultant(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete consultant');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">Loading consultants...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold">Consultant Management</h1>
            <button
              onClick={handleAddClick}
              className="px-6 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition"
            >
              Add New Consultant
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filter by Expertise
              </label>
              <select
                value={filterExpertise}
                onChange={(e) => {
                  setFilterExpertise(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Expertise</option>
                {EXPERTISE_OPTIONS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            {paginatedConsultants.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No consultants found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Expertise
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Hourly Rate
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedConsultants.map((consultant, idx) => (
                      <tr
                        key={consultant.id}
                        className={`border-b border-[#0f0f0f] hover:bg-[#0a0a0a] transition ${
                          idx % 2 === 0 ? 'bg-[#050505]' : 'bg-[#101010]'
                        }`}
                      >
                        <td className="py-4 px-6 font-semibold">{consultant.name}</td>
                        <td className="py-4 px-6 text-gray-400">{consultant.email}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {consultant.expertise.slice(0, 2).map((exp) => (
                              <span
                                key={exp}
                                className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded"
                              >
                                {exp}
                              </span>
                            ))}
                            {consultant.expertise.length > 2 && (
                              <span className="inline-block px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                                +{consultant.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">${consultant.hourlyRate}/hr</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              consultant.isActive
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {consultant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(consultant)}
                              className="px-3 py-1 text-sm bg-[#161616] hover:bg-[#1a1a1a] rounded transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(consultant)}
                              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-6 border-t border-[#1a1a1a]">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#161616] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {consultants.length > 0 && (
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">Total Consultants</div>
                <div className="text-3xl font-bold">{consultants.length}</div>
              </div>
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">Active</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {consultants.filter((c) => c.isActive).length}
                </div>
              </div>
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">Avg. Hourly Rate</div>
                <div className="text-3xl font-bold">
                  $
                  {consultants.length > 0
                    ? Math.round(
                        consultants.reduce((sum, c) => sum + c.hourlyRate, 0) /
                          consultants.length
                      )
                    : 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <ConsultantFormModal
          title="Add New Consultant"
          formData={formData}
          onFormChange={handleFormChange}
          onExpertiseToggle={handleExpertiseToggle}
          onSubmit={handleAddSubmit}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          submitting={submitting}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedConsultant && (
        <ConsultantFormModal
          title="Edit Consultant"
          formData={formData}
          onFormChange={handleFormChange}
          onExpertiseToggle={handleExpertiseToggle}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedConsultant(null);
            resetForm();
          }}
          submitting={submitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-2 text-red-400">
              Deactivate Consultant?
            </h3>
            <p className="text-gray-400 mb-8">
              Deactivating {selectedConsultant.name} will prevent them from
              accepting new bookings. This action can be reversed.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="w-full px-4 py-3 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {submitting ? 'Deactivating...' : 'Deactivate'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedConsultant(null);
                }}
                disabled={submitting}
                className="w-full px-4 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Form Modal Component
interface ConsultantFormModalProps {
  title: string;
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onExpertiseToggle: (expertise: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

function ConsultantFormModal({
  title,
  formData,
  onFormChange,
  onExpertiseToggle,
  onSubmit,
  onClose,
  submitting,
}: ConsultantFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onFormChange}
              required
              className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onFormChange}
              required
              className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onFormChange}
              rows={3}
              className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              placeholder="Brief bio or background..."
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate || ''}
              onChange={onFormChange}
              required
              min="0"
              step="5"
              className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              placeholder="150"
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Areas of Expertise
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERTISE_OPTIONS.map((expertise) => (
                <label key={expertise} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.expertise.includes(expertise)}
                    onChange={() => onExpertiseToggle(expertise)}
                    className="w-4 h-4 rounded bg-[#050505] border border-[#1a1a1a] text-emerald-500 focus:outline-none"
                  />
                  <span className="text-gray-300">{expertise}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Consultant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
