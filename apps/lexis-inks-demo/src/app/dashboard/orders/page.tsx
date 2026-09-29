'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(data);
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <main className="bg-navy min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-cyan hover:text-cyan-glow mb-6 inline-block">← Back</Link>
        <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

        <div className="flex gap-4 mb-8">
          {['all', 'completed', 'in-progress', 'pending-deposit', 'ready', 'new'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-bold transition ${
                filter === status ? 'bg-cyan text-navy' : 'bg-navy-light hover:border-cyan border border-navy-light'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-navy-light rounded-lg overflow-hidden border border-navy-light">
          <table className="w-full">
            <thead className="bg-navy-dark">
              <tr>
                <th className="text-left p-4 text-silver-dark">Order ID</th>
                <th className="text-left p-4 text-silver-dark">Customer</th>
                <th className="text-left p-4 text-silver-dark">Amount</th>
                <th className="text-left p-4 text-silver-dark">Quantity</th>
                <th className="text-left p-4 text-silver-dark">Status</th>
                <th className="text-left p-4 text-silver-dark">Date</th>
                <th className="text-left p-4 text-silver-dark">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-navy hover:bg-navy transition">
                  <td className="p-4 font-mono text-cyan">{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{order.name}</div>
                    <div className="text-xs text-silver-dark">{order.email}</div>
                  </td>
                  <td className="p-4 font-bold text-cyan">${order.totalPrice.toFixed(2)}</td>
                  <td className="p-4">{order.quantity}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                      order.status === 'completed' ? 'bg-green-900 text-green-300' :
                      order.status === 'in-progress' ? 'bg-blue/20 text-blue-light' :
                      order.status === 'pending-deposit' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-900 text-gray-300'
                    }`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-silver-dark">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4"><button className="text-cyan hover:text-cyan-glow">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-silver-dark mt-8">Showing {filteredOrders.length} orders</p>
      </div>
    </main>
  );
}
