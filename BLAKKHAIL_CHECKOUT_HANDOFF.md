# BLAKKHAIL Checkout System - Handoff to Darrin

## Status Overview

✅ **COMPLETE:**
- Storefront product display and API integration
- Cart persistence with localStorage (`blakkhail-cart`)
- Add-to-cart functionality with confirmation
- Checkout form with customer information collection
- Order creation API endpoints (backend + frontend proxy)
- Database schema (orders, order_items, products)

🚀 **TODO - NEXT STEPS FOR DARRIN:**
1. Integrate Stripe payment processing
2. Test end-to-end checkout flow
3. Implement order confirmation emails
4. Add order tracking/fulfillment dashboard

---

## System Architecture

### Frontend Components
- **Storefront**: `/apps/website/components/sencere/blakkhail/BlakkhailStorefront.tsx`
  - Displays product grid from database
  - Uses `useCart` hook to manage cart state
  - Product images, titles, prices from PostgreSQL

- **Checkout Form**: `/apps/website/components/sencere/blakkhail/BlakkhailCheckout.tsx`
  - Collects customer shipping information
  - Displays order summary with totals
  - Submits order to backend API
  - **TODO**: Add Stripe payment element

- **Cart Hook**: `/apps/website/lib/hooks/useCart.ts`
  - Manages cart state with localStorage persistence
  - Key: `blakkhail-cart`
  - Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`

### Backend APIs
- **Admin Backend**: `services/admin-backend/server.js` (Express.js)
  - Port: 3014
  - `/api/storefront/latest-products?limit=3` - Get latest products
  - `/api/orders/create` - Create order from cart items
  - Database: PostgreSQL (wise2_prod)

- **Website API Proxy**: `/apps/website/app/api/storefront/create-order/route.ts`
  - Proxies to admin backend
  - Accepts cart items, customer info, total price
  - Returns orderId on success

### Database Schema
```sql
-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255),
  total_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Cart Flow Walkthrough

### 1. Add to Cart (Storefront)
```tsx
// User clicks "Add to Cart" button
const handleAddToCart = (product) => {
  const { addToCart } = useCart();
  addToCart(product, 1);
  // Button shows "✓ Added!" for 2 seconds
};
```

**Data saved to localStorage**:
```json
{
  "blakkhail-cart": {
    "items": [
      {
        "id": "1",
        "name": "Red Skull Jacket",
        "price": 89.99,
        "quantity": 1,
        "image_url": "https://..."
      }
    ],
    "cartId": "uuid-here"
  }
}
```

### 2. Navigate to Checkout
```
User clicks CART button (top right) → /checkout page loads
```

**useCart Hook Initializes**:
1. Reads localStorage key `blakkhail-cart`
2. Parses items array
3. Generates cartId if missing
4. Returns `{ items, cartId, total, count, ... }`

### 3. Fill Customer Form
User enters:
- Email *
- First Name *
- Last Name *
- Address *
- City *
- State *
- ZIP Code *
- Phone *

### 4. Submit Order (Current Flow)
```tsx
const handleCheckout = async (e) => {
  // Validate form
  // Calculate totals
  const response = await fetch('/api/storefront/create-order', {
    method: 'POST',
    body: JSON.stringify({
      items,
      customerEmail: email,
      totalPrice: total,
      customer: formData
    })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.removeItem('blakkhail-cart'); // Clear cart
    window.location.href = `/checkout/success?orderId=${data.orderId}`;
  }
};
```

---

## STRIPE INTEGRATION STEPS

### Step 1: Setup Stripe Keys

**Add to `.env.local`** (NOT to git):
```
NEXT_PUBLIC_STRIPE_KEY=pk_test_YOUR_TEST_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

Get keys from: https://dashboard.stripe.com/apikeys

### Step 2: Install Stripe Libraries
```bash
cd /home/dwise/wise2-core
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

### Step 3: Update BlakkhailCheckout Component

Replace the `handleCheckout` function in `/apps/website/components/sencere/blakkhail/BlakkhailCheckout.tsx`:

```tsx
// Add these imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const handleCheckout = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validate form
  if (!email || !formData.firstName || !formData.lastName) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  try {
    const { subtotal, tax, total } = calculateTotals();
    
    // 1. Create payment intent on backend
    const intentResponse = await fetch('/api/storefront/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Stripe uses cents
        email,
        customer: formData,
      }),
    });

    const { clientSecret } = await intentResponse.json();

    // 2. Confirm payment with Stripe
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    const { paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email,
        },
      },
    });

    // 3. If payment succeeded, create order
    if (paymentIntent?.status === 'succeeded') {
      const orderResponse = await fetch('/api/storefront/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: email,
          totalPrice: total,
          customer: formData,
          stripePaymentIntentId: paymentIntent.id,
        }),
      });

      const orderData = await orderResponse.json();
      if (orderData.success) {
        localStorage.removeItem('blakkhail-cart');
        window.location.href = `/checkout/success?orderId=${orderData.orderId}`;
      }
    } else {
      setError('Payment failed. Please try again.');
    }
  } catch (err) {
    setError('Payment processing failed. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Create Payment Intent Backend Route

Create `/apps/website/app/api/storefront/create-payment-intent/route.ts`:

```tsx
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { amount, email, customer } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Already in cents
      currency: 'usd',
      receipt_email: email,
      metadata: {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_address: customer.address,
        customer_city: customer.city,
        customer_state: customer.state,
        customer_zip: customer.zip,
        customer_phone: customer.phone,
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return Response.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
```

### Step 5: Update Admin Backend Order Creation

Update `/services/admin-backend/server.js` to accept Stripe payment intent ID:

```javascript
app.post('/api/orders/create', express.json(), async (req, res) => {
  try {
    const { items, customerEmail, totalPrice, stripePaymentIntentId } = req.body;
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderResult = await pool.query(
      'INSERT INTO orders (customer_email, total_price, status, stripe_payment_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [customerEmail || 'guest@blakkhail.com', totalPrice, 'paid', stripePaymentIntentId || null]
    );

    const orderId = orderResult.rows[0].id;
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.json({ success: true, orderId, status: 'paid' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

### Step 6: Test Stripe Integration

**Test Card Numbers** (https://stripe.com/docs/testing):
- **Visa**: 4242 4242 4242 4242
- **Visa (decline)**: 4000 0000 0000 0002
- **MasterCard**: 5555 5555 5555 4444

Expiry: Any future date
CVC: Any 3 digits

---

## Testing Checklist

### Local Testing (localhost:3000)
- [ ] Add product to cart on storefront
- [ ] Verify localStorage `blakkhail-cart` key contains items
- [ ] Navigate to checkout
- [ ] Fill customer form
- [ ] See Stripe card element render (after Step 3)
- [ ] Submit with test Visa card (4242...)
- [ ] Verify order created in database
- [ ] See success page with orderId

### Production Testing (https://blakkhail.com)
- [ ] Rebuild and deploy: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Test full flow on live site
- [ ] Verify orders appear in database via SSH

---

## Database Access

```bash
ssh dwise@173.208.147.165

# Connect to PostgreSQL (via Docker)
docker exec wise2-postgres psql -U wise2 -d wise2_prod -c "SELECT * FROM orders LIMIT 5;"

# View latest products
docker exec wise2-postgres psql -U wise2 -d wise2_prod -c "SELECT id, name, price FROM products;"

# View all orders
docker exec wise2-postgres psql -U wise2 -d wise2_prod -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;"
```

---

## Deployment

### Build and Test Locally
```bash
cd /Users/danielwise/Projects/wise2-core
pnpm install
pnpm run build
pnpm run dev
```

### Deploy to Production
```bash
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Verify Deployment
```bash
# Website should be live
curl https://blakkhail.com/sencere/blakkhail

# Admin backend should respond
curl http://localhost:3014/health

# Orders API should work
curl -X GET http://localhost:3014/api/storefront/latest-products
```

---

## Key Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `BlakkhailStorefront.tsx` | Product display | ✅ Complete |
| `BlakkhailCheckout.tsx` | Checkout form | ✅ Form complete, needs Stripe payment |
| `useCart.ts` | Cart state management | ✅ Complete |
| `services/admin-backend/server.js` | Order API | ✅ Complete (add Stripe ID field) |
| `/api/storefront/create-order/route.ts` | Frontend order proxy | ✅ Complete |
| `/api/storefront/create-payment-intent/route.ts` | **TODO** - Stripe integration |
| `.env.local` | **TODO** - Add Stripe keys |

---

## Questions for Darrin

1. Do you have a Stripe account already, or should I create one?
2. Should we implement email confirmations after order? (SendGrid already available)
3. Should there be an admin dashboard to view/manage orders?
4. What fulfillment process - manual email notifications or automated?

---

## Next Session Priorities

1. ✅ Get Stripe test keys
2. ✅ Install Stripe libraries
3. ✅ Update checkout component with payment element
4. ✅ Create payment intent endpoint
5. ✅ Test full flow with test card
6. ✅ Deploy to production
7. ✅ Add order confirmation email (optional)
8. ✅ Create order dashboard (optional)

---

**Handoff Date**: September 11, 2026  
**System Status**: Ready for Stripe integration  
**Live URL**: https://blakkhail.com/sencere/blakkhail  
**Backend API**: http://173.208.147.165:3014  
**Database**: PostgreSQL (wise2_prod)
