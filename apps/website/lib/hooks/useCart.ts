import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>('');

  // Initialize cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('blakkhail-cart');
    if (stored) {
      try {
        const { items: storedItems, cartId: storedCartId } = JSON.parse(stored);
        setItems(storedItems || []);
        setCartId(storedCartId || '');
      } catch (e) {
        localStorage.removeItem('blakkhail-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartId) {
      localStorage.setItem('blakkhail-cart', JSON.stringify({ items, cartId }));
    }
  }, [items, cartId]);

  const addToCart = (product: any, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    cartId,
    total,
    count,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: () => setItems([]),
  };
}
