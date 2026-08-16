'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Search } from 'lucide-react';

export default function CreditAudit() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = [
    { id: 'all', label: 'All Tradelines', count: 12 },
    { id: 'issues', label: 'Potential Issues', count: 7 },
    { id: 'evidence', label: 'Needs Evidence', count: 3 },
    { id: 'review', label: 'Under Review', count: 5 },
    { id: 'completed', label: 'Completed', count: 4 },
  ];

  const tradelines = [
    {
      id: 1,
      creditor: 'Capital One',
      account: 'Credit Card (****1234)',
      status: 'Open',
      balance: '$2,450',
      limit: '$5,000',
      lastReported: 'Aug 14',
      issue: 'Balance discrepancy across bureaus',
      bureaus: ['Equifax', 'Experian'],
    },
    {
      id: 2,
      creditor: 'Chase',
      account: 'Sapphire Preferred (****5678)',
      status: 'Open',
      balance: '$8,900',
      limit: '$15,000',
      lastReported: 'Aug 15',
      issue: 'Payment status inconsistency',
      bureaus: ['TransUnion'],
    },
    {
      id: 3,
      creditor: 'Experian',
      account: 'Medical Collection (****9012)',
      status: 'Collection',
      balance: '$1,200',
      limit: 'N/A',
      lastReported: 'Aug 10',
      issue: 'Potential duplicate reporting',
      bureaus: ['Equifax', 'Experian', 'TransUnion'],
    },
    {
      id: 4,
      creditor: 'Wells Fargo',
      account: 'Auto Loan (****3456)',
      status: 'Open',
      balance: '$12,500',
      limit: '$18,000',
      lastReported: 'Aug 13',
      issue: null,
      bureaus: ['All Three'],
    },
    {
      id: 5,
      creditor: 'Citibank',
      account: 'Student Loan (****7890)',
      status: 'Closed',
      balance: '$0',
      limit: 'N/A',
      lastReported: 'Aug 12',
      issue: 'Still reporting as open',
      bureaus: ['Equifax'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Audit</h1>
        <p className="text-gray-600">Review your accounts across all three bureaus and address identified issues.</p>
      </div>

      {/* Bureau Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Equifax', accounts: 12, issues: 3 },
          { name: 'Experian', accounts: 12, issues: 2 },
          { name: 'TransUnion', accounts: 12, issues: 2 },
        ].map((bureau) => (
          <div key={bureau.name} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{bureau.name}</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{bureau.accounts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issues Found</p>
                <p className="text-2xl font-bold text-orange-600">{bureau.issues}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tradelines List */}
      <div className="space-y-4">
        {tradelines.map((tradeline) => (
          <div key={tradeline.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{tradeline.creditor}</h3>
                <p className="text-gray-600 text-sm">{tradeline.account}</p>
              </div>
              {tradeline.issue && (
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-lg">
                  <AlertCircle size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Issue Found</span>
                </div>
              )}
              {!tradeline.issue && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">No Issues</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <p className="font-medium text-gray-900">{tradeline.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Balance</p>
                <p className="font-medium text-gray-900">{tradeline.balance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Limit</p>
                <p className="font-medium text-gray-900">{tradeline.limit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Last Reported</p>
                <p className="font-medium text-gray-900">{tradeline.lastReported}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Bureaus</p>
                <p className="font-medium text-gray-900 text-sm">{tradeline.bureaus.join(', ')}</p>
              </div>
            </div>

            {tradeline.issue && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm font-medium text-orange-900">{tradeline.issue}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
