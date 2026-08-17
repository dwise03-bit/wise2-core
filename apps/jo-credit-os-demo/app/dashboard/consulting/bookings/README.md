# Admin Bookings View

Professional admin dashboard for managing consulting service bookings. Provides calendar and list views, booking management, revenue reporting, and CSV export functionality.

## Features

### 1. Calendar View
- Month-view calendar displaying all bookings
- Color-coded by consultant for easy visualization
- Click on any booking to view details
- Navigate between months
- Hover to see booking count for each day
- Highlights today's date

### 2. List View
- Comprehensive table of all bookings
- Advanced filtering:
  - **Search**: By user name, email, or consultant
  - **Consultant**: Filter by specific consultant
  - **Status**: Filter by booking status (pending, confirmed, completed, no-show, cancelled)
  - **Date Range**: Filter by date range (from date)
- Sortable columns (via API backend)
- Pagination (10 items per page)
- Click "View" button to see booking details

### 3. Booking Detail Modal
- Full booking information:
  - Client name and email
  - Consultant name
  - Service type and price
  - Date, time, and duration
  - Timezone information
  - Booking ID and creation timestamp
- View and edit consultant notes
- Status update buttons:
  - Mark Confirmed (blue)
  - Mark Completed (emerald)
  - Mark No Show (red)
  - Cancel (gray)
- Real-time status updates

### 4. Revenue Report Cards
- **Total Bookings**: Count of all bookings
- **Confirmed**: Bookings awaiting completion
- **Completed**: Successfully completed bookings
- **Total Revenue**: Sum of all completed booking prices
- **Average Price**: Average price per completed booking

### 5. Revenue by Consultant
- Grid view showing revenue per consultant
- Number of completed bookings per consultant
- Color-coded consultant identification

### 6. CSV Export
- Export filtered bookings to CSV
- Includes: ID, User, Email, Consultant, Service, Date, Time, Status, Price
- Filename includes current date

### 7. Admin Access
- Admin-only page (requires authentication)
- Protected API endpoints
- TODO: Implement proper role-based access control

## Component Structure

```
page.tsx (Main page component)
├── CalendarView (Calendar display component)
├── BookingDetailModal (Detail/edit modal)
└── Status display with color coding
```

## Data Model

```typescript
interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consultantId: string;
  consultantName: string;
  serviceId: string;
  serviceName: string;
  date: string;                    // YYYY-MM-DD
  time: string;                    // HH:MM format
  duration: number;                // minutes
  timezone: string;                // IANA timezone
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  price: number;                   // USD
  notes?: string;                  // Consultant notes
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

## Status Colors

- **Pending** (Yellow): Awaiting confirmation
- **Confirmed** (Blue): Confirmed but not yet completed
- **Completed** (Emerald): Successfully completed
- **No Show** (Red): Client did not attend
- **Cancelled** (Gray): Booking cancelled

## API Endpoints

### GET /api/admin/bookings
Fetch all bookings for admin dashboard.

**Response:**
```json
{
  "bookings": [
    {
      "id": "BK-001",
      "userId": "USR-001",
      "userName": "Sarah Chen",
      "userEmail": "sarah@example.com",
      "consultantId": "CON-001",
      "consultantName": "Alex Morgan",
      "serviceId": "SVC-001",
      "serviceName": "Strategy Consultation",
      "date": "2024-07-23",
      "time": "14:00",
      "duration": 60,
      "timezone": "America/Los_Angeles",
      "status": "confirmed",
      "price": 250,
      "notes": "Discussed Q3 strategy",
      "createdAt": "2024-07-22T10:00:00Z",
      "updatedAt": "2024-07-22T10:00:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/admin/bookings/[bookingId]
Fetch a single booking by ID.

### PUT /api/admin/bookings/[bookingId]
Update a booking's status or notes.

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Session completed successfully"
}
```

### DELETE /api/admin/bookings/[bookingId]
Cancel a booking (updates status to 'cancelled').

## Usage

### Viewing the Dashboard
1. Navigate to `/dashboard/consulting/bookings`
2. Page loads with calendar view by default
3. Revenue cards display at top

### Switching Views
- Click "Calendar" button to switch to month calendar view
- Click "List" button to switch to filtered list view

### Calendar Navigation
1. Use left/right chevrons to navigate months
2. Click on a booking time to open detail modal
3. Hover over day cells to see booking count

### Filtering (List View)
1. Enter search term to filter by user, email, or consultant
2. Select consultant from dropdown to filter by consultant
3. Select status to filter by booking status
4. Select date range start to filter by date

### Managing Bookings
1. Click "View" button on any booking row (list view) or click on booking in calendar
2. Modal opens with full booking details
3. Use status buttons to update booking status
4. Edit consultant notes in text area
5. Click "Close" to save and exit

### Exporting Data
1. Apply desired filters in list view
2. Click "Export CSV" button
3. CSV file downloads with filtered results

## Implementation Notes

### Frontend (React/Next.js)
- Uses React hooks for state management (useState, useEffect, useCallback)
- TailwindCSS for styling with dark theme
- Lucide React for icons
- Custom calendar component (no external calendar library)
- Modal components for detail view

### Backend (API Routes)
- Next.js API routes in `/api/admin/bookings/`
- Currently uses mock data
- TODO: Replace with actual database queries

### Authentication
- TODO: Implement proper admin authentication
- TODO: Add role-based access control
- TODO: Add request validation middleware

## Future Enhancements

1. **Drag-to-reschedule**: Drag bookings in calendar to reschedule
2. **Email notifications**: Send status change notifications to clients
3. **Bulk actions**: Select multiple bookings for bulk status updates
4. **Booking analytics**: Charts showing booking trends, revenue by service type
5. **Client communication**: Send messages to clients directly from booking detail
6. **Integration with calendar services**: Sync with Google Calendar, Outlook
7. **Payment reconciliation**: Track refunds and payment adjustments
8. **Consultant availability sync**: Link booking view with consultant availability
9. **Automated reminders**: Send reminders to consultant and client before booking
10. **Custom date range export**: Export bookings for any date range

## Styling

### Color Scheme (Dark Mode)
- Background: #050505 (near black)
- Cards: #101010 (dark gray)
- Borders: #1a1a1a (lighter gray)
- Text: white (primary), gray-400 (secondary)
- Accents:
  - Emerald: #10b981 (primary action)
  - Blue: #3b82f6 (secondary)
  - Amber: #f59e0b (pricing)
  - Red: #ef4444 (danger/no-show)

### Responsive Design
- Mobile: Single column layout
- Tablet: 2-column grid for some sections
- Desktop: Full multi-column layout

## Dependencies

- React 19.0.0
- Next.js 14.0.0
- TailwindCSS 3.4.0
- Lucide React 0.408.0

No additional calendar library required (custom implementation).

## File Structure

```
/apps/website/app/dashboard/consulting/bookings/
├── page.tsx                    # Main component
├── README.md                   # This file
└── QUICKSTART.md              # Quick start guide (optional)

/apps/website/app/api/admin/bookings/
├── route.ts                   # GET all bookings
└── [bookingId]/
    └── route.ts               # GET/PUT/DELETE single booking
```

## Testing

### Mock Data
The API endpoints return mock booking data for testing. To use real data:

1. Connect to your database (Prisma, MongoDB, etc.)
2. Replace mock data in `/api/admin/bookings/route.ts`
3. Implement database queries for single booking endpoints

### Calendar Testing
- Navigate to different months
- Click on bookings to open detail modal
- Verify color coding matches consultant assignment

### List View Testing
- Apply each filter type individually
- Combine multiple filters
- Verify pagination works correctly
- Test CSV export with filtered results

## Authentication & Authorization

Currently, no authentication is implemented. To add admin protection:

1. Add middleware to check admin role
2. Validate auth token in API routes
3. Redirect unauthorized users to login

Example (to be implemented):
```typescript
// Middleware check
const isAdmin = await checkAdminStatus(request);
if (!isAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Performance Considerations

- Bookings are loaded once on component mount
- Filtering is done client-side (suitable for < 1000 bookings)
- For larger datasets, implement server-side pagination and filtering
- Consider implementing React Query for better cache management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Part of WISE² platform. All rights reserved.
