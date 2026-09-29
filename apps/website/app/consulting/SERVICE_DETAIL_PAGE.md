# Service Detail Page - Implementation Guide

## Overview

The Service Detail Page (`/consulting/[serviceId]`) is a dynamic Next.js page that displays comprehensive information about a consulting service and lists available consultants.

## Location

```
apps/website/app/consulting/[serviceId]/page.tsx
```

## Features

### 1. **Service Information Display**
- Service name with gradient text effect
- Full description
- Starting hourly rate with highlighted pricing card
- Service tags/categories with green accent styling

### 2. **Consultant Profiles**
Each consultant card displays:
- **Profile Card**: Name, bio, avatar placeholder with gradient
- **Star Rating**: 5-star rating system with numerical score
- **Expertise Tags**: Up to 3 main skills, with "+more" indicator
- **Quick Stats**:
  - Years of experience
  - Number of bookings completed
  - Hourly rate
- **Average Review Quote**: Client feedback snippet
- **Book Button**: CTA with hover animation

### 3. **Design & Animation**
- **WISE² Color System**:
  - Primary accent: `#22C55E` (wise-accent-green)
  - Dark backgrounds: `#050505`, `#0D1117`
  - Surface cards: `#10151D`
  - Text: White (`#FFFFFF`), muted gray (`#8D98A5`)

- **Animations**:
  - Fade-in stagger effect for cards
  - Hover scale and glow effects
  - Floating background orbs
  - Smooth transitions using Framer Motion

### 4. **State Management**
- Loading state with skeleton loader
- Error handling with user-friendly messages
- Responsive data fetching from `/api/consulting/services/[serviceId]`

### 5. **Responsive Design**
- Mobile-first approach
- Tablet optimizations
- Desktop grid layout (3 columns for consultants)
- Proper spacing and typography scaling

## API Integration

### Endpoint: `GET /api/consulting/services/[serviceId]`

**Request:**
```bash
GET /api/consulting/services/{serviceId}
```

**Response Format:**
```json
{
  "id": "service-001",
  "name": "Business Strategy Consulting",
  "description": "Expert guidance on business strategy, growth, and operations...",
  "hourlyRate": 150,
  "tags": ["Strategy", "Growth", "Operations", "Leadership"],
  "consultants": [
    {
      "id": "consultant-001",
      "name": "Jane Smith",
      "bio": "15-year veteran in business strategy and operations",
      "expertise": ["Business Strategy", "Operations", "Leadership", "Growth"],
      "hourlyRate": 150,
      "rating": 4.9,
      "yearsExperience": 15,
      "bookingsCompleted": 287,
      "avgReview": "Jane's strategic insights transformed our approach. Highly recommended!"
    }
  ]
}
```

### API Route Files
- `apps/website/app/api/consulting/services/route.ts` - List all services
- `apps/website/app/api/consulting/services/[serviceId]/route.ts` - Fetch single service

## Component Structure

### Main Components

#### 1. **StarRating**
Renders a 5-star rating display with numerical score.
```tsx
<StarRating rating={consultant.rating} />
```

#### 2. **ConsultantCard**
Displays individual consultant profile with animation variants.
```tsx
<ConsultantCard consultant={consultant} index={0} />
```

#### 3. **FAQItem**
Expandable FAQ accordion item with smooth animations.
```tsx
<FAQItem question="How do I schedule?" answer="Click book..." index={0} />
```

## Key TypeScript Interfaces

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
  avgReview: string;
  avatar?: string;
}

interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  tags: string[];
  consultants: Consultant[];
}
```

## Usage Examples

### Access a Service
```
/consulting/business-strategy
/consulting/tech-leadership
/consulting/marketing-strategy
```

### Fetching Data
The page automatically fetches data on mount using the service ID from the URL:
```typescript
const serviceId = params.serviceId as string;
const response = await fetch(`/api/consulting/services/${serviceId}`);
```

### Navigation
- **Back Button**: Returns to previous page
- **Book CTA**: Routes to `/consulting/book?serviceId={serviceId}`
- **Consultant Card**: Can be extended with individual consultant profiles

## Styling Details

### Tailwind Classes Used
- `wise-bg-primary`: `#050505`
- `wise-bg-secondary`: `#0D1117`
- `wise-card`: `#10151D`
- `wise-accent-green`: `#22C55E`
- `wise-surface-3`: Surface variant for depth

### Custom Gradients
- **Background Orbs**: Radial gradients for ambient effect
- **Text Gradient**: From white to gray for headings
- **Card Gradient**: Layered gradient with backdrop blur

### Animations
- **Stagger Container**: Delays children for sequential animation
- **Hover Effects**: Scale up with green glow shadow
- **Loading State**: Pulse animation on skeleton
- **FAQ Expansion**: Smooth height animation with ChevronDown rotation

## Features to Extend

### 1. **Availability Calendar**
Add a calendar widget showing consultant availability for booking.

### 2. **Review Section**
Display full reviews and ratings from past clients with pagination.

### 3. **Comparison Tool**
Allow users to compare multiple consultants side-by-side.

### 4. **Filtering**
Filter consultants by expertise, rating, hourly rate, or availability.

### 5. **Integration with Booking System**
Connect to calendar/scheduling API for real-time booking.

### 6. **Live Chat**
Add chat support to ask questions before booking.

## Performance Considerations

- **Image Optimization**: Avatar placeholders are CSS-based (no image CDN calls)
- **Animation Performance**: Using Framer Motion's optimized transforms
- **Lazy Loading**: FAQ items expand on demand
- **Responsive Images**: No external images reduce bandwidth

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Added to interactive elements
- **Color Contrast**: Meets WCAG AA standards
- **Keyboard Navigation**: All buttons and links are keyboard accessible
- **Focus States**: Visible focus indicators on interactive elements

## Testing Checklist

- [ ] Load service with valid ID
- [ ] Load service with invalid ID (error state)
- [ ] Check responsive layout on mobile, tablet, desktop
- [ ] Verify all animations run smoothly
- [ ] Test hover states on cards
- [ ] Verify FAQ accordion functionality
- [ ] Test navigation back button
- [ ] Verify CTA button routing
- [ ] Check loading skeleton appearance
- [ ] Test with slow network (throttle)

## Environment Variables

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Related Pages

- `/consulting` - Services listing page
- `/consulting/book` - Booking confirmation page
- `/consulting/[consultantId]` - Individual consultant profile (future)

## Dependencies

- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `next/navigation` - Router and params
- TailwindCSS - Styling
- React 18+ - Component framework

## Future Enhancements

1. **Real-time Availability**: Connect to calendar API
2. **Payment Integration**: Stripe for consultation booking
3. **Video Consultation**: Support for Zoom/Meet integration
4. **Testimonials**: Client success stories with metrics
5. **Analytics**: Track page views, bookings, and conversions
6. **Multi-language**: Support for international consultants
7. **Rating System**: Real client reviews and feedback
8. **Recommendation Engine**: Suggest best-fit consultant based on needs
