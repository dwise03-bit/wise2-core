import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/lib/sencere-cart';
import { getRequestSiteUrl } from '@/lib/site-url';
import { isBlackhailHost, normalizeHost } from '@/lib/site-domains';
import { getBlakkhailProducts } from '@/lib/sencere-products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 });
    }
    const { items, email, total } = await request.json() as {
      items: CartItem[];
      email: string;
      total: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const catalog = new Map(getBlakkhailProducts().map((product) => [product.id, product]));
    const validatedItems = items.map((item) => {
      const product = catalog.get(item.productId);
      const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
      if (!product || !variant || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        throw new Error('Invalid product or quantity');
      }
      return { ...item, productName: product.name, variantName: variant.name, price: variant.price };
    });

    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          description: `${item.variantName}${
            Object.keys(item.options).length > 0
              ? ` - ${Object.entries(item.options)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}`
              : ''
          }`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const siteUrl = getRequestSiteUrl();
    const host = normalizeHost(request.headers.get('host'));
    const orderPath = isBlackhailHost(host) ? '/order-confirmation' : '/sencere/order-confirmation';
    const cancelPath = isBlackhailHost(host) ? '/checkout' : '/sencere/checkout';

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}${orderPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${cancelPath}`,
      metadata: {
        cart_items: JSON.stringify(validatedItems),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
