'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { DataTable, Form, Modal, type Column, type FormField } from '../components';
import { leadsService, type Lead, type LeadFilter } from '../services';
import { useAuth } from '../contexts';

export function LeadsPage() {
  const { isAuthenticated } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<LeadFilter>({});
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    if (!isAuthenticated) return;
    loadLeads();
  }, [isAuthenticated, page, filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadsService.getLeads(page, limit, filters);
      setLeads(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPage(1);
      setFilters({});
      return;
    }

    try {
      setLoading(true);
      const results = await leadsService.searchLeads(searchQuery);
      setLeads(results);
      setTotal(results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (editingLead) {
        await leadsService.updateLead(editingLead.id, formData);
      } else {
        await leadsService.createLead({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          status: formData.status || 'NEW',
          source: formData.source,
          notes: formData.notes,
        });
      }
      setShowModal(false);
      setEditingLead(null);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadsService.deleteLead(leadId);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const columns: Column<Lead>[] = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'WON' ? 'bg-green-900 text-green-200' :
          value === 'LOST' ? 'bg-red-900 text-red-200' :
          value === 'QUALIFIED' ? 'bg-blue-900 text-blue-200' :
          'bg-gray-700 text-gray-200'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'estimatedValue',
      label: 'Value',
      render: (value) => value ? `$${value.toLocaleString()}` : '-',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            className="p-1 text-blue-400 hover:text-blue-300"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const formFields: FormField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'phone' },
    { name: 'company', label: 'Company', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'New', value: 'NEW' },
        { label: 'Contacted', value: 'CONTACTED' },
        { label: 'Qualified', value: 'QUALIFIED' },
        { label: 'Proposal Sent', value: 'PROPOSAL_SENT' },
        { label: 'Negotiating', value: 'NEGOTIATING' },
        { label: 'Won', value: 'WON' },
        { label: 'Lost', value: 'LOST' },
      ],
    },
    { name: 'source', label: 'Source', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const formFieldsWithValues = editingLead ? formFields.map(f => ({
    ...f,
    defaultValue: editingLead[f.name as keyof Lead] || '',
  })) : formFields;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <button
          onClick={() => {
            setEditingLead(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Lead
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLead(null);
        }}
        title={editingLead ? 'Edit Lead' : 'New Lead'}
      >
        <Form
          fields={formFieldsWithValues}
          onSubmit={handleCreateOrUpdate}
          submitLabel={editingLead ? 'Update' : 'Create'}
        />
      </Modal>
    </div>
  );
}
