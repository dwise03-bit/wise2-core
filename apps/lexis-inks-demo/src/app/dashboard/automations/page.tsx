'use client';

import Link from 'next/link';

const automations = [
  {
    id: 1,
    trigger: 'Order Received',
    message: 'Hi [Customer Name]! Thanks for your order. We\'ll be crafting your custom pens with care! 🎨',
    status: 'active',
    count: 86,
  },
  {
    id: 2,
    trigger: 'Deposit Due',
    message: 'Your custom pens are coming! We just need the deposit to get started. Reply to confirm! 💙',
    status: 'active',
    count: 4,
  },
  {
    id: 3,
    trigger: 'Order Ready',
    message: 'Exciting news! Your custom pens are ready! Let\'s get them to you. 🚚',
    status: 'active',
    count: 2,
  },
  {
    id: 4,
    trigger: 'Review Request',
    message: 'Love your custom pens? We\'d love to hear about your experience! ⭐',
    status: 'active',
    count: 12,
  },
  {
    id: 5,
    trigger: 'Thank You Follow-up',
    message: 'Thanks again for supporting Lexi\'s Inks! Stay creative! ✨',
    status: 'paused',
    count: 0,
  },
];

export default function AutomationsPage() {
  return (
    <main className="bg-navy min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-cyan hover:text-cyan-glow mb-6 inline-block">← Back</Link>
        <h1 className="text-4xl font-bold mb-2">Growth Automations</h1>
        <p className="text-silver-dark mb-8">Auto-send messages at key moments in your customer journey</p>

        <div className="space-y-4">
          {automations.map((auto) => (
            <div key={auto.id} className="bg-navy-light rounded-lg p-6 border border-navy-light hover:border-cyan transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-cyan">{auto.trigger}</h3>
                  <p className="text-silver-dark text-sm mt-2">{auto.message}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                  auto.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-300'
                }`}>
                  {auto.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-silver-dark">Sent this month: <span className="text-cyan font-bold">{auto.count}</span></span>
                <button className="text-cyan hover:text-cyan-glow transition">Configure →</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue/10 border border-blue rounded-lg p-8 text-center">
          <h3 className="font-bold text-lg text-cyan mb-2">Add Custom Automation</h3>
          <p className="text-silver-dark mb-4">Create your own message sequences for special campaigns</p>
          <button className="px-6 py-2 bg-blue hover:bg-blue-light rounded font-bold transition">
            + Create Automation
          </button>
        </div>
      </div>
    </main>
  );
}
