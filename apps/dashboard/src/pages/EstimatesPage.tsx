'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Send } from 'lucide-react';
import { DataTable, Modal, Form, type Column, type FormField } from '../components';
import { estimatesService, type Estimate, type EstimateFilter } from '../services';
import { useAuth } from '../contexts';

export function EstimatesPage() {
  const { isAuthenticated } = useAuth();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<EstimateFilter>({});
  const [showModal, setShowModal] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    if (!isAuthenticated) return;
    loadEstimates();
  }, [isAuthenticated, page, filters]);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await estimatesService.getEstimates(page, limit, filters);
      setEstimates(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (editingEstimate) {
        await estimatesService.updateEstimate(editingEstimate.id, formData);
      } else {
        await estimatesService.createEstimate({
          leadId: formData.leadId,
          title: formData.title,
          description: formData.description,
          items: JSON.parse(formData.items || '[]'),
          status: 'DRAFT',
          subtotal: 0,
          tax: 0,
          total: 0,
          createdBy: 'current-user',
        });
      }
      setShowModal(false);
      setEditingEstimate(null);
      await loadEstimates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (estimateId: string) => {
    if (!window.confirm('Are you sure you want to delete this estimate?')) return;

    try {
      await estimatesService.deleteEstimate(estimateId);
      await loadEstimates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleSendEstimate = async (estimate: Estimate) => {
    const email = window.prompt('Enter recipient email:');
    if (!email) return;

    try {
      await estimatesService.sendEstimate(estimate.id, email);
      await loadEstimates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  };

  const columns: Column<Estimate>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'leadId',
      label: 'Lead ID',
      sortable: true,
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'ACCEPTED' ? 'bg-green-900 text-green-200' :
          value === 'DECLINED' ? 'bg-red-900 text-red-200' :
          value === 'SENT' ? 'bg-blue-900 text-blue-200' :
          'bg-gray-700 text-gray-200'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSendEstimate(row);
            }}
            className="p-1 text-green-400 hover:text-green-300"
            disabled={row.status !== 'DRAFT'}
          >
            <Send size={16} />
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
    { name: 'leadId', label: 'Lead ID', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'items', label: 'Items (JSON)', type: 'textarea', help: 'Enter as JSON array' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Estimates</h1>
        <button
          onClick={() => {
            setEditingEstimate(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Estimate
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={estimates}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEstimate(null);
        }}
        title="New Estimate"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateOrUpdate}
          submitLabel="Create"
        />
      </Modal>
    </div>
  );
}
