# PaymentForm Component Guide

## Overview

The `PaymentForm` component provides a premium, fully-integrated Stripe payment interface for WISE² consulting booking confirmations. It handles payment processing, validation, error handling, and booking confirmation with a polished dark-mode UI matching the WISE² design system.

## Features

- ✅ Stripe Elements Card integration
- ✅ PaymentIntent flow with client-side confirmation
- ✅ Booking summary display (consultant, service, date/time, duration, price)
- ✅ Real-time validation and error handling
- ✅ Loading states with animated spinner
- ✅ Success confirmation screen
- ✅ Framer Motion animations throughout
- ✅ Responsive design (mobile & desktop)
- ✅ TypeScript support
- ✅ Accessible form inputs
- ✅ Security notices and information

## Installation

### 1. Install Stripe Dependencies

```bash
# In apps/website directory
npm install @stripe/react-stripe-js @stripe/js stripe
# or
yarn add @stripe/react-stripe-js @stripe/js stripe
# or
pnpm add @stripe/react-stripe-js @stripe/js stripe
```

### 2. Environment Variables

Add the following to your `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # or pk_live_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx                   # or sk_live_xxxxx (server-only)
NEXT_PUBLIC_API_URL=http://localhost:3001         # Backend API URL
```

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Go to Developers > API Keys
3. Copy your publishable key (starts with `pk_`) and secret key (starts with `sk_`)
4. Add them to environment variables above

## Usage

### Basic Example

```tsx
'use client';

import { PaymentForm } from '@/components/consulting/PaymentForm';
import { useRouter } from 'next/navigation';

export default function BookingPaymentPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Complete Payment</h1>

        <PaymentForm
          bookingId={params.bookingId}
          amount={299.99}
          consultantName="Jane Doe"
          serviceName="Strategy Consultation"
          date="August 15, 2024"
          time="2:00 PM EDT"
          duration={60}
          onSuccess={() => {
            router.push(`/booking/${params.bookingId}/success`);
          }}
          onError={(error) => {
            console.error('Payment error:', error);
            // Error is displayed in the form
          }}
        />
      </div>
    </div>
  );
}
```

### With Modal

```tsx
import { useState } from 'react';
import { PaymentForm } from '@/components/consulting/PaymentForm';

export function BookingModal({ isOpen, booking, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Confirm Payment</h2>

        <PaymentForm
          bookingId={booking.id}
          amount={booking.totalPrice}
          consultantName={booking.consultantName}
          serviceName={booking.serviceName}
          date={booking.date}
          time={booking.time}
          duration={booking.duration}
          onSuccess={() => {
            onClose();
            // Refresh booking data
          }}
          onError={(error) => {
            console.error(error);
          }}
        />
      </div>
    </div>
  );
}
```

## Component Props

```typescript
interface PaymentFormProps {
  // Required
  bookingId: string;              // Unique booking identifier
  amount: number;                 // Amount in dollars (e.g., 299.99)
  consultantName: string;         // Name of consultant

  // Optional - for booking summary display
  serviceName?: string;           // Name of service (e.g., "Strategy Consultation")
  date?: string;                  // Booking date (any format, e.g., "August 15, 2024")
  time?: string;                  // Booking time (e.g., "2:00 PM EDT")
  duration?: number;              // Duration in minutes (e.g., 60)

  // Callbacks
  onSuccess: () => void;          // Called after successful payment
  onError: (error: string) => void; // Called on payment error

  // Optional
  disabled?: boolean;             // Disable form interaction
}
```

## API Endpoints

The component requires two API endpoints:

### 1. Create Payment Intent

**Endpoint:** `POST /api/consulting/bookings/payment-intent`

**Request:**
```json
{
  "bookingId": "booking-123",
  "amount": 29999,        // in cents
  "paymentMethodId": "pm_xxxxx",
  "cardholderName": "John Doe"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "paymentIntentId": "pi_xxxxx"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request or amount out of range
- `401` - Authentication error
- `500` - Server error

### 2. Confirm Booking

**Endpoint:** `POST /api/consulting/bookings/{bookingId}/confirm`

**Request:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "amount": 299.99        // in dollars
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "booking-123",
  "paymentStatus": "confirmed",
  "confirmationDetails": {
    "consultantName": "Jane Doe",
    "serviceName": "Strategy Consultation",
    "date": "2024-08-15",
    "time": "14:00",
    "meetingLink": "https://meet.wise2.net/booking-123"
  },
  "message": "Booking confirmed!..."
}
```

**Status Codes:**
- `200` - Success (payment confirmed, booking confirmed or pending)
- `400` - Payment verification failed
- `404` - Payment intent not found
- `500` - Server error

## Payment Flow

```
1. User enters cardholder name
2. User enters card details (Stripe CardElement)
3. Click "Pay $X.XX" button
4. Component creates PaymentMethod from CardElement
5. POST to /api/consulting/bookings/payment-intent
   → Returns client secret
6. Component confirms card payment with Stripe
7. On success → POST to /api/consulting/bookings/{bookingId}/confirm
   → Returns confirmation details
8. Show success screen with confirmation details
9. Call onSuccess() callback
```

## Error Handling

The component handles the following error scenarios:

| Error | Display | Recovery |
|-------|---------|----------|
| Stripe not initialized | Error message | Refresh page |
| Empty cardholder name | Validation message | User re-enters name |
| Invalid card number | Stripe CardElement error | User re-enters card |
| Expired card | Stripe error | User enters new card |
| Insufficient funds | Stripe error | User contacts bank or tries different card |
| Network error | Error message | Retry button (manual) |
| Payment intent failed | Error message | Retry with same or different card |
| Booking confirmation failed | Success (payment only) | User receives email with next steps |

## Styling & Customization

### Theme

The component uses WISE² brand colors:
- **Primary:** Blue (from-wise-primary to-blue-600)
- **Success:** Green
- **Error:** Red
- **Backgrounds:** Slate 800/900 gradient

### Customization Example

To customize colors, modify the className values:

```tsx
// In PaymentForm.tsx, update specific elements:
className="bg-gradient-to-br from-your-color-1 to-your-color-2 ..."
```

### Dark/Light Mode

The component is optimized for dark mode. To support light mode, add Tailwind's dark mode support and adjust classes:

```tsx
className="dark:bg-slate-800 dark:text-white bg-white text-gray-900"
```

## Testing

### Manual Testing

1. Use Stripe test cards: https://stripe.com/docs/testing

**Successful payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

**Declined payment:**
```
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### Unit Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentForm } from './PaymentForm';

describe('PaymentForm', () => {
  it('displays booking summary', () => {
    render(
      <PaymentForm
        bookingId="test-123"
        amount={299.99}
        consultantName="Test Consultant"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    expect(screen.getByText('Test Consultant')).toBeInTheDocument();
    expect(screen.getByText(/\$299.99/)).toBeInTheDocument();
  });

  it('handles payment success', async () => {
    const onSuccess = jest.fn();
    render(
      <PaymentForm
        bookingId="test-123"
        amount={299.99}
        consultantName="Test Consultant"
        onSuccess={onSuccess}
        onError={jest.fn()}
      />
    );

    // Fill form and submit...
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays error on payment failure', async () => {
    const onError = jest.fn();
    render(
      <PaymentForm
        bookingId="test-123"
        amount={299.99}
        consultantName="Test Consultant"
        onSuccess={jest.fn()}
        onError={onError}
      />
    );

    // Trigger error...
    await waitFor(() => {
      expect(screen.getByText(/Payment Failed/)).toBeInTheDocument();
    });
  });
});
```

## Security Considerations

1. **Server-Side Validation:** Always validate payment amounts on the backend
2. **PCI Compliance:** Stripe handles PCI compliance via Elements
3. **HTTPS Only:** Always use HTTPS in production
4. **API Keys:** Secret key only used server-side
5. **CORS:** Configure CORS properly for API calls
6. **Rate Limiting:** Implement rate limiting on payment endpoints
7. **Webhook Verification:** Verify Stripe webhooks with signature validation

## Troubleshooting

### Issue: "Stripe publishable key not configured"

**Solution:** Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`

### Issue: Payment button is disabled

**Solution:** 
1. Check that Stripe has loaded (wait a moment)
2. Ensure CardElement has been rendered
3. Check browser console for errors

### Issue: "Payment method creation failed"

**Solution:**
1. Verify card details are correct
2. Check that CardElement is properly mounted
3. Try a different test card

### Issue: "Payment intent not found"

**Solution:**
1. Verify bookingId matches
2. Check that /api/consulting/bookings/payment-intent returned correctly
3. Check network tab for failed requests

### Issue: API endpoint returns 404

**Solution:**
1. Verify API endpoint path is correct
2. Check that route files exist
3. Verify NEXT_PUBLIC_API_URL is set correctly

## Performance

- Component lazy-loads Stripe.js on first render
- Memoizes Stripe instance to prevent reinitialization
- Uses Framer Motion for 60fps animations
- Optimized re-renders with React.memo where applicable

## Browser Support

- Chrome/Edge: ✅ (latest)
- Firefox: ✅ (latest)
- Safari: ✅ (latest)
- Mobile browsers: ✅ (iOS Safari, Chrome Mobile)

## Related Components

- `AvailabilityCalendar` - For date/time selection
- `ServiceCard` - For service browsing
- `Button` - Underlying button component

## Next Steps

1. Install dependencies: `npm install @stripe/react-stripe-js @stripe/js stripe`
2. Add environment variables
3. Create payment intent endpoint
4. Create booking confirmation endpoint
5. Integrate component into booking flow
6. Test with Stripe test cards
7. Deploy to production
