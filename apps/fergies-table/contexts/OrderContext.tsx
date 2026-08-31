'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_LEADS, DEMO_ORDERS, type DemoLead, type DemoOrder, type LeadStatus, type MenuItem, type OrderStatus } from '@/lib/demo-data';

export type CartLine = {
  item: MenuItem;
  qty: number;
};

export type Booking = {
  id: string;
  eventType: string;
  guests: number;
  date: string;
  time: string;
  service: string;
  notes: string;
};

type OrderContextValue = {
  cart: CartLine[];
  orders: DemoOrder[];
  bookings: Booking[];
  leads: DemoLead[];
  soldOut: string[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  checkout: (title?: string) => DemoOrder | null;
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setLeadStatus: (id: string, status: LeadStatus) => void;
  toggleSoldOut: (id: string) => void;
  kitchenQueue: DemoOrder[];
};

const OrderContext = createContext<OrderContextValue | null>(null);

const STORAGE_KEY = 'fergies-table-state-v1';

type Persisted = {
  cart: CartLine[];
  orders: DemoOrder[];
  bookings: Booking[];
  leads: DemoLead[];
  soldOut: string[];
};

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>(DEMO_ORDERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.orders?.length) setOrders(parsed.orders);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.leads?.length) setLeads(parsed.leads);
        if (parsed.soldOut) setSoldOut(parsed.soldOut);
      }
    } catch {
      /* demo storage is optional */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, orders, bookings, leads, soldOut }));
  }, [cart, orders, bookings, leads, soldOut, hydrated]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.item.id === item.id);
      if (existing) {
        return prev.map((line) =>
          line.item.id === item.id ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((line) => line.item.id !== id));

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((line) => (line.item.id === id ? { ...line, qty } : line)));
  };

  const clearCart = () => setCart([]);

  const checkout = (title = 'Custom order') => {
    if (!cart.length) return null;
    const order: DemoOrder = {
      id: `FT-${2042 + orders.length}`,
      title,
      date: new Date().toISOString().slice(0, 10),
      total: cart.reduce((sum, line) => sum + line.item.price * line.qty, 0),
      status: 'Confirmed',
      items: cart.map((line) => `${line.item.name}${line.qty > 1 ? ` x${line.qty}` : ''}`),
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  };

  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const next: Booking = { ...booking, id: `B-${Date.now()}` };
    setBookings((prev) => [next, ...prev]);
    return next;
  };

  const setOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const setLeadStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  };

  const toggleSoldOut = (id: string) => {
    setSoldOut((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const kitchenQueue = orders.filter(
    (order) => order.status !== 'Completed' && order.status !== 'Cancelled',
  );

  const value = useMemo(
    () => ({
      cart,
      orders,
      bookings,
      leads,
      soldOut,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      cartCount: cart.reduce((sum, line) => sum + line.qty, 0),
      cartTotal: cart.reduce((sum, line) => sum + line.item.price * line.qty, 0),
      checkout,
      addBooking,
      setOrderStatus,
      setLeadStatus,
      toggleSoldOut,
      kitchenQueue,
    }),
    [cart, orders, bookings, leads, soldOut],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
