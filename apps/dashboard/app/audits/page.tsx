'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Mic, BarChart3, CheckCircle2 } from 'lucide-react';

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

  const workspaceId = 'default-workspace';

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
      'INTAKE': 'bg-[#1A3A52]/40 text-[#32A8FF] border border-[#0094FF]/30',
      'PRE_MEETING_RESEARCH': 'bg-[#2A2A3E]/40 text-[#7CFF00] border border-[#39FF14]/20',
      'MEETING_SCHEDULED': 'bg-[#3A2A2A]/40 text-[#FF9500] border border-[#FF9500]/20',
      'IN_MEETING': 'bg-[#3A2A2A]/40 text-[#FF4444] border border-[#FF4444]/20',
      'POST_MEETING_ANALYSIS': 'bg-[#3A3A2A]/40 text-[#FFD700] border border-[#FFD700]/20',
      'RECOMMENDATIONS_REVIEW': 'bg-[#2A3A2A]/40 text-[#39FF14] border border-[#39FF14]/30',
      'PLAN_GENERATION': 'bg-[#2A3A3A]/40 text-[#32A8FF] border border-[#0094FF]/30',
      'PLAN_APPROVED': 'bg-[#2A3A2A]/40 text-[#22C55E] border border-[#22C55E]/30',
      'IMPLEMENTATION_STARTED': 'bg-[#2A3A2A]/40 text-[#39FF14] border border-[#39FF14]/30',
      'COMPLETED': 'bg-[#1A1A1A]/40 text-[#8D98A5] border border-[#8D98A5]/20',
    };
    return colors[status] || 'bg-[#1A1A1A]/40 text-[#8D98A5] border border-[#8D98A5]/20';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top Navigation */}
      <div className="border-b border-[#1A1A1A] bg-gradient-to-b from-[#0B0B0B] to-[#050505] px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-black tracking-wider" style={{ fontFamily: 'Orbitron' }}>
              CONSULTANT AUDIT OS
            </h1>
            <p className="text-[#8D98A5] text-sm mt-1">Record. Research. Audit. Plan. Transform.</p>
          </div>
          <button
            onClick={() => setShowNewClientForm(!showNewClientForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#39FF14] hover:bg-[#7CFF00] text-[#050505] font-bold rounded-lg transition duration-200 shadow-lg shadow-[#39FF14]/20"
          >
            <Plus size={20} />
            New Audit
          </button>
        </div>
      </div>

      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* New Client Form */}
          {showNewClientForm && (
            <div className="mb-12 p-8 border border-[#39FF14]/30 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] shadow-lg shadow-[#39FF14]/10">
              <h2 className="text-2xl font-bold text-[#39FF14] mb-6" style={{ fontFamily: 'Orbitron' }}>
                NEW AUDIT ENGAGEMENT
              </h2>
              <form onSubmit={handleCreateClient}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Company Name</label>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Industry</label>
                    <input
                      type="text"
                      placeholder="Manufacturing"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Employees</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={formData.employees}
                      onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Revenue</label>
                    <input
                      type="text"
                      placeholder="$50M ARR"
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Primary Contact</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={formData.primaryContact}
                      onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8D98A5] text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="john@acme.com"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-lg text-white placeholder-[#8D98A5]/50 focus:border-[#39FF14] focus:outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#39FF14] hover:bg-[#7CFF00] text-[#050505] font-bold rounded-lg transition shadow-lg shadow-[#39FF14]/20"
                  >
                    Create Engagement
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewClientForm(false)}
                    className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#8D98A5] border border-[#39FF14]/20 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clients Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-4"></div>
                <p className="text-[#8D98A5]">Loading audit engagements...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex items-center justify-center py-24 border-2 border-dashed border-[#39FF14]/20 rounded-lg bg-[#0B0B0B]/50">
              <div className="text-center">
                <Mic size={48} className="mx-auto text-[#8D98A5] mb-4 opacity-50" />
                <p className="text-[#8D98A5] text-lg font-semibold">No audit engagements yet</p>
                <p className="text-[#8D98A5]/60 text-sm mt-2">Create your first consulting audit to begin</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/audits/${client.id}`}
                  className="group relative h-full"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#39FF14]/20 to-[#0094FF]/20 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                  <div className="relative p-6 border border-[#39FF14]/20 rounded-lg bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition duration-300 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-white group-hover:text-[#39FF14] transition" style={{ fontFamily: 'Orbitron' }}>
                          {client.companyName}
                        </h3>
                        {client.industry && (
                          <p className="text-[#8D98A5] text-sm mt-1">{client.industry}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-black text-[#0094FF]">
                          {client.auditScore}
                        </div>
                        <p className="text-[#8D98A5] text-xs font-semibold tracking-wide">SCORE</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-block px-3 py-1.5 rounded text-xs font-bold tracking-wider ${getStatusColor(client.status)}`}>
                        {client.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 flex-1 mb-6">
                      <div className="flex items-center gap-3 text-[#8D98A5]">
                        <Mic size={16} className="text-[#39FF14]" />
                        <span className="text-sm">{client.sessions?.length || 0} meetings recorded</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#8D98A5]">
                        <BarChart3 size={16} className="text-[#0094FF]" />
                        <span className="text-sm">{client.consultingFindings?.length || 0} findings</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#8D98A5]">
                        <CheckCircle2 size={16} className="text-[#39FF14]" />
                        <span className="text-sm">{client.tasks?.length || 0} action items</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-[#39FF14]/10 flex items-center justify-between">
                      <p className="text-[#8D98A5] text-xs">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                      <ChevronRight size={16} className="text-[#39FF14] group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
