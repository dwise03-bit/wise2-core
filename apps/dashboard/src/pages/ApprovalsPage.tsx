'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ApiClient } from '@/lib/api-client';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';

interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  reason?: string;
  parameters: Record<string, any>;
  executionResult?: Record<string, any>;
}

export function ApprovalsPage() {
  const { token, user } = useAuth();
  const client = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api', token);

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await client.listApprovals(filterStatus);
      setApprovals(data.items || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      const result = await client.approveApproval(selectedApproval.id, {
        reason: actionReason,
      });
      setApprovals(approvals.map((a) => (a.id === selectedApproval.id ? result : a)));
      setShowActionModal(false);
      setActionReason('');
      setSelectedApproval(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    try {
      const result = await client.rejectApproval(selectedApproval.id, {
        reason: actionReason,
      });
      setApprovals(approvals.map((a) => (a.id === selectedApproval.id ? result : a)));
      setShowActionModal(false);
      setActionReason('');
      setSelectedApproval(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExecute = async (approval: Approval) => {
    try {
      const result = await client.executeApproval(approval.id);
      setApprovals(approvals.map((a) => (a.id === approval.id ? result : a)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const statusColors: Record<Approval['status'], string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXECUTED: 'bg-green-100 text-green-800',
  };

  const actionIcons: Record<string, string> = {
    SEND_SMS: '📱',
    SEND_EMAIL: '📧',
    CHARGE_PAYMENT: '💳',
    PUBLISH_SOCIAL: '📱',
    CREATE_TASK: '✓',
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Approvals</h1>
        <div className="flex gap-2">
          {(['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status} ({approvals.filter((a) => a.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>}

      <div className="bg-white rounded shadow">
        <DataTable
          columns={[
            {
              header: 'Type',
              accessor: 'action',
              render: (value) => (
                <span className="text-2xl">{actionIcons[value as string] || '⚙️'}</span>
              ),
            },
            {
              header: 'Action',
              accessor: 'action',
              render: (value) => <span className="font-medium">{value}</span>,
            },
            {
              header: 'Entity',
              accessor: 'entityType',
              render: (value, row: any) => (
                <span className="text-sm text-gray-600">
                  {value} #{row.entityId.slice(0, 8)}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (value) => (
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[value as Approval['status']]}`}>
                  {value}
                </span>
              ),
            },
            {
              header: 'Created',
              accessor: 'createdAt',
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              header: 'Approver',
              accessor: 'approvedBy',
              render: (value) => <span className="text-sm">{value || '—'}</span>,
            },
            {
              header: 'Actions',
              accessor: 'id',
              render: (approvalId) => {
                const approval = approvals.find((a) => a.id === approvalId);
                if (!approval) return null;

                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedApproval(approval);
                        setShowDetailModal(true);
                      }}
                      className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                    {approval.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('approve');
                            setShowActionModal(true);
                          }}
                          className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('reject');
                            setShowActionModal(true);
                          }}
                          className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {approval.status === 'APPROVED' && (
                      <button
                        onClick={() => handleExecute(approval)}
                        className="px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={approvals}
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApproval(null);
        }}
        title={`Approval Details - ${selectedApproval?.action}`}
        size="lg"
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Entity Type</p>
                <p className="text-lg">{selectedApproval.entityType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entity ID</p>
                <p className="text-lg font-mono">{selectedApproval.entityId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-medium ${statusColors[selectedApproval.status]}`}>
                  {selectedApproval.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-lg">{new Date(selectedApproval.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedApproval.approvedBy && (
              <div>
                <p className="text-sm font-medium text-gray-600">Approved By</p>
                <p className="text-lg">{selectedApproval.approvedBy}</p>
              </div>
            )}

            {selectedApproval.reason && (
              <div>
                <p className="text-sm font-medium text-gray-600">Reason</p>
                <p className="text-lg">{selectedApproval.reason}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Parameters</p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                {JSON.stringify(selectedApproval.parameters, null, 2)}
              </div>
            </div>

            {selectedApproval.executionResult && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Execution Result</p>
                <div className="bg-green-50 p-3 rounded text-sm font-mono overflow-x-auto">
                  {JSON.stringify(selectedApproval.executionResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionType(null);
          setActionReason('');
        }}
        title={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={4}
              placeholder="Add a reason for your decision..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowActionModal(false);
                setActionType(null);
                setActionReason('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              className={`px-4 py-2 text-white rounded ${
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
