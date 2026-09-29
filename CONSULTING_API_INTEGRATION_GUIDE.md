# Consulting API Integration Guide

This guide covers how to use the consulting API routes and client utilities in your frontend application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Routes](#api-routes)
3. [Client Utilities](#client-utilities)
4. [React Hooks](#react-hooks)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      React Component                    │
│  (useConsultingBookings/Availability)   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Next.js API Routes (/api/consulting)  │
│  ├─ /bookings                           │
│  ├─ /bookings/[id]                      │
│  └─ /availability                       │
└──────────────┬──────────────────────────┘
               │
               ↓ (proxies to)
┌─────────────────────────────────────────┐
│      Backend API                        │
│  (NestJS - port 3001)                   │
│  ├─ /v1/consulting/bookings             │
│  ├─ /v1/consulting/availability         │
│  └─ ...                                 │
└─────────────────────────────────────────┘
```

---

## API Routes

### Bookings Routes

Located in: `/apps/website/app/api/consulting/bookings/`

#### List Bookings
```
GET /api/consulting/bookings?status=confirmed&limit=10&offset=0
```

#### Create Booking
```
POST /api/consulting/bookings
Content-Type: application/json

{
  "serviceId": "SVC-001",
  "consultantId": "CON-001",
  "date": "2026-07-25",
  "time": "14:00",
  "duration": 60,
  "timezone": "America/New_York"
}
```

#### Get Booking Details
```
GET /api/consulting/bookings/BK-001
```

#### Reschedule Booking
```
PUT /api/consulting/bookings/BK-001
Content-Type: application/json

{
  "date": "2026-07-28",
  "time": "15:30",
  "timezone": "America/New_York"
}
```

#### Cancel Booking
```
DELETE /api/consulting/bookings/BK-001?reason=user_cancelled
```

### Availability Route

#### Get Available Slots
```
GET /api/consulting/availability?consultantId=CON-001&timezone=America/New_York&days=14
```

---

## Client Utilities

### ConsultingClient

Located in: `/apps/website/lib/consulting-client.ts`

The `ConsultingClient` class provides a type-safe interface to the consulting API.

```typescript
import { consultingClient } from '@/lib/consulting-client';

// Set authentication token
consultingClient.setToken(token);

// Use methods
const bookings = await consultingClient.listBookings();
const booking = await consultingClient.createBooking({...});
const detail = await consultingClient.getBooking('BK-001');
const updated = await consultingClient.rescheduleBooking('BK-001', {...});
await consultingClient.cancelBooking('BK-001');
const slots = await consultingClient.getAvailability({...});
```

### Error Handling

```typescript
import { ApiClientError } from '@/lib/consulting-client';

try {
  const booking = await consultingClient.createBooking({...});
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isNotFound()) {
      // Handle 404
    } else if (error.isUnauthorized()) {
      // Handle 401
    } else if (error.isConflict()) {
      // Handle 409 (e.g., slot no longer available)
    }
  }
}
```

---

## React Hooks

### useConsultingBookings

Located in: `/apps/website/lib/hooks/useConsultingBookings.ts`

Manages booking state and operations.

```typescript
import { useConsultingBookings } from '@/lib/hooks/useConsultingBookings';

export function BookingsComponent() {
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    getBooking,
    rescheduleBooking,
    cancelBooking,
  } = useConsultingBookings(authToken);

  useEffect(() => {
    fetchBookings({ status: 'confirmed' });
  }, [fetchBookings]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {bookings?.bookings.map((booking) => (
        <div key={booking.id}>{booking.id}</div>
      ))}
    </div>
  );
}
```

### useConsultingAvailability

Located in: `/apps/website/lib/hooks/useConsultingAvailability.ts`

Manages availability slot fetching and filtering.

```typescript
import { useConsultingAvailability } from '@/lib/hooks/useConsultingAvailability';

export function AvailabilityComponent() {
  const {
    slots,
    loading,
    error,
    fetchAvailability,
    getAvailableSlots,
    getSlotsByDate,
  } = useConsultingAvailability(authToken);

  useEffect(() => {
    fetchAvailability({
      consultantId: 'CON-001',
      timezone: 'America/New_York',
      days: 14,
    });
  }, [fetchAvailability]);

  if (loading) return <div>Loading...</div>;

  const slotsByDate = getSlotsByDate();

  return (
    <div>
      {Object.entries(slotsByDate).map(([date, dateSlots]) => (
        <div key={date}>
          <h3>{date}</h3>
          <ul>
            {dateSlots
              .filter((s) => s.available)
              .map((slot) => (
                <li key={`${date}-${slot.time}`}>{slot.time}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## Usage Examples

### Example 1: Create a Booking

```typescript
'use client';

import { useState } from 'react';
import { useConsultingBookings } from '@/lib/hooks/useConsultingBookings';
import { useConsultingAvailability } from '@/lib/hooks/useConsultingAvailability';

export function BookingForm({ consultantId, token }) {
  const { createBooking, loading: bookingLoading, error: bookingError } =
    useConsultingBookings(token);
  const { slots, fetchAvailability, getAvailableSlots } =
    useConsultingAvailability(token);

  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
  });

  const handleLoadAvailability = async () => {
    await fetchAvailability({
      consultantId,
      timezone: 'America/New_York',
      days: 14,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBooking({
        serviceId: formData.serviceId,
        consultantId,
        date: formData.date,
        time: formData.time,
        duration: 60,
        timezone: 'America/New_York',
      });

      alert('Booking created successfully!');
      setFormData({ serviceId: '', date: '', time: '' });
    } catch (error) {
      alert(`Failed to create booking: ${error.message}`);
    }
  };

  const availableSlots = getAvailableSlots(formData.date);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Service ID</label>
        <input
          type="text"
          value={formData.serviceId}
          onChange={(e) =>
            setFormData({ ...formData, serviceId: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label>Load Availability</label>
        <button
          type="button"
          onClick={handleLoadAvailability}
          disabled={bookingLoading}
        >
          Load Slots
        </button>
      </div>

      <div>
        <label>Date</label>
        <select
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        >
          <option value="">Select a date</option>
          {slots.map((slot) => (
            <option key={slot.date} value={slot.date}>
              {slot.date}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Time</label>
        <select
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        >
          <option value="">Select a time</option>
          {availableSlots.map((slot) => (
            <option key={slot.time} value={slot.time}>
              {slot.time}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={bookingLoading}>
        {bookingLoading ? 'Creating...' : 'Create Booking'}
      </button>

      {bookingError && <div style={{ color: 'red' }}>{bookingError}</div>}
    </form>
  );
}
```

### Example 2: List and Manage Bookings

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useConsultingBookings } from '@/lib/hooks/useConsultingBookings';

export function BookingsList({ token }) {
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    rescheduleBooking,
    cancelBooking,
  } = useConsultingBookings(token);

  const [selectedStatus, setSelectedStatus] = useState('confirmed');

  useEffect(() => {
    fetchBookings({ status: selectedStatus });
  }, [selectedStatus, fetchBookings]);

  const handleReschedule = async (bookingId: string, newDate: string) => {
    try {
      await rescheduleBooking(bookingId, {
        date: newDate,
        time: '14:00',
      });
      alert('Booking rescheduled successfully!');
    } catch (error) {
      alert(`Failed to reschedule: ${error.message}`);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId, 'user_cancelled');
        alert('Booking cancelled successfully!');
      } catch (error) {
        alert(`Failed to cancel: ${error.message}`);
      }
    }
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <label>Filter by status:</label>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.date}</td>
              <td>{booking.time}</td>
              <td>{booking.status}</td>
              <td>
                <button
                  onClick={() => handleReschedule(booking.id, '2026-07-28')}
                >
                  Reschedule
                </button>
                <button onClick={() => handleCancel(booking.id)}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total: {bookings?.total || 0}</p>
    </div>
  );
}
```

---

## Error Handling

### Common Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Bad Request | Invalid input (wrong date format, missing fields) |
| 401 | Unauthorized | No auth token or expired token |
| 404 | Not Found | Booking or consultant not found |
| 409 | Conflict | Time slot no longer available |
| 410 | Gone | Booking already completed/cancelled |
| 500 | Server Error | Backend API error |

### Error Recovery

```typescript
async function createBookingWithRetry(bookingData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await consultingClient.createBooking(bookingData);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.isConflict()) {
          // Time slot conflict - reload availability
          const slots = await consultingClient.getAvailability({...});
          console.log('Updated availability:', slots);
          break; // Don't retry on conflict
        } else if (error.status >= 500 && i < maxRetries - 1) {
          // Retry on server errors
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }
      throw error;
    }
  }
}
```

---

## Authentication

### Setting Token

```typescript
// Option 1: Directly set on client
import { consultingClient } from '@/lib/consulting-client';

consultingClient.setToken(token);

// Option 2: Pass to hooks
const { ... } = useConsultingBookings(token);
const { ... } = useConsultingAvailability(token);

// Option 3: Store in localStorage/sessionStorage
localStorage.setItem('consulting_token', token);
// The client will automatically retrieve it
```

### Getting Token from Session

```typescript
import { getSession } from '@/lib/auth'; // Your auth library

export async function BookingsPage() {
  const session = await getSession();
  const token = session?.accessToken;

  return <BookingsList token={token} />;
}
```

---

## Types

All types are available from `/types/consulting.ts`:

```typescript
import {
  Booking,
  BookingDetail,
  BookingListResponse,
  BookingStatus,
  CreateBookingRequest,
  RescheduleBookingRequest,
  TimeSlot,
  AvailabilityParams,
} from '@/types/consulting';
```

---

## Environment Configuration

Set in `.env.local` or deployment environment:

```env
# Backend API URL (defaults to http://localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001
```

---

## Related Files

- **API Routes**: `/apps/website/app/api/consulting/`
- **API Documentation**: `/apps/website/app/api/consulting/README.md`
- **Types**: `/apps/website/types/consulting.ts`
- **Client**: `/apps/website/lib/consulting-client.ts`
- **Hooks**: `/apps/website/lib/hooks/useConsultingBookings.ts`, `useConsultingAvailability.ts`
- **Helpers**: `/apps/website/lib/api-helpers.ts`

---

## Testing

### Test with cURL

```bash
# Get bookings
curl -X GET "http://localhost:3000/api/consulting/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create booking
curl -X POST "http://localhost:3000/api/consulting/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "SVC-001",
    "consultantId": "CON-001",
    "date": "2026-07-25",
    "time": "14:00",
    "duration": 60,
    "timezone": "America/New_York"
  }'

# Get availability
curl -X GET "http://localhost:3000/api/consulting/availability?consultantId=CON-001"
```

### Test in Browser Console

```javascript
import { consultingClient } from '@/lib/consulting-client';

// Set token
consultingClient.setToken('YOUR_TOKEN');

// Fetch bookings
const bookings = await consultingClient.listBookings();
console.log(bookings);

// Create booking
const booking = await consultingClient.createBooking({
  serviceId: 'SVC-001',
  consultantId: 'CON-001',
  date: '2026-07-25',
  time: '14:00',
  duration: 60,
  timezone: 'America/New_York',
});
console.log(booking);
```
