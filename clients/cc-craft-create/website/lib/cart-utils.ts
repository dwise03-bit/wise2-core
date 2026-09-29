import type { CartItem } from './types';

export const SHIPPING_FLAT = 5;
export const TAX_RATE = 0.08;

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartShipping(items: CartItem[]): number {
  return items.length > 0 ? SHIPPING_FLAT : 0;
}

export function getCartTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

export function getCartTotal(items: CartItem[]): number {
  const subtotal = getCartSubtotal(items);
  return subtotal + getCartShipping(items) + getCartTax(subtotal);
}

export function productEmoji(name: string, category?: string): string {
  const key = `${name} ${category ?? ''}`.toLowerCase();
  if (key.includes('drink') || key.includes('label') && key.includes('water')) return '💧';
  if (key.includes('drink')) return '🥤';
  if (key.includes('chip') || key.includes('candy') || key.includes('wrapper')) return '🍿';
  if (key.includes('party') || key.includes('package')) return '🎁';
  if (key.includes('memorial') || key.includes('bookmark') || key.includes('keepsake')) return '🕊️';
  if (key.includes('graduation') || key.includes('certificate')) return '🎓';
  if (key.includes('holiday') || key.includes('tag')) return '🎄';
  if (key.includes('shower') || key.includes('invitation')) return '👶';
  if (key.includes('nurse')) return '💜';
  if (key.includes('teacher') || key.includes('school')) return '🍎';
  if (key.includes('church') || key.includes('community')) return '⛪';
  if (key.includes('business') || key.includes('brand')) return '✨';
  return '🎀';
}
