import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { isDemoMode } from '@/lib/demo';

interface CheckoutItem {
  product_id: number;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3011';

    if (isDemoMode() || !stripe) {
      return NextResponse.json({
        demo: true,
        url: `${appUrl}/order-confirmation?demo=true`,
      });
    }

    const lineItems = (items as CheckoutItem[]).map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.category ? `${item.category} — CC Craft & Create` : 'CC Craft & Create',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      customer_creation: 'if_required',
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
