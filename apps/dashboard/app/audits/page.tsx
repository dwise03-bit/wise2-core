'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConsultingClient {
  id: string;
  companyName: string;
  industry?: string;
  status: string;
  auditScore: number;
  createdAt: string;
  sessions: any[];
  consultingFindings: any[];
  tasks: any[];
}

export default function AuditsPage() {
  const [clients, setClients] = useState<ConsultingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    employees: '',
    revenue: '',
    primaryContact: '',
    primaryContactEmail: '',
  });

  const workspaceId = 'default-workspace'; // TODO: Get from context

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/consulting/workspaces/${workspaceId}/clients`);
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/consulting/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          ...formData,
          employees: formData.employees ? parseInt(formData.employees) : undefined,
        }),
      });

      if (res.ok) {
        setFormData({
          companyName: '',
          industry: '',
          employees: '',
          revenue: '',
          primaryContact: '',
          primaryContactEmail: '',
        });
        setShowNewClientForm(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'INTAKE': 'bg-blue-900 text-blue-100',
      'PRE_MEETING_RESEARCH': 'bg-purple-900 text-purple-100',
      'MEETING_SCHEDULED': 'bg-orange-900 text-orange-100',
      'IN_MEETING': 'bg-red-900 text-red-100',
      'POST_MEETING_ANALYSIS': 'bg-yellow-900 text-yellow-100',
      'RECOMMENDATIONS_REVIEW': 'bg-green-900 text-green-100',
      'PLAN_GENERATION': 'bg-cyan-900 text-cyan-100',
      'PLAN_APPROVED': 'bg-emerald-900 text-emerald-100',
      'IMPLEMENTATION_STARTED': 'bg-teal-900 text-teal-100',
      'COMPLETED': 'bg-gray-800 text-gray-100',
    };
    return colors[status] || 'bg-gray-800 text-gray-100';
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl">
            🎤
          </div>
          <div>
            <h1 className="text-4xl font-black">CONSULTANT AUDIT OS</h1>
            <p className="text-gray-400 mt-1">Record. Research. Audit. Plan. Transform.</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setShowNewClientForm(!showNewClientForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          + New Client Audit
        </button>
      </div>

      {/* New Client Form */}
      {showNewClientForm && (
        <form
          onSubmit={handleCreateClient}
          className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-950"
        >
          <h3 className="text-xl font-bold mb-4">Create New Audit Client</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
              required
            />
            <input
              type="text"
              placeholder="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <input
              type="number"
              placeholder="Employees"
              value={formData.employees}
              onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <input
              type="text"
              placeholder="Revenue"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <input
              type="text"
              placeholder="Primary Contact Name"
              value={formData.primaryContact}
              onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <input
              type="email"
              placeholder="Primary Contact Email"
              value={formData.primaryContactEmail}
              onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
              className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              Create Audit
            </button>
            <button
              type="button"
              onClick={() => setShowNewClientForm(false)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Clients Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-lg">Loading audits...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex items-center justify-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
          <div className="text-center">
            <p className="text-2xl mb-4">📋</p>
            <p className="text-gray-400 text-lg">No audit clients yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first consulting audit to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/audits/${client.id}`}
              className="p-6 border border-gray-700 rounded-lg bg-gray-950 hover:border-blue-500 hover:bg-gray-900 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition">{client.companyName}</h3>
                  {client.industry && <p className="text-sm text-gray-400">{client.industry}</p>}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-500">{client.auditScore}</div>
                  <p className="text-xs text-gray-500">Audit Score</p>
                </div>
              </div>

              <div className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-4 ${getStatusColor(client.status)}`}>
                {client.status.replace(/_/g, ' ')}
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <p>📅 Meetings: {client.sessions?.length || 0}</p>
                <p>📌 Findings: {client.consultingFindings?.length || 0}</p>
                <p>✓ Tasks: {client.tasks?.length || 0}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Created: {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
