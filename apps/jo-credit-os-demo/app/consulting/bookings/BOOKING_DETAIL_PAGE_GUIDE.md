# Booking Detail Page Guide

## Overview

The booking detail page (`/consulting/bookings/[bookingId]/page.tsx`) provides a comprehensive view of a single booking with context-aware actions and information.

**Route**: `/consulting/bookings/:bookingId`

## Features

### 1. Full Booking Details
Displays complete booking information:
- **Service Name** - The consulting service booked
- **Consultant Name & Email** - With contact options
- **Schedule** - Date, time, duration, and meeting type
- **Price** - Total cost and breakdown
- **Status Badge** - Current booking status (scheduled, completed, cancelled, no-show)
- **Meeting Link** - Direct access to join video/phone calls
- **Session Notes** - Customer notes and requirements

### 2. Upcoming Bookings Actions

For bookings that are scheduled and in the future:

#### Reschedule Button
- Opens modal to select new date/time
- Requires date and time selection
- Sends reschedule request to API

#### Cancel Button
- Confirmation dialog before cancellation
- Explains refund policy
- Navigates back to bookings list on confirmation

#### Contact Consultant
- Email or message options
- Pre-filled email address display
- Direct communication channel

### 3. Completed Bookings Features

For bookings with status `completed`:

#### Post-Call Summary
- AI-generated discussion summary
- Key takeaways and outcomes
- Recording download link (if available)

#### Action Items Section
- Checklist of follow-up tasks
- Owner assignment per item
- Due dates for each action
- Completion tracking with progress bar
- Click items to mark complete

#### Schedule Follow-up
- Book another session with same consultant
- Pre-select preferred dates
- Add discussion topics
- Seamless rebooking experience

### 4. Contact Consultant Modal
Two modes: Email or Message
- **Email Mode**: Shows consultant email, sends formal email
- **Message Mode**: Direct messaging through platform
- Character count and validation
- Loading state during submission

### 5. Premium UI/UX
- **Dark Theme**: Premium gradient design with slate/blue accents
- **Responsive**: Mobile, tablet, and desktop optimized
- **Animations**: Framer Motion for smooth transitions
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Status Indicators**: Clear visual feedback for all states

## Component Structure

```
BookingDetailPage (main)
├── StatusBadge (status indicator)
├── RescheduleModal (reschedule logic)
├── CancelModal (cancellation confirmation)
├── FollowUpModal (follow-up booking)
├── ContactModal (contact consultant)
└── ActionItemsSection (action items tracker)
```

## Data Fetching

### API Endpoint
`GET /api/consulting/bookings/:bookingId`

**Response Format:**
```typescript
interface BookingDetail {
  id: string;
  serviceId: string;
  serviceName: string;
  consultantId: string;
  consultantName: string;
  consultantEmail?: string;
  consultantAvatar?: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  totalPrice: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  // Completed booking fields
  summary?: string;
  actionItems?: ActionItem[];
  recordingLink?: string;
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}
```

### Fallback Behavior
- If API fails, uses mock data for demo
- Mock data includes realistic consultant and service information
- Error message displayed but page remains functional

## Styling

### Color Scheme
- **Primary**: Blue (#3b82f6) - actions, links, highlights
- **Success**: Green (#22c55e) - completed items
- **Warning**: Red (#ef4444) - cancel/danger actions
- **Background**: Slate gradients (800-900) - premium dark theme
- **Text**: White/Slate variants for contrast

### Tailwind Utilities
- `from-slate-800 to-slate-900` - card backgrounds
- `border-slate-700` - subtle borders
- `hover:border-blue-500/50` - interactive feedback
- `group-hover:*` - grouped element interactions

## Navigation

### Links
- **Back Button** - Returns to bookings list (`/consulting/bookings`)
- **Browse Services** - From error state (`/consulting`)
- **View All Bookings** - From error state (`/consulting/bookings`)

## State Management

Uses React hooks for local state:
- `booking` - Fetched booking details
- `loading` - API fetch status
- `error` - Error messages
- `modal` - Current modal state and type
- `completedItems` - Action item completion tracking (local)

## Modal States

```typescript
type ModalType = 'reschedule' | 'cancel' | 'followup' | 'contact' | null;

interface ModalState {
  type: ModalType;
  isOpen: boolean;
}
```

## Future Enhancements

1. **Live Chat** - Real-time messaging with consultant
2. **Email Notifications** - Confirmations for all actions
3. **Calendar Integration** - Sync to Google Calendar, Outlook, etc.
4. **Recordings** - Upload and playback management
5. **Feedback Form** - Post-session survey and ratings
6. **Notes Editor** - Rich text editing for session notes
7. **Payment History** - Invoice and receipt management
8. **Reschedule Availability** - Real-time availability checking

## Testing

### Test Cases

**Upcoming Bookings:**
- [ ] Load upcoming booking details
- [ ] Click reschedule and submit new date/time
- [ ] Click cancel and confirm cancellation
- [ ] Contact consultant via email
- [ ] Contact consultant via message
- [ ] Meeting link opens correctly

**Completed Bookings:**
- [ ] Load completed booking details
- [ ] View post-call summary
- [ ] Check action items display
- [ ] Mark action items complete
- [ ] Download recording
- [ ] Schedule follow-up session

**Error States:**
- [ ] Load with invalid booking ID
- [ ] API timeout/failure
- [ ] Mock data displays correctly

### Demo Data

Navigation to `/consulting/bookings/booking-1` loads mock data:
- Service: "AI Implementation Strategy"
- Consultant: "Sarah Chen"
- Date: 2 days from now
- Meeting: Video call with Zoom link
- Status: Scheduled

## Performance

- **Bundle Size**: 5.76 kB (gzipped)
- **Lazy Loading**: Modals load on demand
- **Animations**: GPU-accelerated with Framer Motion
- **Image Optimization**: Using Next.js Image component

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratio > 4.5:1
- Focus indicators on all buttons
- Semantic HTML structure
- Loading states clearly indicated

## Related Pages

- `/consulting` - Service browsing and selection
- `/consulting/bookings` - Bookings list view
- `/consulting/[serviceId]/booking` - Booking form
- `/consulting/[serviceId]` - Service details
