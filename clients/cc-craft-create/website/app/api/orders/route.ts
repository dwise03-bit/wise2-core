import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { createDemoOrder } from '@/lib/demo-data';
import { useDemoData } from '@/lib/demo';
import { Order, OrderRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OrderRequest;
  const { customer: customerData, items, notes } = body;

  if (!customerData || !items || items.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (useDemoData()) {
    const order = createDemoOrder(items);
    return NextResponse.json({
      success: true,
      data: {
        ...order,
        customer_name: customerData.name,
        customer_email: customerData.email,
        notes: notes ?? null,
      },
      message: 'Demo order created successfully',
      demo: true,
    });
  }

  const client = await getClient();
  try {
    const { stripe_payment_id } = body;

    await client.query('BEGIN');

    let customerId: number;
    const customerResult = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [customerData.email]
    );

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
    } else {
      const insertCustomerResult = await client.query(
        `INSERT INTO customers (name, email, phone, address, city, state, zip)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          customerData.name,
          customerData.email,
          customerData.phone || null,
          customerData.address || null,
          customerData.city || null,
          customerData.state || null,
          customerData.zip || null,
        ]
      );
      customerId = insertCustomerResult.rows[0].id;
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const orderNumber = `CC-${Date.now()}`;
    const itemsJson = JSON.stringify(items);

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, status, items_json, notes, subtotal, shipping, tax, total, stripe_payment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        orderNumber,
        customerId,
        'pending',
        itemsJson,
        notes || null,
        subtotal,
        shipping,
        tax,
        total,
        stripe_payment_id || null,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        customer_id: customerId,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
      },
      message: 'Order created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'Customer ID required' },
      { status: 400 }
    );
  }

  if (useDemoData()) {
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      demo: true,
    });
  }

  try {
    const result = await query<Order>(
      `SELECT o.*, json_agg(json_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', p.name
      )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [parseInt(customerId)]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
