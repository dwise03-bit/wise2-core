'use client';

import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_PAYMENTS } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

export default function PaymentsPage() {
  const { orders } = useOrders();
  const livePaid = orders
    .filter((order) => order.title === 'Menu order' && order.status !== 'Cancelled')
    .map((order) => ({
      id: `P-${order.id}`,
      client: order.title,
      amount: order.total,
      method: 'Card' as const,
      status: order.status === 'Completed' ? ('Paid' as const) : ('Pending' as const),
      date: order.date,
      note: order.items.join(', '),
    }));
  const rows = [...livePaid, ...DEMO_PAYMENTS];
  const collected = rows.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const outstanding = rows.filter((p) => p.status === 'Pending' || p.status === 'Deposit').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Payments" subtitle="Money on the table" />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <GlassCard>
          <p className={FERGIE_LAYOUT.statLabel}>Collected</p>
          <p className={FERGIE_LAYOUT.statValue}>${collected.toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <p className={FERGIE_LAYOUT.statLabel}>Outstanding</p>
          <p className={FERGIE_LAYOUT.statValue}>${outstanding.toLocaleString()}</p>
        </GlassCard>
      </div>
      <div className="space-y-2">
        {rows.map((payment) => (
          <GlassCard key={payment.id} gold={payment.status === 'Pending'}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-fergie-gold">{payment.id}</p>
                <p className="font-medium">{payment.client}</p>
                <p className="text-xs text-white/50">
                  {payment.method} · {payment.date}
                </p>
                <p className="mt-1 text-xs text-white/40">{payment.note}</p>
              </div>
              <div className="text-right">
                <StatusPill
                  label={payment.status}
                  tone={payment.status === 'Paid' ? 'gold' : payment.status === 'Pending' ? 'rose' : 'purple'}
                />
                <p className="mt-2 font-serif text-xl text-fergie-gold">${payment.amount}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
