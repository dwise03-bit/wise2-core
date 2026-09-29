'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConsultingDashboard() {
  const [metrics, setMetrics] = useState<any>({
    newLeads: 0,
    qualifiedLeads: 0,
    bookings: 0,
    revenue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from API
    // TODO: Implement actual API call
    setMetrics({
      newLeads: 12,
      qualifiedLeads: 8,
      bookings: 3,
      revenue: 1491,
      conversionRate: 25,
    });
    setLoading(false);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
        Consulting & Audits
      </h1>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            NEW LEADS
          </div>
          <div className="text-3xl font-bold mb-2">{metrics.newLeads}</div>
          <div style={{ color: '#39FF14', fontSize: '12px' }}>This month</div>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            QUALIFIED
          </div>
          <div className="text-3xl font-bold mb-2">{metrics.qualifiedLeads}</div>
          <div style={{ color: '#39FF14', fontSize: '12px' }}>Ready to book</div>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            BOOKINGS
          </div>
          <div className="text-3xl font-bold mb-2">{metrics.bookings}</div>
          <div style={{ color: '#39FF14', fontSize: '12px' }}>Scheduled</div>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            REVENUE
          </div>
          <div className="text-3xl font-bold mb-2">${metrics.revenue}</div>
          <div style={{ color: '#39FF14', fontSize: '12px' }}>This month</div>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            CONVERSION
          </div>
          <div className="text-3xl font-bold mb-2">{metrics.conversionRate}%</div>
          <div style={{ color: '#39FF14', fontSize: '12px' }}>Lead to booking</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/consulting/leads"
          className="p-6 rounded-xl text-center transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 148, 255, 0.05))',
            border: '1px solid rgba(57, 255, 20, 0.35)',
          }}
        >
          <div className="text-3xl mb-2">📋</div>
          <div className="font-bold">View All Leads</div>
          <div style={{ color: '#8D98A5', fontSize: '12px', marginTop: '4px' }}>Manage pipeline</div>
        </Link>

        <Link
          href="/admin/consulting/projects"
          className="p-6 rounded-xl text-center transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 148, 255, 0.05))',
            border: '1px solid rgba(57, 255, 20, 0.35)',
          }}
        >
          <div className="text-3xl mb-2">🚀</div>
          <div className="font-bold">View Projects</div>
          <div style={{ color: '#8D98A5', fontSize: '12px', marginTop: '4px' }}>Track sessions</div>
        </Link>

        <Link
          href="/admin/consulting/follow-ups"
          className="p-6 rounded-xl text-center transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 148, 255, 0.05))',
            border: '1px solid rgba(57, 255, 20, 0.35)',
          }}
        >
          <div className="text-3xl mb-2">📧</div>
          <div className="font-bold">Follow-ups</div>
          <div style={{ color: '#8D98A5', fontSize: '12px', marginTop: '4px' }}>Automation queue</div>
        </Link>
      </div>

      {/* Instructions */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(0, 148, 255, 0.05))',
          border: '1px solid rgba(57, 255, 20, 0.2)',
        }}
      >
        <h2 className="font-bold mb-4">Getting Started</h2>
        <ol className="space-y-2" style={{ color: '#A0A0A0' }}>
          <li>1. Set up Stripe products: audit ($149), live-build ($497), impl-day ($997), management ($297/mo)</li>
          <li>2. Create Stripe price IDs and add to ConsultingService records in database</li>
          <li>3. Configure worker jobs for lead intake, payment, and follow-up automation</li>
          <li>4. Add email templates for each stage of the customer journey</li>
          <li>5. Monitor leads and bookings through this dashboard</li>
        </ol>
      </div>
    </div>
  );
}
