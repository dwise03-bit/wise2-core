'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AuditClientPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
    fetchTimeline();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/consulting/clients/${clientId}`);
      if (res.ok) {
        setClient(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/consulting/clients/${clientId}/timeline`);
      if (res.ok) {
        setTimeline(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };

  if (loading || !client) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-gray-400">Loading audit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/audits" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back to Audits
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black">{client.companyName}</h1>
            {client.industry && <p className="text-gray-400 mt-1">{client.industry}</p>}
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-blue-500">{client.auditScore}</div>
            <p className="text-gray-400 text-sm">Audit Score</p>
          </div>
        </div>
      </div>

      {/* Status & Contact Info */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-950">
          <p className="text-gray-400 text-sm">Status</p>
          <p className="text-lg font-bold mt-1">{client.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-950">
          <p className="text-gray-400 text-sm">Primary Contact</p>
          <p className="text-lg font-bold mt-1">{client.primaryContact || 'Not set'}</p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-950">
          <p className="text-gray-400 text-sm">Email</p>
          <p className="text-lg font-bold mt-1 text-blue-400">{client.primaryContactEmail || 'Not set'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-700">
        <div className="flex gap-8">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'timeline', label: '📋 Timeline', icon: '📋' },
            { id: 'findings', label: '📌 Findings', icon: '📌' },
            { id: 'tasks', label: '✓ Tasks', icon: '✓' },
            { id: 'plan', label: '🗺️ Plan', icon: '🗺️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-950 text-center">
                <div className="text-3xl font-bold text-blue-500">{client.sessions?.length || 0}</div>
                <p className="text-sm text-gray-400 mt-2">Meetings Recorded</p>
              </div>
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-950 text-center">
                <div className="text-3xl font-bold text-purple-500">{client.consultingFindings?.length || 0}</div>
                <p className="text-sm text-gray-400 mt-2">Findings</p>
              </div>
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-950 text-center">
                <div className="text-3xl font-bold text-green-500">{client.tasks?.length || 0}</div>
                <p className="text-sm text-gray-400 mt-2">Action Items</p>
              </div>
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-950 text-center">
                <div className="text-3xl font-bold text-orange-500">{client.research?.length || 0}</div>
                <p className="text-sm text-gray-400 mt-2">Research Items</p>
              </div>
            </div>

            {client.researchBrief && (
              <div className="p-6 border border-gray-700 rounded-lg bg-gray-950">
                <h3 className="font-bold mb-2">Research Brief</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{client.researchBrief}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No events yet for this audit
              </div>
            ) : (
              timeline.map((event, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-950 flex items-start gap-4"
                >
                  <div className="text-2xl min-w-fit">
                    {event.type.includes('INTAKE') && '📋'}
                    {event.type.includes('MEETING') && '🎤'}
                    {event.type.includes('RECORDING') && '📹'}
                    {event.type.includes('FINDING') && '📌'}
                    {event.type.includes('TASK') && '✓'}
                    {event.type.includes('PLAN') && '🗺️'}
                    {event.type.includes('RESEARCH') && '🔍'}
                    {event.type.includes('SUMMARY') && '📄'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{event.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.data?.title && (
                      <p className="text-sm text-gray-300 mt-2">{event.data.title}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            {client.consultingFindings?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No findings yet
              </div>
            ) : (
              client.consultingFindings?.map((finding: any) => (
                <div
                  key={finding.id}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-950"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold">{finding.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      finding.status === 'APPROVED' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                    }`}>
                      {finding.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{finding.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-500">Severity: {finding.severity}</span>
                    <span className="text-gray-500">Confidence: {finding.confidence}%</span>
                    {finding.estimatedValue && (
                      <span className="text-gray-500">Value: ${finding.estimatedValue}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {client.tasks?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No tasks yet
              </div>
            ) : (
              client.tasks?.map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-950"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'COMPLETED' ? 'bg-green-900 text-green-100' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-900 text-blue-100' :
                      'bg-gray-800 text-gray-100'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-500">Owner: {task.owner}</span>
                    <span className="text-gray-500">Priority: {task.priority}</span>
                    {task.dueDate && (
                      <span className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            {client.plan ? (
              <div className="p-6 border border-gray-700 rounded-lg bg-gray-950">
                <h3 className="text-2xl font-bold mb-4">{client.plan.title}</h3>
                <p className="text-gray-300 mb-4">{client.plan.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {client.plan.totalEstimatedCost && (
                    <div className="p-3 bg-gray-900 rounded">
                      <p className="text-gray-400 text-sm">Estimated Cost</p>
                      <p className="font-bold text-lg">${client.plan.totalEstimatedCost.toLocaleString()}</p>
                    </div>
                  )}
                  {client.plan.estimatedROI && (
                    <div className="p-3 bg-gray-900 rounded">
                      <p className="text-gray-400 text-sm">Est. ROI</p>
                      <p className="font-bold text-lg">${client.plan.estimatedROI.toLocaleString()}</p>
                    </div>
                  )}
                  {client.plan.paybackPeriod && (
                    <div className="p-3 bg-gray-900 rounded">
                      <p className="text-gray-400 text-sm">Payback Period</p>
                      <p className="font-bold text-lg">{client.plan.paybackPeriod} months</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {client.plan.phases?.map((phase: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-900 rounded border border-gray-800">
                      <h4 className="font-bold mb-2">{phase.name}</h4>
                      <p className="text-sm text-gray-400">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No implementation plan generated yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
