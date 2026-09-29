# Consulting Service Detail Page - Development Guide

## Quick Start

### 1. View the Service Detail Page

Navigate to any of these example URLs in your browser:

```
http://localhost:3000/consulting/business-strategy
http://localhost:3000/consulting/marketing-strategy
http://localhost:3000/consulting/tech-leadership
http://localhost:3000/consulting/finance-operations
```

### 2. Using Mock Data for Development

When the backend API is not available, you can use mock data for local development:

```typescript
// In your page component or API route
import { getMockService } from '@/lib/mockConsultingData';

const service = getMockService(serviceId);
```

### 3. Mock Data Files

**Location:** `apps/website/lib/mockConsultingData.ts`

**Available Functions:**
- `getMockService(serviceId)` - Get a single service by ID
- `getAllMockServices()` - Get all services
- `getMockServicesList()` - Get services list view

### 4. Example Service Data Structure

```json
{
  "id": "business-strategy",
  "name": "Business Strategy Consulting",
  "description": "Transform your business with expert strategic guidance...",
  "hourlyRate": 150,
  "tags": ["Strategy", "Growth", "Operations", "Leadership", "Market Analysis"],
  "consultants": [
    {
      "id": "consultant-001",
      "name": "Jane Smith",
      "bio": "15-year veteran in business strategy and operations with 5 successful exits",
      "expertise": ["Business Strategy", "Operations", "Growth Hacking", "Leadership"],
      "hourlyRate": 150,
      "rating": 4.9,
      "yearsExperience": 15,
      "bookingsCompleted": 287,
      "avgReview": "Jane's strategic insights transformed our approach..."
    }
  ]
}
```

## API Integration

### Backend Endpoint Structure

The page expects your backend API to provide:

```
GET /api/v1/consulting/services/:serviceId
```

**Response Format:**
```typescript
{
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  tags: string[];
  consultants: Consultant[];
}
```

### Frontend API Route

**File:** `apps/website/app/api/consulting/services/[serviceId]/route.ts`

This acts as a proxy to your backend API:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  // Fetches from NEXT_PUBLIC_API_URL
}
```

## Testing Locally

### 1. Without Backend API

If you don't have a working backend API, modify the page to use mock data:

```typescript
// Temporarily replace the fetch with mock data
useEffect(() => {
  const mockData = getMockService(serviceId);
  if (mockData) {
    setService(mockData);
  }
  setLoading(false);
}, [serviceId]);
```

### 2. With Mock API Route

Create a mock API route that returns mock data:

```typescript
// app/api/consulting/services/mock/route.ts
import { getMockServicesList } from '@/lib/mockConsultingData';

export async function GET() {
  return NextResponse.json(getMockServicesList());
}
```

### 3. Browser DevTools Testing

**Check Network Requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to `/consulting/business-strategy`
4. Look for request to `/api/consulting/services/business-strategy`
5. Verify response structure matches expected format

## Component Testing

### Test the StarRating Component

```typescript
<StarRating rating={4.9} />
```

Should render:
- 5 stars filled (yellow)
- Rating text "4.9"

### Test the ConsultantCard Component

```typescript
<ConsultantCard 
  consultant={mockConsultingServices['business-strategy'].consultants[0]}
  index={0}
/>
```

Should render:
- Avatar placeholder
- Name and bio
- Star rating
- Expertise tags
- Stats (years, bookings, rate)
- Quote
- Book button

### Test the FAQItem Component

```typescript
<FAQItem 
  question="How do I schedule?"
  answer="Click book button..."
  index={0}
/>
```

Should render:
- Expandable question
- Smooth animation on expand
- Answer text when open

## Responsive Design Testing

### Mobile (375px)
```bash
# In Chrome DevTools, select iPhone 12 preset
```

Verify:
- Single column layout for consultants
- Large touch targets
- Readable text without horizontal scroll

### Tablet (768px)
Verify:
- 2-column grid for consultants
- Proper spacing and proportions

### Desktop (1920px+)
Verify:
- 3-column grid for consultants
- Full-width hero section
- Centered content with max-width

## Animation Testing

### Check Frame Rate

1. Open DevTools Performance tab
2. Start recording
3. Interact with page (hover cards, expand FAQ)
4. Stop recording
5. Verify 60fps (no dropped frames)

### Visual Animation Verification

- [ ] Page load: Fade-in stagger effect on cards
- [ ] Hover consultant card: Scale up with glow
- [ ] Hover info cards: Subtle border color change
- [ ] Click FAQ: Smooth expand/collapse
- [ ] Scroll: Background orbs move smoothly

## Performance Profiling

### Lighthouse Audit

```bash
# Run Lighthouse audit
# DevTools → Lighthouse → Generate report
```

Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Bundle Size

```bash
# Check which imports contribute to bundle
npx webpack-bundle-analyzer
```

## Common Issues & Solutions

### Issue: "Failed to fetch service"
**Cause:** API endpoint returning 404 or 5xx error
**Solution:** 
- Verify service ID exists in backend
- Check API URL in environment variables
- Look at network tab for actual error response

### Issue: "Service not found" error page
**Cause:** API returned 404
**Solution:**
- Verify the serviceId param is correct
- Create the service in backend if it doesn't exist
- Use mock data for testing

### Issue: Cards not animating
**Cause:** Framer Motion not loading correctly
**Solution:**
- Verify framer-motion is installed: `npm list framer-motion`
- Check if animations are disabled in browser settings
- Verify no CSS conflicts

### Issue: Responsive layout broken
**Cause:** TailwindCSS breakpoints not working
**Solution:**
- Clear TailwindCSS cache: `npm run build -- --reset-cache`
- Verify tailwind.config.js extends properly
- Check for CSS conflicts in globals.css

## Environment Setup

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Optional (for development)

```bash
# Use mock data in development
NEXT_USE_MOCK_DATA=true
```

## Database Schema (Backend Reference)

If building the backend, use this schema:

```sql
-- Services table
CREATE TABLE services (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  hourly_rate INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service tags
CREATE TABLE service_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id VARCHAR(100),
  tag VARCHAR(100),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Consultants
CREATE TABLE consultants (
  id VARCHAR(100) PRIMARY KEY,
  service_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  hourly_rate INT,
  rating DECIMAL(2,1),
  years_experience INT,
  bookings_completed INT DEFAULT 0,
  avg_review TEXT,
  avatar_url VARCHAR(500),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Consultant expertise
CREATE TABLE consultant_expertise (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultant_id VARCHAR(100),
  skill VARCHAR(100),
  FOREIGN KEY (consultant_id) REFERENCES consultants(id)
);
```

## Advanced Testing

### E2E Testing Example (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('service detail page loads correctly', async ({ page }) => {
  await page.goto('/consulting/business-strategy');
  
  // Check title
  const title = page.locator('h1');
  await expect(title).toContainText('Business Strategy');
  
  // Check consultant cards
  const cards = page.locator('[data-testid="consultant-card"]');
  await expect(cards).toHaveCount(3);
  
  // Check animations
  const card = cards.first();
  await card.hover();
  await expect(card).toHaveClass(/hover:scale-up/);
});
```

### Unit Testing Example (Jest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { ConsultantCard } from '@/app/consulting/[serviceId]/page';

test('consultant card displays name', () => {
  const consultant = {
    id: '1',
    name: 'Jane Smith',
    // ... other props
  };
  
  render(<ConsultantCard consultant={consultant} index={0} />);
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});
```

## Next Steps

1. **Setup Backend API**: Implement `/v1/consulting/services/[id]` endpoint
2. **Connect Database**: Map services and consultants from your database
3. **Add Booking Flow**: Create `/consulting/book` page
4. **Add Authentication**: Protect booking routes with auth
5. **Add Real Reviews**: Replace mock reviews with real client feedback
6. **Analytics**: Track page views, bookings, conversions
7. **Email Integration**: Send booking confirmations

## Support & Questions

For issues or questions about the implementation, refer to:
- `SERVICE_DETAIL_PAGE.md` - Full documentation
- `mockConsultingData.ts` - Example data structure
- Browser DevTools Network tab - API request/response debugging

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready
