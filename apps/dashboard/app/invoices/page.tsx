'use client';

import { useState } from 'react';

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  items: Array<{ description: string; qty: number; rate: number }>;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2026-001',
    customer: 'Acme HVAC Inc',
    amount: 5000,
    tax: 500,
    total: 5500,
    status: 'paid',
    issuedDate: '2026-07-01',
    dueDate: '2026-08-01',
    paidDate: '2026-07-20',
    items: [{ description: 'Web Development Services', qty: 1, rate: 5000 }],
  },
  {
    id: '2',
    number: 'INV-2026-002',
    customer: 'Sterling Law Group',
    amount: 8000,
    tax: 800,
    total: 8800,
    status: 'paid',
    issuedDate: '2026-07-05',
    dueDate: '2026-08-05',
    paidDate: '2026-07-22',
    items: [{ description: 'Legal Software License', qty: 1, rate: 8000 }],
  },
  {
    id: '3',
    number: 'INV-2026-003',
    customer: 'Downtown Medical',
    amount: 6500,
    tax: 650,
    total: 7150,
    status: 'sent',
    issuedDate: '2026-07-10',
    dueDate: '2026-08-10',
    items: [{ description: 'Healthcare Portal Setup', qty: 1, rate: 6500 }],
  },
  {
    id: '4',
    number: 'INV-2026-004',
    customer: 'BuildRight Construction',
    amount: 4200,
    tax: 420,
    total: 4620,
    status: 'overdue',
    issuedDate: '2026-06-15',
    dueDate: '2026-07-15',
    items: [{ description: 'Project Management Software', qty: 1, rate: 4200 }],
  },
  {
    id: '5',
    number: 'INV-2026-005',
    customer: 'Golden Fork Restaurant',
    amount: 3500,
    tax: 350,
    total: 3850,
    status: 'draft',
    issuedDate: '2026-07-20',
    dueDate: '2026-08-20',
    items: [{ description: 'POS System Integration', qty: 1, rate: 3500 }],
  },
];

const statusColors = {
  draft: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredInvoices =
    filter === 'all'
      ? invoices
      : filter === 'paid'
        ? invoices.filter((i) => i.status === 'paid')
        : filter === 'pending'
          ? invoices.filter((i) => i.status !== 'paid')
          : invoices.filter((i) => i.status === 'overdue');

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">💳 Invoices</h1>
          <p className="text-gray-400 mt-1">Manage invoicing and payments</p>
        </div>
        <button className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
          + New Invoice
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Revenue (Paid)</p>
          <p className="text-3xl font-bold text-green-400 mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">${(totalPending / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Overdue</p>
          <p className="text-3xl font-bold text-red-400 mt-2">${(totalOverdue / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Invoices</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{invoices.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-[#2cd588] text-black'
                : 'bg-[#2cd588]/10 text-[#2cd588] border border-[#2cd588] hover:bg-[#2cd588]/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredInvoices.length})
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg overflow-hidden">
        <div className="bg-[#1a1a2e] border-b border-[#2cd588] px-6 py-4">
          <h2 className="font-bold text-[#2cd588]">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#050505] border-b border-[#2cd588]/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Number</th>
                <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Total</th>
                <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-mono text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2cd588]/10">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="hover:bg-[#2cd588]/10 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium font-mono">{invoice.number}</td>
                  <td className="px-6 py-4 text-gray-400">{invoice.customer}</td>
                  <td className="px-6 py-4 text-[#2cd588] font-mono">${invoice.total}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{invoice.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-mono ${statusColors[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail */}
      {selectedInvoice && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Invoice Preview */}
            <div className="col-span-2 space-y-6">
              <div>
                <p className="text-gray-500 text-sm">Invoice Number</p>
                <p className="text-2xl font-bold text-[#2cd588] mt-1">{selectedInvoice.number}</p>
              </div>

              <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20 space-y-4">
                <h3 className="font-bold text-white">Bill To</h3>
                <div>
                  <p className="text-white font-medium">{selectedInvoice.customer}</p>
                  <p className="text-gray-400 text-sm">Invoice due by {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20">
                <table className="w-full">
                  <thead className="border-b border-[#2cd588]/20">
                    <tr>
                      <th className="text-left text-sm text-gray-400 pb-3">Description</th>
                      <th className="text-right text-sm text-gray-400 pb-3">Qty</th>
                      <th className="text-right text-sm text-gray-400 pb-3">Rate</th>
                      <th className="text-right text-sm text-gray-400 pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="text-white py-2">{item.description}</td>
                        <td className="text-right text-gray-400">{item.qty}</td>
                        <td className="text-right text-gray-400">${item.rate}</td>
                        <td className="text-right text-[#2cd588] font-mono">${item.qty * item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary & Actions */}
            <div className="space-y-4">
              <div className="bg-[#050505] p-6 rounded border border-[#2cd588]/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-mono">${selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax (10%)</span>
                  <span className="text-white font-mono">${selectedInvoice.tax}</span>
                </div>
                <div className="flex justify-between border-t border-[#2cd588]/20 pt-3">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#2cd588] text-xl font-bold">${selectedInvoice.total}</span>
                </div>
              </div>

              {selectedInvoice.status !== 'paid' && (
                <>
                  <button className="w-full px-4 py-2 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
                    Mark as Paid
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500 rounded text-blue-400 font-medium hover:bg-blue-500/30">
                    Send Reminder
                  </button>
                </>
              )}

              {selectedInvoice.status === 'draft' && (
                <button className="w-full px-4 py-2 bg-green-500/20 border border-green-500 rounded text-green-400 font-medium hover:bg-green-500/30">
                  Send Invoice
                </button>
              )}

              <button className="w-full px-4 py-2 bg-gray-500/20 border border-gray-500 rounded text-gray-400 font-medium hover:bg-gray-500/30">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
