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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage or create new cart
  useEffect(() => {
    const stored = localStorage.getItem('blakkhail-cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        setCartId(parsed.cartId || crypto.randomUUID());
      } catch (e) {
        localStorage.removeItem('blakkhail-cart');
        setCartId(crypto.randomUUID());
      }
    } else {
      setCartId(crypto.randomUUID());
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized && cartId) {
      localStorage.setItem('blakkhail-cart', JSON.stringify({ items, cartId }));
    }
  }, [items, cartId, isInitialized]);

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
