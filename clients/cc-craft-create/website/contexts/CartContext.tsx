'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { productEmoji } from '@/lib/cart-utils';

const STORAGE_KEY = 'cc-cart';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItem(raw: Partial<CartItem> & { id?: number }): CartItem | null {
  const productId = raw.product_id ?? raw.id;
  const name = raw.name;
  const price = typeof raw.price === 'number' ? raw.price : Number(raw.price);

  if (!productId || !name || Number.isNaN(price)) return null;

  return {
    product_id: productId,
    name,
    price,
    quantity: raw.quantity && raw.quantity > 0 ? raw.quantity : 1,
    category: raw.category,
    emoji: raw.emoji ?? productEmoji(name, raw.category),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsReady(true);
        return;
      }

      const parsed = JSON.parse(stored) as Array<Partial<CartItem> & { id?: number }>;
      const normalized = parsed
        .map(normalizeItem)
        .filter((item): item is CartItem => item !== null);
      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.product_id === item.product_id);
      if (existing) {
        return current.map((entry) =>
          entry.product_id === item.product_id
            ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
            : entry
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: item.quantity ?? 1,
          emoji: item.emoji ?? productEmoji(item.name, item.category),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.product_id !== productId);
      }
      return current.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, itemCount, isReady, addItem, updateQuantity, removeItem, clearCart }),
    [items, itemCount, isReady, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
