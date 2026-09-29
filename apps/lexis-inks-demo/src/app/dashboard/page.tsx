'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  name: string;
  email: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const seedDemoData = () => {
  const customers = [
    { id: 'CUST-001', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 123-4567', vipStatus: true, createdAt: '2024-01-15' },
    { id: 'CUST-002', name: 'Mike Chen', email: 'mike@example.com', phone: '(555) 234-5678', vipStatus: false, createdAt: '2024-01-20' },
    { id: 'CUST-003', name: 'Jessica Rodriguez', email: 'jessica@example.com', phone: '(555) 345-6789', vipStatus: true, createdAt: '2024-02-01' },
    { id: 'CUST-004', name: 'David Park', email: 'david@example.com', phone: '(555) 456-7890', vipStatus: false, createdAt: '2024-02-10' },
    { id: 'CUST-005', name: 'Emily Watson', email: 'emily@example.com', phone: '(555) 567-8901', vipStatus: true, createdAt: '2024-02-15' },
  ];

  const orders = [
    { id: 'ORD-001', customerId: 'CUST-001', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'completed', totalPrice: 45.97, penColor: 'cyan', topper: 'crystal', theme: 'luxury', quantity: 2, createdAt: '2024-01-15' },
    { id: 'ORD-002', customerId: 'CUST-002', name: 'Mike Chen', email: 'mike@example.com', status: 'in-progress', totalPrice: 18.99, penColor: 'blue', topper: 'charm', theme: 'classic', quantity: 1, createdAt: '2024-01-20' },
    { id: 'ORD-003', customerId: 'CUST-003', name: 'Jessica Rodriguez', email: 'jessica@example.com', status: 'completed', totalPrice: 121.98, penColor: 'navy', topper: 'bead', theme: 'neon', quantity: 4, createdAt: '2024-02-01' },
    { id: 'ORD-004', customerId: 'CUST-004', name: 'David Park', email: 'david@example.com', status: 'pending-deposit', totalPrice: 37.98, penColor: 'silver', topper: 'crystal', theme: 'minimal', quantity: 2, createdAt: '2024-02-10' },
    { id: 'ORD-005', customerId: 'CUST-005', name: 'Emily Watson', email: 'emily@example.com', status: 'completed', totalPrice: 64.97, penColor: 'cyan', topper: 'plain', theme: 'luxury', quantity: 3, createdAt: '2024-02-15' },
  ];

  // Generate more demo orders to reach ~86 total
  const statusOptions = ['completed', 'in-progress', 'pending-deposit', 'ready'];
  const colors = ['navy', 'blue', 'cyan', 'silver'];
  const toppers = ['crystal', 'bead', 'charm', 'plain'];
  const themes = ['classic', 'luxury', 'neon', 'minimal'];

  for (let i = 6; i <= 86; i++) {
    const custIdx = (i - 1) % customers.length;
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    const basePrice = 12.99;
    const topperPrices = { crystal: 3, bead: 4, charm: 2, plain: 0 };
    const themePrices = { classic: 0, luxury: 5, neon: 6, minimal: 0 };
    const topper = toppers[Math.floor(Math.random() * toppers.length)] as keyof typeof topperPrices;
    const theme = themes[Math.floor(Math.random() * themes.length)] as keyof typeof themePrices;
    const totalPrice = (basePrice + topperPrices[topper] + themePrices[theme]) * qty;

    orders.push({
      id: `ORD-${String(i).padStart(3, '0')}`,
      customerId: customers[custIdx].id,
      name: customers[custIdx].name,
      email: customers[custIdx].email,
      status,
      totalPrice: Math.round(totalPrice * 100) / 100,
      penColor: colors[Math.floor(Math.random() * colors.length)],
      topper,
      theme,
      quantity: qty,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(customers));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(orders));
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, newCustomers: 0, avgOrderValue: 0 });

  useEffect(() => {
    seedDemoData();
    const auth = localStorage.getItem('dashboardAuth') === 'true';
    setIsAuthenticated(auth);
    if (auth) {
      loadData();
    }
  }, []);

  const loadData = () => {
    const ordersData = JSON.parse(localStorage.getItem('orders') || '[]');
    const customersData = JSON.parse(localStorage.getItem('customers') || '[]');
    setOrders(ordersData);
    setCustomers(customersData);

    const revenue = ordersData.reduce((sum: number, o: any) => sum + o.totalPrice, 0);
    const avgOrderValue = ordersData.length > 0 ? revenue / ordersData.length : 0;
    setStats({
      revenue: Math.round(revenue * 100) / 100,
      orderCount: ordersData.length,
      newCustomers: customersData.length,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'demo@lexisinks.com' && password === 'demo123') {
      localStorage.setItem('dashboardAuth', 'true');
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('Invalid credentials. Use demo@lexisinks.com / demo123');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardAuth');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <main className="bg-navy min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-navy-light rounded-lg p-8 border border-navy-light">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">Owner Dashboard</h1>
            <p className="text-silver-dark">Sign in to manage your business</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-navy rounded border border-navy-light focus:border-cyan outline-none text-white"
                placeholder="demo@lexisinks.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-navy rounded border border-navy-light focus:border-cyan outline-none text-white"
                placeholder="demo123"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue hover:bg-blue-light rounded font-bold text-white transition">
              Sign In
            </button>
          </form>

          <div className="bg-navy rounded-lg p-4 mb-6 text-center text-sm text-silver-dark">
            <p className="mb-2 font-bold text-white">Demo Credentials</p>
            <p className="font-mono text-xs">Email: demo@lexisinks.com</p>
            <p className="font-mono text-xs">Password: demo123</p>
          </div>

          <Link href="/" className="block text-center text-cyan hover:text-cyan-glow transition">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-navy min-h-screen">
      {/* Navigation */}
      <nav className="bg-navy-dark border-b border-navy-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✒️</span>
            <div>
              <div className="font-bold text-white">Lexi's Inks</div>
              <div className="text-xs text-cyan">Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-silver-dark">Welcome, Lexi</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-navy-light border-b border-navy-light sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          <Link href="/dashboard" className="py-4 border-b-2 border-cyan text-white font-bold">Overview</Link>
          <Link href="/dashboard/orders" className="py-4 border-b-2 border-transparent text-silver-dark hover:text-white transition">Orders</Link>
          <Link href="/dashboard/customers" className="py-4 border-b-2 border-transparent text-silver-dark hover:text-white transition">Customers</Link>
          <Link href="/dashboard/inventory" className="py-4 border-b-2 border-transparent text-silver-dark hover:text-white transition">Inventory</Link>
          <Link href="/dashboard/automations" className="py-4 border-b-2 border-transparent text-silver-dark hover:text-white transition">Automations</Link>
          <Link href="/dashboard/ai" className="py-4 border-b-2 border-transparent text-silver-dark hover:text-white transition">AI Assistant</Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-white">
        <h1 className="text-4xl font-bold mb-8">Business Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-cyan">${stats.revenue.toFixed(2)}</p>
            <p className="text-xs text-silver-dark mt-2">All time</p>
          </div>
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-cyan">{stats.orderCount}</p>
            <p className="text-xs text-silver-dark mt-2">All pens sold</p>
          </div>
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Customers</p>
            <p className="text-3xl font-bold text-cyan">{stats.newCustomers}</p>
            <p className="text-xs text-silver-dark mt-2">Active relationships</p>
          </div>
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Avg Order Value</p>
            <p className="text-3xl font-bold text-cyan">${stats.avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-silver-dark mt-2">Per order</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
          <h2 className="text-2xl font-bold mb-4 text-cyan">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy">
                  <th className="text-left py-3 text-silver-dark">#</th>
                  <th className="text-left py-3 text-silver-dark">Customer</th>
                  <th className="text-left py-3 text-silver-dark">Amount</th>
                  <th className="text-left py-3 text-silver-dark">Status</th>
                  <th className="text-left py-3 text-silver-dark">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-navy hover:bg-navy transition">
                    <td className="py-3 font-mono text-cyan">{order.id}</td>
                    <td className="py-3">
                      <div>{order.name}</div>
                      <div className="text-xs text-silver-dark">{order.email}</div>
                    </td>
                    <td className="py-3 font-bold text-cyan">${order.totalPrice.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-900 text-green-300' :
                        order.status === 'in-progress' ? 'bg-blue/20 text-blue-light' :
                        order.status === 'pending-deposit' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-silver-dark">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/dashboard/orders" className="mt-4 inline-block text-cyan hover:text-cyan-glow transition">
            View all orders →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Link href="/custom-order" className="bg-blue hover:bg-blue-light rounded-lg p-6 text-center transition transform hover:scale-105">
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-bold text-navy">Create Order</h3>
          </Link>
          <Link href="/dashboard/automations" className="bg-cyan hover:opacity-90 rounded-lg p-6 text-center transition transform hover:scale-105 text-navy">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-bold">Set Automations</h3>
          </Link>
          <Link href="/dashboard/ai" className="bg-gradient-to-br from-blue to-cyan hover:opacity-90 rounded-lg p-6 text-center transition transform hover:scale-105 text-navy">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold">Chat with Lexi</h3>
          </Link>
        </div>
      </div>
    </main>
  );
}
