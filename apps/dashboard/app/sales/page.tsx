'use client';

import { useState } from 'react';

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  probability: number;
  daysInStage: number;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
}

const mockStages: Stage[] = [
  {
    id: 'prospect',
    name: 'Prospect',
    color: 'bg-blue-500/20',
    deals: [
      { id: '1', title: 'Enterprise License Inquiry', customer: 'Tech Corp', value: 50000, probability: 20, daysInStage: 5 },
      { id: '2', title: 'Website Redesign RFQ', customer: 'Marketing Co', value: 35000, probability: 30, daysInStage: 3 },
    ],
  },
  {
    id: 'qualified',
    name: 'Qualified',
    color: 'bg-yellow-500/20',
    deals: [
      { id: '3', title: 'CRM System Demo', customer: 'Acme Corp', value: 75000, probability: 50, daysInStage: 7 },
      { id: '4', title: 'API Integration Project', customer: 'BuildRight', value: 45000, probability: 55, daysInStage: 4 },
    ],
  },
  {
    id: 'proposal',
    name: 'Proposal Sent',
    color: 'bg-purple-500/20',
    deals: [
      { id: '5', title: 'Annual Support Contract', customer: 'Sterling Law', value: 120000, probability: 75, daysInStage: 8 },
      { id: '6', title: 'Custom Development', customer: 'Downtown Med', value: 95000, probability: 70, daysInStage: 5 },
    ],
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    color: 'bg-orange-500/20',
    deals: [
      { id: '7', title: 'Volume Discount Request', customer: 'Golden Fork', value: 60000, probability: 85, daysInStage: 6 },
    ],
  },
  {
    id: 'closed-won',
    name: 'Closed - Won',
    color: 'bg-green-500/20',
    deals: [
      { id: '8', title: 'Dashboard Implementation', customer: 'HVAC Plus', value: 85000, probability: 100, daysInStage: 0 },
      { id: '9', title: 'Mobile App Development', customer: 'Tech Startup', value: 120000, probability: 100, daysInStage: 0 },
    ],
  },
];

export default function SalesPage() {
  const [stages, setStages] = useState(mockStages);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const totalPipeline = stages.reduce(
    (sum, stage) => sum + stage.deals.reduce((stageSum, deal) => stageSum + deal.value, 0),
    0
  );

  const totalWon = stages
    .find((s) => s.id === 'closed-won')
    ?.deals.reduce((sum, deal) => sum + deal.value, 0) || 0;

  const stageTotals = stages.map((stage) => ({
    name: stage.name,
    total: stage.deals.reduce((sum, deal) => sum + deal.value, 0),
  }));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">📈 Sales Pipeline</h1>
          <p className="text-gray-400 mt-1">Kanban board view of all opportunities</p>
        </div>
        <button className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
          + New Deal
        </button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Pipeline</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">${(totalPipeline / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Won This Month</p>
          <p className="text-3xl font-bold text-green-400 mt-2">${(totalWon / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Deals</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">
            {stages.reduce((sum, stage) => sum + stage.deals.length, 0)}
          </p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">
            {(
              (stages.find((s) => s.id === 'closed-won')?.deals.length || 0) /
              stages.reduce((sum, stage) => sum + stage.deals.length, 0)
            ).toLocaleString('en-US', { style: 'percent' })}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-80 bg-[#050505] rounded-lg border border-[#2cd588]/20 flex flex-col">
              {/* Column Header */}
              <div className="bg-[#0f0f1e] border-b border-[#2cd588]/20 px-4 py-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">{stage.name}</h3>
                  <span className="text-xs bg-[#2cd588]/20 text-[#2cd588] px-2 py-1 rounded">
                    {stage.deals.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ${(stageTotals.find((s) => s.name === stage.name)?.total || 0) / 1000}K
                </p>
              </div>

              {/* Cards */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${stage.color} border-[#2cd588]/30 hover:border-[#2cd588] group`}
                  >
                    <p className="text-white font-medium text-sm group-hover:text-[#2cd588]">{deal.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{deal.customer}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2cd588]/20">
                      <span className="text-[#2cd588] font-bold text-sm">${(deal.value / 1000).toFixed(0)}K</span>
                      <span className="text-xs text-gray-500">{deal.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Detail */}
      {selectedDeal && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold text-[#2cd588] mb-4">{selectedDeal.title}</h3>
              <div className="space-y-4">
                <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                  <p className="text-gray-500 text-sm">Customer</p>
                  <p className="text-white font-medium mt-1">{selectedDeal.customer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                    <p className="text-gray-500 text-sm">Deal Value</p>
                    <p className="text-[#2cd588] font-bold text-2xl mt-1">${(selectedDeal.value / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                    <p className="text-gray-500 text-sm">Probability</p>
                    <p className="text-white font-bold text-2xl mt-1">{selectedDeal.probability}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/30">
                Move to Next Stage
              </button>
              <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500 rounded text-blue-400 font-medium hover:bg-blue-500/30">
                Add Activity
              </button>
              <button className="w-full px-4 py-2 bg-gray-500/20 border border-gray-500 rounded text-gray-400 font-medium hover:bg-gray-500/30">
                View Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
