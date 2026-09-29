'use client';

import { LIZZY_LAYOUT } from '@/lib/brand-tokens';
import { useCart } from '@/contexts/CartContext';

export function AddButton({ id, label }: { id: string; label: string }) {
  const { add } = useCart();
  return (
    <button type="button" onClick={() => add(id)} className={LIZZY_LAYOUT.btnPrimary}>
      {label}
    </button>
  );
}
