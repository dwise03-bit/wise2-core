# Booking System - Quick Start Guide

## Getting Started

### 1. Verify Installation

The booking page is already installed in:
- **Booking page**: `/apps/website/app/consulting/[serviceId]/booking/page.tsx`
- **Success page**: `/apps/website/app/consulting/[serviceId]/booking/success/page.tsx`
- **API routes**: `/apps/website/app/api/consulting/`

### 2. Run Development Server

```bash
cd apps/website
npm install
npm run dev
```

The website will run on `http://localhost:3001`

### 3. Access the Booking Page

1. Navigate to a service page: `http://localhost:3001/consulting`
2. Click on any service card
3. Click "Book a Consultation" button
4. Complete the booking flow

## Feature Overview

### 5-Step Booking Flow

```
Step 1: Consultant Selection
  ↓
Step 2: Calendar & Time Selection
  ↓
Step 3: Duration Selection
  ↓
Step 4: Booking Summary
  ↓
Step 5: Payment Processing
  ↓
Success Page: Confirmation & Details
```

### Key Features

✓ **Smart Calendar**: 14-day view with availability filtering  
✓ **Real-time Pricing**: Dynamic price calculation based on duration  
✓ **Timezone Support**: 8 major timezones with localization  
✓ **Premium UX**: Smooth animations and transitions  
✓ **Responsive**: Mobile, tablet, and desktop optimized  
✓ **Payment Ready**: Stripe-compatible payment form structure  
✓ **Success Handling**: Confirmation with calendar export  

## Customization Guide

### Change Service Min/Max Duration

The `minDuration` and `maxDuration` fields on `ServiceDetail` control booking constraints:

```typescript
interface ServiceDetail {
  minDuration: number;    // in minutes (e.g., 30)
  maxDuration: number;    // in minutes (e.g., 180)
}
```

Update these in your API responses or database schema.

### Modify Available Time Slots

Edit `generateMockTimeSlots()` in `/api/consulting/availability/route.ts`:

```typescript
// Change business hours
for (let hour = 8; hour < 18; hour++) {  // 8 AM to 6 PM

// Change slot increment
for (let minutes of [0, 15]) {  // 15-minute increments instead of 30
```

### Customize Timezone Options

In the CalendarStep component, modify the select options:

```tsx
<select value={timezone} onChange={(e) => onTimezoneChange(e.target.value)}>
  <option value="Your_Timezone">Your Display Name</option>
</select>
```

### Add Custom Validation

Add validation logic before step progression:

```typescript
// In handlePaymentSubmit, add custom validation:
if (totalPrice > 1000) {
  setError('For bookings over $1000, please contact sales');
  return;
}
```

### Change Brand Colors

Edit `/apps/website/tailwind.config.js`:

```javascript
'accent-green': '#NEW_COLOR',  // Primary action color
'bg-primary': '#NEW_COLOR',    // Page background
'text-primary': '#NEW_COLOR',  // Main text
```

### Modify Animation Speeds

Update animation durations in components:

```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}  // Change from 0.4 to desired duration
```

## Backend Integration

### 1. Update API Endpoints

Replace mock data functions with real API calls in:

**`/api/consulting/availability/route.ts`**
```typescript
// Replace generateMockTimeSlots() with:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/consulting/availability`, {
  // ... request config
});
```

**`/api/consulting/bookings/route.ts`**
```typescript
// Replace generateMockBooking() with real booking creation:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/consulting/bookings`, {
  method: 'POST',
  body: JSON.stringify(request.body)
});
```

### 2. Implement Stripe Payment

```bash
npm install @stripe/react-stripe-js stripe
```

Update PaymentStep component:

```typescript
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentStep = ({ ... }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    const { paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    // Process payment...
  };
};
```

### 3. Database Schema

Required tables/collections:

**bookings**
```sql
CREATE TABLE bookings (
  id VARCHAR PRIMARY KEY,
  service_id VARCHAR,
  consultant_id VARCHAR,
  user_email VARCHAR,
  date DATE,
  time TIME,
  duration DECIMAL,
  timezone VARCHAR,
  notes TEXT,
  status VARCHAR,
  meeting_link VARCHAR,
  created_at TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (consultant_id) REFERENCES consultants(id)
);
```

**consultant_availability**
```sql
CREATE TABLE consultant_availability (
  id VARCHAR PRIMARY KEY,
  consultant_id VARCHAR,
  date DATE,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (consultant_id) REFERENCES consultants(id)
);
```

### 4. Email Notifications

Send emails after booking creation:

```typescript
// In handlePaymentSubmit callback
await sendEmail({
  to: userEmail,
  template: 'booking-confirmation',
  data: { booking, consultantName, meetingLink }
});
```

### 5. Meeting Link Generation

Generate meeting link using Zoom/Google Meet API:

```typescript
// After booking creation
const meetingLink = await generateZoomMeeting({
  startTime: `${date}T${time}`,
  duration: duration * 60,
  title: `Consultation with ${consultantName}`
});
```

## Environment Configuration

Create `.env.local` in `/apps/website`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_STRIPE_KEY=pk_test_your_test_key

# Optionally for production
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

## Testing

### Unit Testing

```bash
npm run test
```

Example test for consultant selection:

```typescript
describe('ConsultantSelectionStep', () => {
  it('should select consultant on click', () => {
    // Test component selection logic
  });
});
```

### E2E Testing

```bash
npm run test:e2e
```

Example E2E test:

```typescript
describe('Booking Flow', () => {
  it('should complete full booking', () => {
    // Test all 5 steps
    // Verify success page
  });
});
```

## Troubleshooting

### Problem: "No available time slots"

**Solution**: Check that:
1. Consultant is selected before fetching availability
2. API is returning time slot data
3. Date/time combination exists in availability data

### Problem: Price calculation is wrong

**Solution**: Verify:
1. `consultant.hourlyRate` is set correctly
2. Duration is in hours (not minutes)
3. Price calculation: `hourlyRate × duration`

### Problem: Form won't submit

**Solution**: Check:
1. All required fields are filled
2. Payment info is complete
3. Browser console for errors
4. Network tab for failed API calls

### Problem: Success page doesn't load

**Solution**: Ensure:
1. Booking ID is in URL query params
2. API can fetch booking confirmation
3. Meeting link is available (optional)

## Performance Optimization

### Code Splitting

The booking page is already optimized with dynamic imports:

```typescript
// Framer Motion loads only when needed
import { motion, AnimatePresence } from 'framer-motion';
```

### Caching

Enable API response caching:

```typescript
// In API route
res.setHeader('Cache-Control', 'public, max-age=300');
```

### Image Optimization

Avatar placeholder uses CSS gradients (no images):

```typescript
className="bg-gradient-to-br from-wise-accent-green/30 to-blue-500/30"
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

### Deploy to Self-Hosted

```bash
npm run build
npm run start
```

Set environment variables before deployment:

```bash
export NEXT_PUBLIC_API_URL=https://api.wise2.net
npm run build
npm run start -p 3000
```

## Support & Debugging

### Enable Debug Logging

Add to booking page component:

```typescript
useEffect(() => {
  console.log('Booking data updated:', bookingData);
}, [bookingData]);
```

### Monitor API Calls

Open browser DevTools → Network tab to see:
- `GET /api/consulting/services/{serviceId}`
- `GET /api/consulting/availability`
- `POST /api/consulting/bookings`
- `GET /api/consulting/bookings/{bookingId}`

### Error Messages

All errors are logged to console and displayed to user:

```typescript
catch (err) {
  console.error('Error:', err);
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

## Additional Resources

- **BOOKING_PAGE_GUIDE.md** - Complete feature documentation
- **BOOKING_TESTING_CHECKLIST.md** - Testing procedures
- **Service Detail Page** - `/consulting/[serviceId]/page.tsx`
- **Tailwind Config** - `/tailwind.config.js` for styling
- **Framer Motion Docs** - https://www.framer.com/motion/

## Next Steps

1. **Test** the booking flow locally
2. **Integrate** with your backend API
3. **Customize** colors and timing to match your brand
4. **Set up** Stripe payment processing
5. **Configure** email notifications
6. **Deploy** to staging environment
7. **Perform** end-to-end testing
8. **Launch** to production

---

**Questions?** Check the main BOOKING_PAGE_GUIDE.md or open an issue on your repository.
