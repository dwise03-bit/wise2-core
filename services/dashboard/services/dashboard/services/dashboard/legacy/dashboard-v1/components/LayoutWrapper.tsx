'use client';

import { CartProvider } from '@/app/context/CartContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
