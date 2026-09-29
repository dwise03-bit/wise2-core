'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  ChefHat,
  ClipboardList,
  Crown,
  Home,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useOrders } from '@/contexts/OrderContext';
import { useOwner } from '@/contexts/OwnerContext';

const GUEST_NAV = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/menu', label: 'Menu', Icon: UtensilsCrossed },
  { href: '/orders', label: 'Orders', Icon: ClipboardList },
  { href: '/rewards', label: 'Rewards', Icon: Crown },
  { href: '/profile', label: 'Profile', Icon: User },
];

const OWNER_NAV = [
  { href: '/business', label: 'Command', Icon: LayoutDashboard },
  { href: '/kitchen', label: 'Kitchen', Icon: ChefHat },
  { href: '/calendar', label: 'Booked', Icon: CalendarDays },
  { href: '/leads', label: 'Leads', Icon: Users },
  { href: '/more', label: 'More', Icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();
  const { cartCount, kitchenQueue, leads } = useOrders();
  const { isOwner } = useOwner();

  if (pathname === '/') return null;

  const items = isOwner ? OWNER_NAV : GUEST_NAV;
  const newLeads = leads.filter((lead) => lead.status === 'New').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-fergie-gold/15 bg-fergie-charcoal/92 backdrop-blur-xl pb-[var(--safe-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge =
            item.href === '/orders' && !isOwner && cartCount > 0
              ? cartCount
              : item.href === '/kitchen' && kitchenQueue.length > 0
                ? kitchenQueue.length
                : item.href === '/leads' && newLeads > 0
                  ? newLeads
                  : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition ${
                active ? 'text-fergie-gold' : 'text-white/45 hover:text-white/80'
              }`}
            >
              <item.Icon className={`h-5 w-5 ${active ? 'text-fergie-gold' : ''}`} />
              {item.label}
              {badge > 0 && (
                <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-fergie-royal px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {!isOwner && cartCount > 0 && (
        <Link
          href="/cart"
          className="absolute -top-12 right-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold px-4 py-2 text-xs font-semibold text-white shadow-glow-gold"
        >
          <ShoppingBag className="h-4 w-4" />
          Cart · {cartCount}
        </Link>
      )}
    </nav>
  );
}
