'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Settings, LogOut, ShoppingCart, ChevronRight } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

export default function SenCereAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('sencere_token');
    const userStr = sessionStorage.getItem('sencere_user');

    if (!token || !userStr) {
      router.push('/sencere/login');
      return;
    }

    const user = JSON.parse(userStr);
    setCustomer(user);

    // TODO: Fetch orders from API
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-2026-001',
        status: 'SHIPPED',
        totalAmount: 45.99,
        createdAt: '2026-08-20',
        itemCount: 2,
      },
      {
        id: '2',
        orderNumber: 'ORD-2026-002',
        status: 'PROCESSING',
        totalAmount: 189.50,
        createdAt: '2026-08-22',
        itemCount: 5,
      },
    ]);

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('sencere_token');
    sessionStorage.removeItem('sencere_user');
    router.push('/sencere');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'PROCESSING':
        return 'bg-blue-500/20 text-blue-400';
      case 'SHIPPED':
        return 'bg-green-500/20 text-green-400';
      case 'DELIVERED':
        return 'bg-green-600/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-montserrat">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-cormorant text-4xl font-bold text-white mb-2">
              My Account
            </h1>
            <p className="font-montserrat text-gray-400">
              Welcome back, {customer.firstName}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white font-montserrat text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-[#0F172A] rounded-lg border border-gray-700 overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-3 px-4 py-3 font-montserrat text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-[#0369A1]/20 text-[#0369A1] border-l-2 border-[#0369A1]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Account Details
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 font-montserrat text-sm transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#0369A1]/20 text-[#0369A1] border-l-2 border-[#0369A1]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Order History
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-4 py-3 font-montserrat text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-[#0369A1]/20 text-[#0369A1] border-l-2 border-[#0369A1]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-[#0369A1]/10 rounded-lg border border-[#0369A1]/30 p-4">
              <h3 className="font-montserrat font-semibold text-white mb-3">Quick Actions</h3>
              <Link
                href="/sencere/products"
                className="flex items-center gap-2 text-[#0369A1] hover:text-blue-400 font-montserrat text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Continue Shopping
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-6">
                  <h2 className="font-cormorant text-2xl font-bold text-white mb-4">
                    Account Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-1">
                        First Name
                      </p>
                      <p className="font-montserrat text-white">{customer.firstName}</p>
                    </div>
                    <div>
                      <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Last Name
                      </p>
                      <p className="font-montserrat text-white">{customer.lastName}</p>
                    </div>
                    <div>
                      <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Email Address
                      </p>
                      <p className="font-montserrat text-white">{customer.email}</p>
                    </div>
                    <div>
                      <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <p className="font-montserrat text-white">
                        {customer.phone || 'Not provided'}
                      </p>
                    </div>
                    {customer.company && (
                      <div className="md:col-span-2">
                        <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Company
                        </p>
                        <p className="font-montserrat text-white">{customer.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-cormorant text-2xl font-bold text-white">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[#0369A1] hover:text-blue-400 font-montserrat text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-gray-700"
                      >
                        <div>
                          <p className="font-montserrat font-semibold text-white">
                            {order.orderNumber}
                          </p>
                          <p className="font-montserrat text-xs text-gray-500">
                            {order.itemCount} items • {order.createdAt}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-montserrat font-semibold ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <p className="font-montserrat font-semibold text-[#0369A1] mt-1">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-6">
                <h2 className="font-cormorant text-2xl font-bold text-white mb-6">
                  Order History
                </h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="font-montserrat text-gray-400 mb-4">
                      No orders yet
                    </p>
                    <Link
                      href="/sencere/products"
                      className="inline-block px-4 py-2 bg-[#0369A1] hover:bg-blue-700 text-white font-montserrat text-sm rounded-lg transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/sencere/account/orders/${order.id}`}
                        className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-gray-700 hover:border-[#0369A1]/50 transition-colors"
                      >
                        <div>
                          <p className="font-montserrat font-semibold text-white mb-1">
                            {order.orderNumber}
                          </p>
                          <p className="font-montserrat text-xs text-gray-500">
                            {order.itemCount} items • Ordered on {order.createdAt}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-montserrat font-semibold mb-2 ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <p className="font-montserrat font-semibold text-[#0369A1]">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-6">
                  <h2 className="font-cormorant text-2xl font-bold text-white mb-6">
                    Account Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-gray-700">
                      <div>
                        <p className="font-montserrat font-semibold text-white">
                          Email Notifications
                        </p>
                        <p className="font-montserrat text-xs text-gray-500">
                          Receive order updates and promotions
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-[#0369A1]/20 text-[#0369A1] border border-[#0369A1]/50 rounded-lg font-montserrat text-sm hover:bg-[#0369A1]/30 transition-colors">
                        Enabled
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-gray-700">
                      <div>
                        <p className="font-montserrat font-semibold text-white">
                          Change Password
                        </p>
                        <p className="font-montserrat text-xs text-gray-500">
                          Update your account password
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg font-montserrat text-sm hover:bg-gray-700 transition-colors">
                        Update
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-gray-700">
                      <div>
                        <p className="font-montserrat font-semibold text-white">
                          Shipping Address
                        </p>
                        <p className="font-montserrat text-xs text-gray-500">
                          Manage your default shipping address
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg font-montserrat text-sm hover:bg-gray-700 transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
