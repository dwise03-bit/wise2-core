'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { DispatchService } from '@/services/dispatch';
import { DataTable } from '@/components/DataTable';
import { Form } from '@/components/Form';
import { Modal } from '@/components/Modal';

interface Job {
  id: string;
  leadId: string;
  leadName: string;
  description: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  notes: string;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  activeJobs: number;
}

export function DispatchPage() {
  const { user } = useAuth();
  const dispatch = new DispatchService();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const jobsData = await dispatch.listJobs(filterStatus);
      setJobs(jobsData);

      const techsData = await dispatch.listTechnicians();
      setTechnicians(techsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleCreateJob = async (data: any) => {
    try {
      const newJob = await dispatch.createJob(data);
      setJobs([newJob, ...jobs]);
      setShowCreateModal(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAssignTechnician = async (data: { technicianId: string }) => {
    if (!selectedJob) return;

    try {
      const updated = await dispatch.assignTechnician(selectedJob.id, data.technicianId);
      setJobs(jobs.map((j) => (j.id === selectedJob.id ? updated : j)));
      setShowAssignModal(false);
      setSelectedJob(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    try {
      const updated = await dispatch.updateJobStatus(jobId, newStatus);
      setJobs(jobs.map((j) => (j.id === jobId ? updated : j)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<Job['status'], string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const technicianAvailability: Record<Technician['availability'], string> = {
    AVAILABLE: 'text-green-600',
    BUSY: 'text-yellow-600',
    OFFLINE: 'text-red-600',
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading dispatch data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dispatch & Jobs</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Job
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>}

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded shadow">
        <DataTable
          columns={[
            {
              header: 'Lead',
              accessor: 'leadName',
              render: (value) => <span className="font-medium">{value}</span>,
            },
            {
              header: 'Description',
              accessor: 'description',
              render: (value) => <span className="text-sm text-gray-600">{value}</span>,
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (value) => (
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[value as Job['status']]}`}>
                  {value}
                </span>
              ),
            },
            {
              header: 'Technician',
              accessor: 'assignedTechnicianName',
              render: (value) => <span className="text-sm">{value || '—'}</span>,
            },
            {
              header: 'Scheduled',
              accessor: 'scheduledDate',
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              header: 'Actions',
              accessor: 'id',
              render: (jobId) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const job = jobs.find((j) => j.id === jobId);
                      setSelectedJob(job || null);
                      setShowAssignModal(true);
                    }}
                    className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Assign
                  </button>
                  <select
                    onChange={(e) => handleStatusChange(jobId, e.target.value as Job['status'])}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="">Change Status</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              ),
            },
          ]}
          data={filteredJobs}
          pageSize={10}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Active Technicians</h2>
          <div className="space-y-3">
            {technicians.map((tech) => (
              <div key={tech.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{tech.name}</p>
                  <p className="text-sm text-gray-600">{tech.phone}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${technicianAvailability[tech.availability]}`}>
                    {tech.availability}
                  </p>
                  <p className="text-sm text-gray-600">★ {tech.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">{tech.activeJobs} active</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Job Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-blue-50 rounded">
              <span>Scheduled</span>
              <span className="font-bold">{jobs.filter((j) => j.status === 'SCHEDULED').length}</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span>In Progress</span>
              <span className="font-bold">{jobs.filter((j) => j.status === 'IN_PROGRESS').length}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded">
              <span>Completed</span>
              <span className="font-bold">{jobs.filter((j) => j.status === 'COMPLETED').length}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded">
              <span>Cancelled</span>
              <span className="font-bold">{jobs.filter((j) => j.status === 'CANCELLED').length}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Job">
        <Form
          fields={[
            { name: 'description', label: 'Job Description', type: 'textarea', required: true },
            { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
            { name: 'leadId', label: 'Lead ID', type: 'text', required: true },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          onSubmit={handleCreateJob}
          submitLabel="Create Job"
        />
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Technician">
        <Form
          fields={[
            {
              name: 'technicianId',
              label: 'Technician',
              type: 'select',
              required: true,
              options: technicians.map((t) => ({ value: t.id, label: `${t.name} (★ ${t.rating.toFixed(1)})` })),
            },
          ]}
          onSubmit={handleAssignTechnician}
          submitLabel="Assign"
        />
      </Modal>
    </div>
  );
}
