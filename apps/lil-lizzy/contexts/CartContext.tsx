'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PRODUCTS, type Product } from '@/lib/catalog';

export type CartLine = {
  product: Product;
  qty: number;
};

type CartContextValue = {
  cart: CartLine[];
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  cartCount: number;
  cartTotal: number;
  notice: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'lil-lizzy-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { id: string; qty: number }[];
        setCart(
          parsed
            .map((line) => {
              const product = PRODUCTS.find((item) => item.id === line.id);
              return product ? { product, qty: line.qty } : null;
            })
            .filter((line): line is CartLine => Boolean(line)),
        );
      }
    } catch {
      /* demo storage is optional */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart.map((line) => ({ id: line.product.id, qty: line.qty }))),
    );
  }, [cart, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add = (id: string) => {
      const product = PRODUCTS.find((item) => item.id === id);
      if (!product) return;
      setCart((prev) => {
        const existing = prev.find((line) => line.product.id === id);
        if (existing) {
          return prev.map((line) => (line.product.id === id ? { ...line, qty: line.qty + 1 } : line));
        }
        return [...prev, { product, qty: 1 }];
      });
      setNotice(`${product.name} added to bag`);
      window.setTimeout(() => setNotice(null), 1800);
    };

    return {
      cart,
      add,
      remove: (id) => setCart((prev) => prev.filter((line) => line.product.id !== id)),
      setQty: (id, qty) =>
        setCart((prev) =>
          qty <= 0 ? prev.filter((line) => line.product.id !== id) : prev.map((line) => (line.product.id === id ? { ...line, qty } : line)),
        ),
      clear: () => setCart([]),
      cartCount: cart.reduce((sum, line) => sum + line.qty, 0),
      cartTotal: cart.reduce((sum, line) => sum + line.product.price * line.qty, 0),
      notice,
    };
  }, [cart, notice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
