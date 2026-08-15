'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Clock, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

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
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-4"></div>
          <p className="text-[#8D98A5]">Loading engagement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top Navigation */}
      <div className="border-b border-[#1A1A1A] bg-gradient-to-b from-[#0B0B0B] to-[#050505] px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/audits" className="flex items-center gap-2 text-[#0094FF] hover:text-[#32A8FF] mb-4 transition w-fit">
            <ArrowLeft size={18} />
            <span className="font-semibold">Back to Audits</span>
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-wider" style={{ fontFamily: 'Orbitron' }}>
                {client.companyName}
              </h1>
              {client.industry && (
                <p className="text-[#8D98A5] text-sm mt-2">{client.industry}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-[#0094FF]">{client.auditScore}</div>
              <p className="text-[#8D98A5] text-xs font-semibold tracking-wide">AUDIT SCORE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Status & Contact Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">STATUS</p>
              <p className="text-lg font-bold text-[#39FF14]">{client.status.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">PRIMARY CONTACT</p>
              <p className="text-lg font-bold text-white">{client.primaryContact || '—'}</p>
            </div>
            <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">EMAIL</p>
              <p className="text-sm font-bold text-[#0094FF] truncate">{client.primaryContactEmail || '—'}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-[#39FF14]/20">
            <div className="flex gap-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'findings', label: 'Findings', icon: AlertCircle },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
                { id: 'plan', label: 'Plan', icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 px-2 font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#39FF14] text-[#39FF14]'
                        : 'border-transparent text-[#8D98A5] hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] text-center hover:border-[#39FF14]/50 transition">
                    <div className="text-3xl font-black text-[#0094FF]">{client.sessions?.length || 0}</div>
                    <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mt-2">RECORDINGS</p>
                  </div>
                  <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] text-center hover:border-[#39FF14]/50 transition">
                    <div className="text-3xl font-black text-[#39FF14]">{client.consultingFindings?.length || 0}</div>
                    <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mt-2">FINDINGS</p>
                  </div>
                  <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] text-center hover:border-[#39FF14]/50 transition">
                    <div className="text-3xl font-black text-[#22C55E]">{client.tasks?.length || 0}</div>
                    <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mt-2">ACTION ITEMS</p>
                  </div>
                  <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] text-center hover:border-[#39FF14]/50 transition">
                    <div className="text-3xl font-black text-[#0094FF]">{client.research?.length || 0}</div>
                    <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mt-2">RESEARCH</p>
                  </div>
                </div>

                {client.researchBrief && (
                  <div className="p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
                    <h3 className="font-black text-[#39FF14] mb-4" style={{ fontFamily: 'Orbitron' }}>RESEARCH BRIEF</h3>
                    <p className="text-[#8D98A5] leading-relaxed whitespace-pre-wrap">{client.researchBrief}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="text-center py-16 text-[#8D98A5]">
                    <Clock size={40} className="mx-auto opacity-20 mb-4" />
                    <p>No events yet for this engagement</p>
                  </div>
                ) : (
                  timeline.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-[#39FF14]/20 rounded-lg bg-gradient-to-r from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition flex items-start gap-4"
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
                        <p className="font-bold text-[#39FF14]">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-[#8D98A5] text-xs mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.data?.title && (
                          <p className="text-sm text-white mt-2">{event.data.title}</p>
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
                  <div className="text-center py-16 text-[#8D98A5]">
                    <AlertCircle size={40} className="mx-auto opacity-20 mb-4" />
                    <p>No findings yet</p>
                  </div>
                ) : (
                  client.consultingFindings?.map((finding: any) => (
                    <div
                      key={finding.id}
                      className="p-4 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-white">{finding.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          finding.status === 'APPROVED'
                            ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-[#F2B632]/20 text-[#F2B632] border border-[#F2B632]/30'
                        }`}>
                          {finding.status}
                        </span>
                      </div>
                      <p className="text-[#8D98A5] text-sm mb-3">{finding.description}</p>
                      <div className="flex gap-4 text-xs text-[#8D98A5]">
                        <span>Severity: <span className="text-[#39FF14]">{finding.severity}</span></span>
                        <span>Confidence: <span className="text-[#39FF14]">{finding.confidence}%</span></span>
                        {finding.estimatedValue && (
                          <span>Value: <span className="text-[#0094FF]">${finding.estimatedValue}</span></span>
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
                  <div className="text-center py-16 text-[#8D98A5]">
                    <CheckCircle2 size={40} className="mx-auto opacity-20 mb-4" />
                    <p>No tasks yet</p>
                  </div>
                ) : (
                  client.tasks?.map((task: any) => (
                    <div
                      key={task.id}
                      className="p-4 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-white">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          task.status === 'COMPLETED' ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' :
                          task.status === 'IN_PROGRESS' ? 'bg-[#0094FF]/20 text-[#0094FF] border border-[#0094FF]/30' :
                          'bg-[#8D98A5]/20 text-[#8D98A5] border border-[#8D98A5]/30'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-[#8D98A5] text-sm mb-3">{task.description}</p>
                      <div className="flex gap-4 text-xs text-[#8D98A5]">
                        <span>Owner: <span className="text-white">{task.owner}</span></span>
                        <span>Priority: <span className="text-[#39FF14]">{task.priority}</span></span>
                        {task.dueDate && (
                          <span>Due: <span className="text-[#0094FF]">{new Date(task.dueDate).toLocaleDateString()}</span></span>
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
                  <div className="p-8 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
                    <h3 className="text-2xl font-black text-[#39FF14] mb-2" style={{ fontFamily: 'Orbitron' }}>
                      {client.plan.title}
                    </h3>
                    <p className="text-[#8D98A5] mb-6">{client.plan.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {client.plan.totalEstimatedCost && (
                        <div className="p-4 bg-[#0B0B0B] rounded border border-[#39FF14]/20">
                          <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">EST. COST</p>
                          <p className="font-black text-[#0094FF]">${client.plan.totalEstimatedCost.toLocaleString()}</p>
                        </div>
                      )}
                      {client.plan.estimatedROI && (
                        <div className="p-4 bg-[#0B0B0B] rounded border border-[#39FF14]/20">
                          <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">EST. ROI</p>
                          <p className="font-black text-[#39FF14]">${client.plan.estimatedROI.toLocaleString()}</p>
                        </div>
                      )}
                      {client.plan.paybackPeriod && (
                        <div className="p-4 bg-[#0B0B0B] rounded border border-[#39FF14]/20">
                          <p className="text-[#8D98A5] text-xs font-semibold tracking-wide mb-2">PAYBACK</p>
                          <p className="font-black text-[#22C55E]">{client.plan.paybackPeriod} mo</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {client.plan.phases?.map((phase: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[#0B0B0B] rounded border border-[#39FF14]/20 hover:border-[#39FF14]/50 transition">
                          <h4 className="font-bold text-[#39FF14]">{phase.name}</h4>
                          <p className="text-[#8D98A5] text-sm mt-2">{phase.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#8D98A5]">
                    <MapPin size={40} className="mx-auto opacity-20 mb-4" />
                    <p>No implementation plan generated yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
