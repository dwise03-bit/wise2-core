// dashboard/lib/stripe-handler.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class StripeHandler {
  async createCheckoutSession(items, customerEmail) {
    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.STORE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STORE_URL || 'http://localhost:3000'}/checkout/cancel`,
      customer_email: customerEmail,
      metadata: { items: JSON.stringify(items) },
    });

    return session;
  }

  async retrieveSession(sessionId) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  }
}

module.exports = new StripeHandler();
