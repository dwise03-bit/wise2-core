// SenCere Cart and Checkout Management

export interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  price: number;
  options: {
    [key: string]: string;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: Date;
}

export interface CheckoutSession {
  sessionId: string;
  status: 'pending' | 'completed' | 'failed';
  items: CartItem[];
  total: number;
  customerEmail?: string;
  createdAt: Date;
}

export function calculateCartTotals(items: CartItem[]): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax (adjustable per state)
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
}

export function getPriceInCents(price: number): number {
  return Math.round(price * 100);
}

export function formatCartItem(item: CartItem): string {
  const options = Object.entries(item.options)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  return `${item.productName} - ${item.variantName}${options ? ` (${options})` : ''} x${item.quantity}`;
}
