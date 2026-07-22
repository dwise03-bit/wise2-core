'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  industry: string;
  mrr: number;
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme HVAC Inc',
    email: 'contact@acmehvac.com',
    industry: 'HVAC',
    mrr: 5000,
    status: 'active',
    lastContact: '2 days ago',
  },
  {
    id: '2',
    name: 'The Golden Fork Restaurant',
    email: 'hello@goldenfork.com',
    industry: 'Food & Beverage',
    mrr: 3500,
    status: 'active',
    lastContact: '5 days ago',
  },
  {
    id: '3',
    name: 'Sterling Law Group',
    email: 'info@sterlinglaw.com',
    industry: 'Legal',
    mrr: 8000,
    status: 'active',
    lastContact: '1 day ago',
  },
  {
    id: '4',
    name: 'Downtown Medical',
    email: 'admin@downtownmed.com',
    industry: 'Healthcare',
    mrr: 6500,
    status: 'active',
    lastContact: '3 days ago',
  },
  {
    id: '5',
    name: 'BuildRight Construction',
    email: 'sales@buildright.com',
    industry: 'Construction',
    mrr: 4200,
    status: 'active',
    lastContact: '1 week ago',
  },
];

export default function CRMPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);

  const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">👥 CRM</h1>
          <p className="text-gray-400 mt-1">Manage customers and relationships</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600"
        >
          + New Customer
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Customers</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{customers.length}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total MRR</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">${(totalMRR / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">
            {customers.filter((c) => c.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg overflow-hidden">
          <div className="bg-[#1a1a2e] border-b border-[#2cd588] px-6 py-4">
            <h2 className="font-bold text-[#2cd588]">Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050505] border-b border-[#2cd588]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">MRR</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2cd588]/10">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-[#2cd588]/10 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{customer.email}</td>
                    <td className="px-6 py-4 text-[#2cd588] font-mono">${customer.mrr}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-mono ${
                          customer.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail */}
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          {selectedCustomer ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-[#2cd588] font-bold text-lg">{selectedCustomer.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedCustomer.industry}</p>
              </div>
              <div className="bg-[#050505] p-4 rounded space-y-2 border border-[#2cd588]/20">
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white font-mono text-sm">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Monthly Revenue</p>
                  <p className="text-[#2cd588] font-bold text-lg">${selectedCustomer.mrr}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Last Contact</p>
                  <p className="text-white text-sm">{selectedCustomer.lastContact}</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-[#2cd588]/20 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/30">
                View Timeline
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a customer to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
