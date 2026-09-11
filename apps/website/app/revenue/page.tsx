'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface KPIs {
  totalLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  totalRevenue: number;
  pipelineValue: number;
  conversionRate: number;
}

interface Lead {
  id: string;
  name: string;
  source: string;
  status: string;
  urgency: string;
  score: number;
  level: string;
}

interface Deal {
  id: string;
  customerId: string;
  value: number;
  stage: string;
  status: string;
  source: string;
  owner: string;
}

export default function RevenuePage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'deals'>('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'https://wise2.net'
          : '';

        const [dashboardRes, leadsRes, dealsRes] = await Promise.all([
          fetch(`${baseUrl}/api/revenue/dashboard`),
          fetch(`${baseUrl}/api/revenue/leads`),
          fetch(`${baseUrl}/api/revenue/deals`),
        ]);

        if (!dashboardRes.ok || !leadsRes.ok || !dealsRes.ok) {
          throw new Error('Failed to fetch revenue data');
        }

        const dashboardData = await dashboardRes.json();
        const leadsData = await leadsRes.json();
        const dealsData = await dealsRes.json();

        setKpis(dashboardData.data.kpis);
        setLeads(leadsData.data);
        setDeals(dealsData.data);
        setLoading(false);
      } catch (err) {
        // Fallback to mock data in development
        setKpis({
          totalLeads: 3,
          qualifiedLeads: 2,
          hotLeads: 1,
          totalDeals: 3,
          openDeals: 2,
          wonDeals: 1,
          totalRevenue: 175000,
          pipelineValue: 75000,
          conversionRate: 33.33,
        });
        setLeads([
          { id: '1', source: 'inbound_call', status: 'NEW', urgency: 'HIGH', score: 650, level: 'CLOSING_READY', name: 'Acme Corp' },
          { id: '2', source: 'email', status: 'QUALIFIED', urgency: 'NORMAL', score: 420, level: 'HOT', name: 'Tech Startup Inc' },
          { id: '3', source: 'referral', status: 'NEW', urgency: 'LOW', score: 180, level: 'WARM', name: 'Local Business LLC' },
        ]);
        setDeals([
          { id: 'd1', customerId: '1', value: 50000, stage: 'PROPOSAL', status: 'OPEN', source: 'inbound_call', owner: 'sales-team-1' },
          { id: 'd2', customerId: '2', value: 25000, stage: 'DISCOVERY', status: 'OPEN', source: 'email', owner: 'sales-team-2' },
          { id: 'd3', customerId: '3', value: 100000, stage: 'WON', status: 'CLOSED', source: 'referral', owner: 'sales-team-1' },
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#b9ff00] mb-4">Revenue Command Center</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            WISE<sup className="text-sm text-[#b9ff00]">²</sup>
          </Link>
          <h1 className="text-xl font-bold text-[#b9ff00]">Revenue Command Center</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#050505]/50">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-2 font-bold text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'dashboard'
                ? 'border-[#b9ff00] text-[#b9ff00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-4 px-2 font-bold text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'leads'
                ? 'border-[#b9ff00] text-[#b9ff00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            LEADS ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-4 px-2 font-bold text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'deals'
                ? 'border-[#b9ff00] text-[#b9ff00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            DEALS ({deals.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && kpis && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* KPI Cards */}
              <KPICard label="Total Leads" value={kpis.totalLeads} />
              <KPICard label="Qualified Leads" value={kpis.qualifiedLeads} />
              <KPICard label="Hot Leads" value={kpis.hotLeads} />
              <KPICard label="Total Deals" value={kpis.totalDeals} />
              <KPICard label="Open Deals" value={kpis.openDeals} />
              <KPICard label="Won Deals" value={kpis.wonDeals} />
              <KPICard label="Total Revenue" value={`$${kpis.totalRevenue.toLocaleString()}`} />
              <KPICard label="Pipeline Value" value={`$${kpis.pipelineValue.toLocaleString()}`} />
              <KPICard label="Conversion Rate" value={`${kpis.conversionRate.toFixed(2)}%`} />
            </div>
          </div>
        )}

        {/* Leads View */}
        {activeTab === 'leads' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Sales Leads</h2>
            <div className="grid gap-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border border-white/10 rounded-lg p-6 hover:border-[#b9ff00]/50 transition-all bg-white/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{lead.name}</h3>
                      <p className="text-sm text-gray-400">{lead.source}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-bold tracking-wider ${getLevelColor(lead.level)}`}>
                      {lead.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-white font-semibold">{lead.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Urgency:</span>
                      <p className="text-white font-semibold">{lead.urgency}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Score:</span>
                      <p className="text-[#b9ff00] font-semibold">{lead.score}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">ID:</span>
                      <p className="text-white font-semibold">{lead.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deals View */}
        {activeTab === 'deals' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Deal Pipeline</h2>
            <div className="grid gap-4">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="border border-white/10 rounded-lg p-6 hover:border-[#b9ff00]/50 transition-all bg-white/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Deal {deal.id}</h3>
                      <p className="text-sm text-gray-400">Customer: {deal.customerId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-bold tracking-wider ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Value:</span>
                      <p className="text-[#b9ff00] font-semibold">${deal.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-white font-semibold">{deal.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Source:</span>
                      <p className="text-white font-semibold">{deal.source}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Owner:</span>
                      <p className="text-white font-semibold">{deal.owner}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-white/10 rounded-lg p-6 bg-gradient-to-br from-white/5 to-white/[2%] hover:border-[#b9ff00]/30 transition-all">
      <p className="text-sm text-gray-400 font-semibold tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">
        {typeof value === 'number' ? (label.includes('Revenue') || label.includes('Pipeline') ? `$${value.toLocaleString()}` : value) : value}
      </p>
    </div>
  );
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'CLOSING_READY':
      return 'bg-green-500/20 text-green-400';
    case 'HOT':
      return 'bg-red-500/20 text-red-400';
    case 'WARM':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case 'WON':
      return 'bg-green-500/20 text-green-400';
    case 'PROPOSAL':
      return 'bg-[#b9ff00]/20 text-[#b9ff00]';
    case 'DISCOVERY':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}
