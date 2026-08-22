'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Image,
  MapPin,
  CreditCard,
  Building2,
  Settings,
  BarChart3,
  Phone,
  Lock,
  MessageSquare,
  QrCode,
  TrendingUp,
  ChevronRight,
  Eye,
  Upload,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: ShoppingCart, label: 'Orders', href: '#' },
  { icon: FileText, label: 'Quotes', href: '#' },
  { icon: Image, label: 'Art Vault', href: '#' },
  { icon: MapPin, label: 'Addresses', href: '#' },
  { icon: CreditCard, label: 'Payment Methods', href: '#' },
  { icon: Building2, label: 'Business Account', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

const recentOrders = [
  { id: '#PS-10254', date: 'May 12, 2025', product: '3D Printed Parts', status: 'In Production', color: 'bg-[#72FF3B]/20 text-[#72FF3B]' },
  { id: '#PS-10253', date: 'May 11, 2025', product: 'DTF Gang Sheet', status: 'Printing', color: 'bg-[#27C7FF]/20 text-[#27C7FF]' },
  { id: '#PS-10252', date: 'May 10, 2025', product: 'Design Service', status: 'Proof Approval', color: 'bg-orange-500/20 text-orange-400' },
  { id: '#PS-10251', date: 'May 8, 2025', product: '3D Printed Parts', status: 'Shipped', color: 'bg-green-500/20 text-green-400' },
];

const artworkVault = [
  { id: 1, name: 'IMP ENERGY', image: '🎨' },
  { id: 2, name: 'IMP EMPIRE', image: '⚡' },
  { id: 3, name: 'SENCERE', image: '🎭' },
  { id: 4, name: 'IMP DRIP', image: '💧' },
];

export default function PrintShopDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030504] text-white flex" role="application" aria-label="Print Shop Dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-0 h-screen bg-[#070B09] border-r border-[#27C7FF]/10 w-64 transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#27C7FF]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#72FF3B] to-[#27C7FF] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">W</span>
            </div>
            <span className="font-bold">WISE²</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden printshop-btn printshop-btn-secondary p-1"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4" role="list">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`printshop-nav-item mb-2 ${
                item.active ? 'bg-[#72FF3B]/15 border-l-2 border-[#72FF3B]' : 'hover:bg-[#27C7FF]/5'
              }`}
              aria-current={item.active ? 'page' : undefined}
              role="listitem"
            >
              <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="ml-3 text-sm font-medium">{item.label}</span>
              {item.active && <ChevronRight className="w-4 h-4 ml-auto text-[#72FF3B]" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#27C7FF]/10 p-4">
          <div className="text-xs text-[#8D98A5] space-y-1">
            <p>© 2025 SenCere Creative</p>
            <p>Powered by WISE²</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="border-b border-[#27C7FF]/10 bg-[#030504] sticky top-0 z-40 printshop-section py-4">
          <div className="flex items-center justify-between px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden printshop-btn printshop-btn-secondary p-2"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button className="printshop-btn printshop-btn-secondary text-sm">
                Start Your Build
              </button>
              <button
                className="printshop-btn printshop-btn-secondary p-2"
                aria-label="Login"
              >
                Login →
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="printshop-section px-4 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="printshop-heading text-3xl md:text-4xl mb-2">Your Order Dashboard</h1>
              <p className="text-[#8D98A5] text-sm">TRACK. MANAGE. REORDER.</p>
            </div>

            {/* Production Status Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#111815] to-[#070B09] border border-[#72FF3B]/20 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[#72FF3B] text-sm font-semibold uppercase tracking-wider mb-2">
                    Production Status
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-1">12</h2>
                  <p className="text-[#8D98A5] text-sm">Orders in Production</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#72FF3B]" aria-hidden="true" />
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#72FF3B]/10 rounded-lg p-4">
                  <p className="text-[#72FF3B] text-2xl font-bold">6</p>
                  <p className="text-xs text-[#8D98A5]">3D Printing</p>
                </div>
                <div className="bg-[#27C7FF]/10 rounded-lg p-4">
                  <p className="text-[#27C7FF] text-2xl font-bold">4</p>
                  <p className="text-xs text-[#8D98A5]">DTF Transfers</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <p className="text-green-400 text-2xl font-bold">2</p>
                  <p className="text-xs text-[#8D98A5]">Shipping Today</p>
                </div>
              </div>

              <button
                className="printshop-btn printshop-btn-primary w-full"
                aria-label="View production queue"
              >
                View Production Queue <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6 mb-8"
            >
              <h3 className="text-xl font-bold mb-6">Recent Orders</h3>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-[#27C7FF]/10">
                      <th className="text-left text-xs font-semibold text-[#8D98A5] py-3 px-4">ORDER</th>
                      <th className="text-left text-xs font-semibold text-[#8D98A5] py-3 px-4">DATE</th>
                      <th className="text-left text-xs font-semibold text-[#8D98A5] py-3 px-4">PRODUCT</th>
                      <th className="text-left text-xs font-semibold text-[#8D98A5] py-3 px-4">STATUS</th>
                      <th className="text-center text-xs font-semibold text-[#8D98A5] py-3 px-4">TRACKING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[#27C7FF]/5 hover:bg-[#27C7FF]/5 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{order.id}</td>
                        <td className="py-4 px-4 text-sm text-[#8D98A5]">{order.date}</td>
                        <td className="py-4 px-4 text-sm">{order.product}</td>
                        <td className="py-4 px-4">
                          <span className={`printshop-status-badge ${order.color}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#27C7FF]/10 transition-colors"
                            aria-label={`Track order ${order.id}`}
                          >
                            <QrCode className="w-4 h-4 text-[#27C7FF]" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mt-6">
                <button className="printshop-btn printshop-btn-primary">
                  View All Orders
                </button>
              </div>
            </motion.div>

            {/* Artwork Vault */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6 mb-8"
            >
              <h3 className="text-xl font-bold mb-6">Artwork Vault</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {artworkVault.map((art) => (
                  <div
                    key={art.id}
                    className="aspect-square bg-[#070B09] border border-[#27C7FF]/20 rounded-lg flex items-center justify-center hover:border-[#72FF3B]/50 transition-colors cursor-pointer group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{art.image}</div>
                    <p className="text-xs text-[#8D98A5] absolute bottom-2">{art.name}</p>
                  </div>
                ))}
              </div>
              <button className="printshop-btn printshop-btn-secondary w-full">
                <Upload className="w-4 h-4" aria-hidden="true" />
                Upload New Artwork
              </button>
            </motion.div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Wholesale Pricing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6"
              >
                <TrendingUp className="w-6 h-6 text-[#72FF3B] mb-4" aria-hidden="true" />
                <h4 className="font-semibold mb-2">Wholesale & Business Pricing</h4>
                <p className="text-sm text-[#8D98A5] mb-4">Volume discounts, net terms & more.</p>
                <button className="text-[#72FF3B] text-sm font-semibold hover:underline">
                  Learn more →
                </button>
              </motion.div>

              {/* Local Pickup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6"
              >
                <MapPin className="w-6 h-6 text-[#27C7FF] mb-4" aria-hidden="true" />
                <h4 className="font-semibold mb-2">Local Pickup Schedule</h4>
                <p className="text-sm text-[#8D98A5] mb-4">Choose a time that works for you.</p>
                <button className="text-[#27C7FF] text-sm font-semibold hover:underline">
                  View schedule →
                </button>
              </motion.div>

              {/* Secure Checkout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6"
              >
                <Lock className="w-6 h-6 text-green-400 mb-4" aria-hidden="true" />
                <h4 className="font-semibold mb-2">Secure Checkout Powered by Stripe</h4>
                <p className="text-sm text-[#8D98A5] mb-4">Fast. Safe. Reliable.</p>
                <button className="text-green-400 text-sm font-semibold hover:underline">
                  Learn more →
                </button>
              </motion.div>

              {/* IMP Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#111815] border border-[#27C7FF]/10 rounded-xl p-6"
              >
                <MessageSquare className="w-6 h-6 text-[#72FF3B] mb-4" aria-hidden="true" />
                <h4 className="font-semibold mb-2">IMP Print Assistant</h4>
                <p className="text-sm text-[#8D98A5] mb-4">Your AI production co-pilot. Ask. Help.</p>
                <button className="text-[#72FF3B] text-sm font-semibold hover:underline">
                  Chat now →
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
