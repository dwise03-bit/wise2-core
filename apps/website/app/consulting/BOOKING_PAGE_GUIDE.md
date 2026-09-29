# Consulting Booking Page - Implementation Guide

## Overview

The consulting booking system is a complete multi-step flow for users to schedule consultations with expert consultants. The system includes a 5-step booking process, calendar integration, real-time pricing, and payment processing.

## File Structure

```
apps/website/
├── app/
│   ├── api/
│   │   └── consulting/
│   │       ├── availability/
│   │       │   └── route.ts          # Fetch available time slots
│   │       ├── bookings/
│   │       │   ├── route.ts          # Create new booking
│   │       │   └── [bookingId]/
│   │       │       └── route.ts      # Fetch booking confirmation
│   │       ├── services/
│   │       │   ├── route.ts          # List all services
│   │       │   └── [serviceId]/
│   │       │       └── route.ts      # Get service details
│   │
│   └── consulting/
│       ├── [serviceId]/
│       │   ├── page.tsx              # Service detail page
│       │   └── booking/
│       │       ├── page.tsx          # Main booking page (5 steps)
│       │       └── success/
│       │           └── page.tsx      # Success confirmation page
│       ├── page.tsx                  # Services listing
│       └── BOOKING_PAGE_GUIDE.md     # This file
```

## Component Architecture

### Booking Page (`page.tsx`)

The main booking page implements a 5-step wizard flow:

#### Step 1: Consultant Selection
- Grid of available consultants for the service
- Shows consultant details: name, bio, rating, experience, expertise
- Visual feedback for selected consultant
- Animated card hover effects

#### Step 2: Calendar & Time Selection
- Calendar picker showing next 14 days (weekdays only)
- 30-minute time slot increments from 9 AM to 5 PM
- Timezone selector (8 major timezones)
- Real-time availability indication
- Disabled dates with no availability

#### Step 3: Duration Selection
- Quick select buttons (0.5h, 1h, 1.5h, 2h)
- Custom duration slider (min/max validation from service settings)
- Live price calculation
- Price summary card

#### Step 4: Booking Summary
- Service information card
- Consultant details card
- Date & time confirmation card
- Duration & price summary
- Optional notes/special requests text area
- Formatted date display with timezone

#### Step 5: Payment
- Payment form with Stripe Elements styling
- Cardholder name input
- Card number (with auto-formatting)
- Expiry date (MM/YY format)
- CVC input (3-4 digits)
- Real-time validation
- Error message display
- Secure payment note

### Features

#### Multi-Step Flow
- **Step Indicator**: Visual progress with completed step checkmarks
- **Validation**: Each step validates before allowing progression
- **Back/Next Navigation**: Intuitive navigation between steps
- **Animations**: Smooth transitions between steps using Framer Motion

#### Calendar Integration
- **14-Day View**: Shows availability for next 2 weeks
- **Weekend Exclusion**: Automatically excludes Saturdays/Sundays
- **Business Hours**: 9 AM - 5 PM scheduling
- **30-Min Slots**: Fine-grained time selection
- **Visual Feedback**: Color coding for selected/available slots

#### Pricing & Calculations
- **Real-time Calculation**: Price updates as duration changes
- **Hourly Rate**: Fetched from consultant profile
- **Transparent Display**: Shows breakdown (rate × hours = total)
- **Visual Emphasis**: Large, animated price display

#### Success Page Features
- **Confirmation Number**: Unique booking ID with copy functionality
- **Booking Details**: Service, consultant, date, time, price summary
- **Meeting Link**: Direct access to video meeting (when available)
- **Calendar Export**: Download .ics file for Google Calendar, Outlook, Apple Calendar
- **Next Steps**: Clear instructions on what happens after booking
- **Alternative Actions**: Book another consultation or view all services

#### UX Enhancements
- **Loading States**: Skeleton loaders during data fetching
- **Error Handling**: Graceful error messages with recovery options
- **Animations**: Framer Motion staggered animations for smooth UX
- **Responsive Design**: Full responsive layout (mobile-first approach)
- **Accessibility**: Semantic HTML, proper contrast, keyboard support

## API Routes

### GET `/api/consulting/availability`
Fetch available time slots for a consultant.

**Query Parameters:**
- `consultantId` (required): Consultant ID
- `timezone` (optional): Timezone for slot times (default: America/New_York)

**Response:**
```json
[
  {
    "date": "2024-07-25",
    "time": "09:00",
    "available": true
  },
  {
    "date": "2024-07-25",
    "time": "09:30",
    "available": false
  }
]
```

**Demo Behavior:**
- Returns 14 days of slots
- Excludes weekends
- 30-minute increments from 9 AM to 5 PM
- ~80% random availability for demo purposes

### POST `/api/consulting/bookings`
Create a new booking with payment.

**Request Body:**
```json
{
  "serviceId": "svc-123",
  "consultantId": "con-456",
  "date": "2024-07-25",
  "time": "14:00",
  "duration": 1.5,
  "timezone": "America/New_York",
  "notes": "Optional notes about the consultation",
  "payment": {
    "cardNumber": "4242 4242 4242 4242",
    "expiryDate": "12/25",
    "cvc": "123",
    "cardholderName": "John Doe"
  }
}
```

**Response:**
```json
{
  "id": "BK-1721957283749-abc123def",
  "serviceId": "svc-123",
  "consultantId": "con-456",
  "date": "2024-07-25",
  "time": "14:00",
  "duration": 1.5,
  "timezone": "America/New_York",
  "status": "confirmed",
  "createdAt": "2024-07-23T12:00:00Z"
}
```

### GET `/api/consulting/bookings/[bookingId]`
Fetch booking confirmation details.

**Response:**
```json
{
  "id": "BK-1721957283749-abc123def",
  "serviceId": "svc-123",
  "consultantId": "con-456",
  "consultantName": "Sarah Chen",
  "consultantEmail": "sarah.chen@wise2.net",
  "serviceName": "Brand Strategy Consultation",
  "date": "2024-07-25",
  "time": "14:00",
  "duration": 1.5,
  "timezone": "America/New_York",
  "totalPrice": 225.00,
  "meetingLink": "https://meet.wise2.net/BK-1721957283749-abc123def",
  "status": "confirmed",
  "createdAt": "2024-07-23T12:00:00Z"
}
```

## Data Models

### Consultant
```typescript
interface Consultant {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  yearsExperience: number;
  bookingsCompleted: number;
  avatar?: string;
  timezone?: string;
}
```

### ServiceDetail
```typescript
interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  minDuration: number;    // in minutes
  maxDuration: number;    // in minutes
  tags: string[];
  consultants: Consultant[];
}
```

### TimeSlot
```typescript
interface TimeSlot {
  date: string;           // YYYY-MM-DD format
  time: string;           // HH:mm format
  available: boolean;
}
```

### BookingData (Internal State)
```typescript
interface BookingData {
  consultant: Consultant | null;
  selectedDate: string;
  selectedTime: string;
  duration: number;       // in hours
  timezone: string;
  notes: string;
}
```

## Styling & Design

### Brand Colors
- **Primary**: `#22C55E` (Wise Accent Green)
- **Background**: `#050505` (Wise BG Primary)
- **Card Background**: `#0D1117` (Wise BG Secondary)
- **Text**: `#FFFFFF` (White)
- **Text Secondary**: `#8D98A5` (Gray)
- **Surface**: `#1A2332` (Wise Surface 3)

### Design System Integration
- Uses WISE² Tailwind color scheme
- Framer Motion for animations
- Lucide React icons
- Responsive grid layouts
- Glassmorphism card effects
- Gradient overlays for visual depth

### Animation Details
- **Step Transitions**: 400ms ease-out animations
- **Button Interactions**: 
  - Hover: Scale 1.02
  - Tap: Scale 0.98
- **Stagger Effects**: 100ms delays between children
- **Icon Animations**: Spring physics for impact

## Usage

### From Service Detail Page
The service detail page (`[serviceId]/page.tsx`) includes a "Book Consultation" button that links to the booking page:

```tsx
<motion.button
  onClick={() => router.push(`/consulting/${serviceId}/booking`)}
  className="px-8 py-4 bg-wise-accent-green..."
>
  Book a Consultation <ArrowRight size={20} />
</motion.button>
```

### Direct URL Access
Users can directly access:
- Booking page: `/consulting/{serviceId}/booking`
- Success page: `/consulting/{serviceId}/booking/success?bookingId={id}`

## Integration Checklist

### Before Production Deployment

- [ ] **Stripe Integration**
  - [ ] Replace mock payment handler with Stripe Elements integration
  - [ ] Add `@stripe/react-stripe-js` to dependencies
  - [ ] Implement proper PCI compliance handling
  - [ ] Set up webhook handlers for payment events

- [ ] **Backend API**
  - [ ] Verify `NEXT_PUBLIC_API_URL` environment variable
  - [ ] Implement booking persistence in database
  - [ ] Add consultant availability management
  - [ ] Set up email notifications

- [ ] **Email Notifications**
  - [ ] Confirmation email to user
  - [ ] Consultant notification
  - [ ] Meeting reminder emails (24 hours before)
  - [ ] Post-meeting follow-up emails

- [ ] **Meeting Links**
  - [ ] Integration with Zoom/Google Meet/Teams
  - [ ] Automatic link generation on booking
  - [ ] Link delivery via email

- [ ] **Error Handling**
  - [ ] Implement retry logic for failed payments
  - [ ] Graceful handling of availability conflicts
  - [ ] User-friendly error messages

- [ ] **Testing**
  - [ ] Unit tests for form validation
  - [ ] Integration tests for API routes
  - [ ] E2E tests for full booking flow
  - [ ] Payment testing with Stripe test cards

- [ ] **Analytics**
  - [ ] Track booking conversion rates
  - [ ] Monitor drop-off points in flow
  - [ ] Measure form completion times

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.wise2.net

# Optional (for Stripe integration)
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- **Code Splitting**: Each step component is lazy-loaded
- **Image Optimization**: Avatar placeholders use CSS gradients
- **Form Optimization**: Debounced price calculations
- **API Optimization**: Availability fetched once on consultant selection
- **Animation Performance**: Uses `transform` and `opacity` for smooth 60fps animations

## Accessibility

- **Semantic HTML**: Proper heading hierarchy, form labels
- **ARIA Labels**: Added to interactive elements
- **Keyboard Navigation**: Full support for Tab, Enter, Escape
- **Color Contrast**: WCAG AA compliant
- **Focus States**: Clear visual indicators
- **Error Messages**: Associated with form fields via ARIA

## Future Enhancements

1. **Group Bookings**: Support booking multiple consultants
2. **Recurring Bookings**: Schedule series of consultations
3. **Refund Policy**: Implement cancellation and refund handling
4. **Rescheduling**: Allow users to reschedule after booking
5. **Review System**: Post-consultation feedback and ratings
6. **Payment Plans**: Installment payment options
7. **Waitlist**: Handle fully booked time slots
8. **SMS Reminders**: Text message booking reminders
