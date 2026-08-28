'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { WorkflowsService } from '@/services/workflows';
import { DataTable } from '@/components/DataTable';
import { Form } from '@/components/Form';
import { Modal } from '@/components/Modal';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggers: Array<{ type: string; conditions?: Record<string, any> }>;
  actions: Array<{ type: string; payload: Record<string, any> }>;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  actions: Array<{ id: string; type: string; status: string }>;
}

export function WorkflowsPage() {
  const { token } = useAuth();
  const workflows = new WorkflowsService();

  const [workflowsList, setWorkflowsList] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecutionsModal, setShowExecutionsModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [viewMode, setViewMode] = useState<'workflows' | 'executions'>('workflows');

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflows.listWorkflows();
      setWorkflowsList(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleCreateWorkflow = async (data: any) => {
    try {
      const newWorkflow = await workflows.createWorkflow({
        name: data.name,
        description: data.description,
        enabled: true,
        triggers: [
          {
            type: data.triggerType,
            conditions: data.triggerConditions ? JSON.parse(data.triggerConditions) : {},
          },
        ],
        actions: [
          {
            type: data.actionType,
            payload: data.actionPayload ? JSON.parse(data.actionPayload) : {},
          },
        ],
      });
      setWorkflowsList([newWorkflow, ...workflowsList]);
      setShowCreateModal(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleToggleWorkflow = async (workflow: Workflow) => {
    try {
      const updated = await workflows.toggleWorkflow(workflow.id, !workflow.enabled);
      setWorkflowsList(workflowsList.map((w) => (w.id === workflow.id ? updated : w)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleViewExecutions = async (workflow: Workflow) => {
    try {
      setSelectedWorkflow(workflow);
      const data = await workflows.getExecutionHistory(workflow.id);
      setExecutions(data.items || []);
      setShowExecutionsModal(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleTestWorkflow = async (workflow: Workflow) => {
    try {
      const result = await workflows.testWorkflow(workflow.id, {
        triggerData: {},
      });
      alert(`Workflow test completed with status: ${result.status}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflows.deleteWorkflow(workflow.id);
      setWorkflowsList(workflowsList.filter((w) => w.id !== workflow.id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    RUNNING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Workflow
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>}

      <div className="bg-white rounded shadow">
        <DataTable
          columns={[
            {
              header: 'Name',
              accessor: 'name',
              render: (value) => <span className="font-medium">{value}</span>,
            },
            {
              header: 'Description',
              accessor: 'description',
              render: (value) => <span className="text-sm text-gray-600">{value || '—'}</span>,
            },
            {
              header: 'Triggers',
              accessor: 'triggers',
              render: (value: any[]) => (
                <span className="text-sm">
                  {value.map((t) => t.type).join(', ') || '—'}
                </span>
              ),
            },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (value: any[]) => (
                <span className="text-sm">
                  {value.map((a) => a.type).join(', ') || '—'}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: 'enabled',
              render: (value) => (
                <span className={`px-3 py-1 rounded text-sm font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              ),
            },
            {
              header: 'Actions',
              accessor: 'id',
              render: (workflowId) => {
                const workflow = workflowsList.find((w) => w.id === workflowId);
                if (!workflow) return null;

                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewExecutions(workflow)}
                      className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Runs
                    </button>
                    <button
                      onClick={() => handleTestWorkflow(workflow)}
                      className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleToggleWorkflow(workflow)}
                      className={`px-2 py-1 text-sm text-white rounded ${
                        workflow.enabled
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {workflow.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow)}
                      className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={workflowsList}
          pageSize={10}
        />
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Workflow">
        <Form
          fields={[
            { name: 'name', label: 'Workflow Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            {
              name: 'triggerType',
              label: 'Trigger Type',
              type: 'select',
              required: true,
              options: [
                { value: 'LEAD_CREATED', label: 'Lead Created' },
                { value: 'LEAD_STATUS_CHANGE', label: 'Lead Status Changed' },
                { value: 'ESTIMATE_SENT', label: 'Estimate Sent' },
                { value: 'JOB_COMPLETED', label: 'Job Completed' },
              ],
            },
            { name: 'triggerConditions', label: 'Trigger Conditions (JSON)', type: 'textarea' },
            {
              name: 'actionType',
              label: 'Action Type',
              type: 'select',
              required: true,
              options: [
                { value: 'SEND_SMS', label: 'Send SMS' },
                { value: 'SEND_EMAIL', label: 'Send Email' },
                { value: 'CREATE_TASK', label: 'Create Task' },
                { value: 'PUBLISH_SOCIAL', label: 'Publish to Social' },
              ],
            },
            { name: 'actionPayload', label: 'Action Payload (JSON)', type: 'textarea' },
          ]}
          onSubmit={handleCreateWorkflow}
          submitLabel="Create Workflow"
        />
      </Modal>

      <Modal
        isOpen={showExecutionsModal}
        onClose={() => {
          setShowExecutionsModal(false);
          setSelectedWorkflow(null);
          setExecutions([]);
        }}
        title={`Executions - ${selectedWorkflow?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {executions.length === 0 ? (
            <p className="text-gray-600">No executions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Started</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Completed</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => (
                    <tr key={exec.id} className="border-b">
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[exec.status]}`}>
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(exec.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {exec.completedAt ? new Date(exec.completedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {exec.actions.map((a) => a.type).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
