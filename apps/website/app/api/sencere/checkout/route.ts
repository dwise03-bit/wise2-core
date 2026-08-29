import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/lib/sencere-cart';
import { getRequestSiteUrl } from '@/lib/site-url';
import { isBlackhailHost, normalizeHost } from '@/lib/site-domains';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { items, email, total } = await request.json() as {
      items: CartItem[];
      email: string;
      total: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lineItems = items.map((item) => ({
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
        cart_items: JSON.stringify(items),
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
