'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const custData = JSON.parse(localStorage.getItem('customers') || '[]');
    const ordData = JSON.parse(localStorage.getItem('orders') || '[]');
    setCustomers(custData);
    setOrders(ordData);
  }, []);

  const getCustomerOrders = (email: string) => orders.filter(o => o.email === email).length;
  const getCustomerRevenue = (email: string) => orders.filter(o => o.email === email).reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <main className="bg-navy min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-cyan hover:text-cyan-glow mb-6 inline-block">← Back</Link>
        <h1 className="text-4xl font-bold mb-8">Customer Relationship Manager</h1>

        <div className="bg-navy-light rounded-lg overflow-hidden border border-navy-light">
          <table className="w-full">
            <thead className="bg-navy-dark">
              <tr>
                <th className="text-left p-4 text-silver-dark">Name</th>
                <th className="text-left p-4 text-silver-dark">Email</th>
                <th className="text-left p-4 text-silver-dark">Orders</th>
                <th className="text-left p-4 text-silver-dark">Revenue</th>
                <th className="text-left p-4 text-silver-dark">VIP Status</th>
                <th className="text-left p-4 text-silver-dark">Joined</th>
                <th className="text-left p-4 text-silver-dark">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-navy hover:bg-navy transition">
                  <td className="p-4 font-bold">{customer.name}</td>
                  <td className="p-4 text-silver-dark">{customer.email}</td>
                  <td className="p-4 text-cyan font-bold">{getCustomerOrders(customer.email)}</td>
                  <td className="p-4 text-cyan font-bold">${getCustomerRevenue(customer.email).toFixed(2)}</td>
                  <td className="p-4">
                    {customer.vipStatus ? (
                      <span className="px-3 py-1 rounded bg-yellow-900 text-yellow-300 text-xs font-bold">VIP</span>
                    ) : (
                      <span className="text-silver-dark text-xs">Regular</span>
                    )}
                  </td>
                  <td className="p-4 text-silver-dark text-sm">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="p-4"><button className="text-cyan hover:text-cyan-glow">View Profile</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-silver-dark mt-8">{customers.length} total customers</p>
      </div>
    </main>
  );
}
