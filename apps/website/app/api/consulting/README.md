# Consulting API Routes

This directory contains Next.js API routes that proxy requests to the backend consulting API.

## Routes Overview

### 1. Bookings Management

#### `GET /api/consulting/bookings`
List user's bookings with optional filtering.

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `status` (optional): Filter by booking status (pending, confirmed, completed, cancelled)
- `limit` (optional, default: 50): Number of bookings to return
- `offset` (optional, default: 0): Pagination offset

**Response**:
```json
{
  "bookings": [
    {
      "id": "BK-001",
      "serviceId": "SVC-001",
      "consultantId": "CON-001",
      "date": "2026-07-25",
      "time": "14:00",
      "duration": 60,
      "timezone": "America/New_York",
      "status": "confirmed",
      "createdAt": "2026-07-23T10:00:00Z"
    }
  ],
  "total": 5
}
```

**Error Responses**:
- `401 Unauthorized`: No authentication token provided
- `500 Internal Server Error`: Failed to fetch bookings

---

#### `POST /api/consulting/bookings`
Create a new booking.

**Authentication**: Optional (Bearer token)

**Request Body**:
```json
{
  "serviceId": "SVC-001",
  "consultantId": "CON-001",
  "date": "2026-07-25",
  "time": "14:00",
  "duration": 60,
  "timezone": "America/New_York",
  "notes": "Optional booking notes"
}
```

**Response** (201 Created):
```json
{
  "id": "BK-12345",
  "serviceId": "SVC-001",
  "consultantId": "CON-001",
  "date": "2026-07-25",
  "time": "14:00",
  "duration": 60,
  "timezone": "America/New_York",
  "status": "confirmed",
  "createdAt": "2026-07-23T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Failed to create booking

---

#### `GET /api/consulting/bookings/[bookingId]`
Get booking details.

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `bookingId` (required): The ID of the booking

**Response**:
```json
{
  "id": "BK-001",
  "serviceId": "SVC-001",
  "consultantId": "CON-001",
  "consultantName": "Sarah Chen",
  "consultantEmail": "sarah.chen@wise2.net",
  "serviceName": "Brand Strategy Consultation",
  "date": "2026-07-25",
  "time": "14:00",
  "duration": 60,
  "timezone": "America/New_York",
  "totalPrice": 150,
  "meetingLink": "https://meet.wise2.net/BK-001",
  "status": "confirmed",
  "createdAt": "2026-07-23T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Booking ID is required
- `401 Unauthorized`: No authentication token provided
- `404 Not Found`: Booking not found
- `500 Internal Server Error`: Failed to fetch booking

---

#### `PUT /api/consulting/bookings/[bookingId]`
Reschedule a booking to a new date/time.

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `bookingId` (required): The ID of the booking

**Request Body**:
```json
{
  "date": "2026-07-28",
  "time": "15:30",
  "timezone": "America/New_York"
}
```

**Response**:
```json
{
  "id": "BK-001",
  "date": "2026-07-28",
  "time": "15:30",
  "status": "confirmed",
  "updatedAt": "2026-07-23T11:00:00Z"
}
```

**Validation**:
- `date` format: `YYYY-MM-DD`
- `time` format: `HH:MM`
- New time slot must be available

**Error Responses**:
- `400 Bad Request`: Invalid date/time format or missing required fields
- `401 Unauthorized`: No authentication token provided
- `404 Not Found`: Booking not found
- `409 Conflict`: Time slot is no longer available
- `410 Gone`: Booking already completed or cancelled
- `500 Internal Server Error`: Failed to reschedule booking

---

#### `DELETE /api/consulting/bookings/[bookingId]`
Cancel a booking.

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `bookingId` (required): The ID of the booking

**Query Parameters**:
- `reason` (optional, default: "user_cancelled"): Reason for cancellation

**Response**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Booking ID is required
- `401 Unauthorized`: No authentication token provided
- `404 Not Found`: Booking not found
- `410 Gone`: Booking already completed or cancelled
- `500 Internal Server Error`: Failed to cancel booking

---

### 2. Availability

#### `GET /api/consulting/availability`
Get available time slots for a consultant.

**Authentication**: Optional (Bearer token)

**Query Parameters**:
- `consultantId` (required): ID of the consultant
- `timezone` (optional, default: "America/New_York"): Timezone for availability
- `days` (optional, default: 14): Number of days to fetch (1-90)

**Response**:
```json
[
  {
    "date": "2026-07-25",
    "time": "09:00",
    "available": true
  },
  {
    "date": "2026-07-25",
    "time": "09:30",
    "available": false
  }
]
```

**Error Responses**:
- `400 Bad Request`: Missing consultantId or invalid days parameter
- `404 Not Found`: Consultant not found
- `500 Internal Server Error`: Failed to fetch availability

---

## Authentication

All routes requiring authentication use Bearer tokens:

```
Authorization: Bearer <token>
```

Get your token by authenticating with the backend API, then pass it in the Authorization header.

### Example Usage with cURL

```bash
# Get user's bookings
curl -X GET "http://localhost:3000/api/consulting/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Create a booking
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

# Reschedule a booking
curl -X PUT "http://localhost:3000/api/consulting/bookings/BK-001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-07-28",
    "time": "15:30",
    "timezone": "America/New_York"
  }'

# Cancel a booking
curl -X DELETE "http://localhost:3000/api/consulting/bookings/BK-001?reason=user_cancelled" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Get available slots
curl -X GET "http://localhost:3000/api/consulting/availability?consultantId=CON-001&timezone=America/New_York&days=14" \
  -H "Content-Type: application/json"
```

---

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

HTTP Status Codes:
- `200 OK`: Successful GET or DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation error in request
- `401 Unauthorized`: Authentication required but not provided
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., time slot unavailable)
- `410 Gone`: Resource no longer available
- `500 Internal Server Error`: Server error

---

## Backend API Integration

These routes proxy to the backend API at:
- **Environment Variable**: `NEXT_PUBLIC_API_URL` or `API_BASE_URL`
- **Default**: `http://localhost:3001`
- **Production**: Set via environment configuration

Backend endpoints:
- `GET/POST /v1/consulting/bookings` - List and create bookings
- `GET/PUT/DELETE /v1/consulting/bookings/:id` - Get, reschedule, cancel
- `GET /v1/consulting/availability` - Get available slots

---

## Development Notes

- **Mock Data**: Routes return mock data when backend API is unavailable (for demo purposes)
- **Auth Token Extraction**: Implemented in `/lib/api-helpers.ts`
- **Error Handling**: Consistent error messages and status codes across all routes
- **Validation**: Client-side input validation for date/time formats
- **Pagination**: List endpoints support limit/offset parameters

---

## Related Files

- `/lib/api-helpers.ts` - Shared utilities for auth, headers, and error handling
- `/apps/website/` - Next.js application structure
- `env.example` - Environment configuration template
