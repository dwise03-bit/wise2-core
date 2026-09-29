export interface Product {
  id: number;
  name: string;
  category: string;
  occasion: string;
  description: string;
  price: string | number;
  image_url: string | null;
  in_stock: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  order_count: number;
  total_spent: string | number;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string | number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items?: OrderItem[];
  items_json?: string;
  notes?: string;
  subtotal: string | number;
  shipping: string | number;
  tax: string | number;
  total: string | number;
  stripe_payment_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  emoji?: string;
}

export interface OrderRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CartItem[];
  notes?: string;
  stripe_payment_id?: string;
}
