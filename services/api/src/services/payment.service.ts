/**
 * Payment Service
 * Handles Stripe integration, payment processing, and order management
 */

import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { logger } from '../logger';

export interface Product {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stripe_product_id?: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  stripe_payment_intent_id?: string;
  payment_method?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface CreatePaymentIntentData {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  metadata?: any;
}

class PaymentService {
  /**
   * Create a product
   */
  async createProduct(data: Partial<Product>): Promise<Product> {
    try {
      const product = await database.queryOne<Product>(
        `
        INSERT INTO products (id, category, name, description, price, image_url, stripe_product_id, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, category, name, description, price, image_url, stripe_product_id, is_active
        `,
        [
          uuidv4(),
          data.category,
          data.name,
          data.description || null,
          data.price,
          data.image_url || null,
          data.stripe_product_id || null,
          true,
        ]
      );

      if (!product) {
        throw new Error('Failed to create product');
      }

      logger.info('Product created', { productId: product.id });

      return product;
    } catch (error) {
      logger.error('Failed to create product', { error });
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product | undefined> {
    try {
      return database.queryOne<Product>(
        'SELECT id, category, name, description, price, image_url, stripe_product_id, is_active FROM products WHERE id = $1',
        [productId]
      );
    } catch (error) {
      logger.error('Failed to get product', { error });
      throw error;
    }
  }

  /**
   * List products by category
   */
  async listProducts(category?: string, limit: number = 50): Promise<Product[]> {
    try {
      let query = 'SELECT id, category, name, description, price, image_url, stripe_product_id, is_active FROM products WHERE is_active = TRUE';
      const params: any[] = [];

      if (category) {
        query += ' AND category = $' + (params.length + 1);
        params.push(category);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await database.query<Product>(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to list products', { error });
      throw error;
    }
  }

  /**
   * Create an order (local database only - Stripe integration handled separately)
   */
  async createOrder(
    userId: string,
    items: Array<{ productId: string; quantity: number }>,
    metadata?: any
  ): Promise<{ order: Order; orderItems: OrderItem[] }> {
    try {
      // Validate items and calculate total
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = await this.getProduct(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (!product.is_active) {
          throw new Error(`Product is not available: ${item.productId}`);
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          id: uuidv4(),
          order_id: '', // Will be set after order is created
          product_id: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create order
      const orderId = uuidv4();
      const order = await database.queryOne<Order>(
        `
        INSERT INTO orders (id, user_id, total_amount, status, currency)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        `,
        [orderId, userId, totalAmount, 'pending', 'USD']
      );

      if (!order) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const createdItems: OrderItem[] = [];
      for (const item of orderItems) {
        const createdItem = await database.queryOne<OrderItem>(
          `
          INSERT INTO order_items (id, order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, order_id, product_id, quantity, price
          `,
          [item.id, orderId, item.product_id, item.quantity, item.price]
        );

        if (createdItem) {
          createdItems.push(createdItem);
        }
      }

      logger.info('Order created', { orderId, userId, totalAmount });

      return { order, orderItems: createdItems };
    } catch (error) {
      logger.error('Failed to create order', { error });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | undefined> {
    try {
      return database.queryOne<Order>(
        `
        SELECT id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        FROM orders
        WHERE id = $1
        `,
        [orderId]
      );
    } catch (error) {
      logger.error('Failed to get order', { error });
      throw error;
    }
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const result = await database.query<OrderItem>(
        'SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = $1',
        [orderId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get order items', { error });
      throw error;
    }
  }

  /**
   * List user orders
   */
  async listUserOrders(userId: string, limit: number = 20): Promise<Order[]> {
    try {
      const result = await database.query<Order>(
        `
        SELECT id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to list user orders', { error });
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string, metadata?: any): Promise<Order> {
    try {
      const order = await database.queryOne<Order>(
        `
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        `,
        [status, orderId]
      );

      if (!order) {
        throw new Error('Order not found');
      }

      logger.info('Order status updated', { orderId, status });

      return order;
    } catch (error) {
      logger.error('Failed to update order status', { error });
      throw error;
    }
  }

  /**
   * Confirm payment and complete order
   */
  async confirmPayment(
    orderId: string,
    stripePaymentIntentId: string
  ): Promise<Order> {
    try {
      // Update order with payment intent ID
      const order = await database.queryOne<Order>(
        `
        UPDATE orders
        SET status = 'completed', stripe_payment_intent_id = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        `,
        [stripePaymentIntentId, orderId]
      );

      if (!order) {
        throw new Error('Order not found');
      }

      logger.info('Payment confirmed', { orderId, stripePaymentIntentId });

      return order;
    } catch (error) {
      logger.error('Failed to confirm payment', { error });
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await database.queryOne<Order>(
        `
        UPDATE orders
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, total_amount, status, stripe_payment_intent_id, payment_method, currency, created_at, updated_at
        `,
        [orderId]
      );

      if (!order) {
        throw new Error('Order not found');
      }

      logger.info('Order cancelled', { orderId, reason });

      return order;
    } catch (error) {
      logger.error('Failed to cancel order', { error });
      throw error;
    }
  }

  /**
   * Get user by Stripe customer ID
   */
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<any> {
    try {
      return database.queryOne(
        'SELECT id, email FROM users WHERE stripe_customer_id = $1',
        [stripeCustomerId]
      );
    } catch (error) {
      logger.error('Failed to get user by Stripe customer ID', { error });
      throw error;
    }
  }

  /**
   * Update user Stripe customer ID
   */
  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    try {
      await database.query(
        'UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2',
        [stripeCustomerId, userId]
      );

      logger.info('User Stripe customer ID updated', { userId });
    } catch (error) {
      logger.error('Failed to update user Stripe customer ID', { error });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
