# Service Detail Page - Code Reference Guide

## Quick API Reference

### Fetch Service Data

```typescript
// In your component
const [service, setService] = useState<ServiceDetail | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchService = async () => {
    try {
      const response = await fetch(`/api/consulting/services/${serviceId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  fetchService();
}, [serviceId]);
```

### Use Mock Data (Development)

```typescript
import { getMockService } from '@/lib/mockConsultingData';

// Get single service
const service = getMockService('business-strategy');

// Get all services
const allServices = getAllMockServices();

// Get services for list view
const services = getMockServicesList();
```

## Component Examples

### StarRating Component

Display a 5-star rating with numerical score:

```typescript
<StarRating rating={4.9} className="mb-4" />
```

**Props:**
- `rating: number` - Rating from 0-5
- `className?: string` - Additional Tailwind classes (optional)

**Output:**
```
⭐⭐⭐⭐⭐ 4.9
```

### ConsultantCard Component

Display a single consultant profile:

```typescript
<ConsultantCard 
  consultant={consultant}
  index={0}
/>
```

**Props:**
- `consultant: Consultant` - Consultant data object
- `index: number` - Index for stagger animation

**Consultant Object Structure:**
```typescript
{
  id: "consultant-001",
  name: "Jane Smith",
  bio: "Expert with 15+ years experience",
  expertise: ["Strategy", "Operations", "Growth"],
  hourlyRate: 150,
  rating: 4.9,
  yearsExperience: 15,
  bookingsCompleted: 287,
  avgReview: "Amazing consultant!"
}
```

### FAQItem Component

Expandable FAQ accordion item:

```typescript
<FAQItem 
  question="How do I book?"
  answer="Click the book button and select a time"
  index={0}
/>
```

**Props:**
- `question: string` - FAQ question
- `answer: string` - FAQ answer
- `index: number` - Index for stagger animation

## TypeScript Interfaces

### ServiceDetail
Complete service information with consultants:

```typescript
interface ServiceDetail {
  id: string;                    // Unique identifier
  name: string;                  // Service name
  description: string;           // Full description
  hourlyRate: number;           // Base hourly rate
  tags: string[];               // Service categories/tags
  consultants: Consultant[];    // Available consultants
}
```

### Consultant
Individual consultant profile:

```typescript
interface Consultant {
  id: string;                   // Unique consultant ID
  name: string;                 // Full name
  bio: string;                  // Short biography
  expertise: string[];          // Skills/expertise areas
  hourlyRate: number;          // Hourly rate (can differ from service)
  rating: number;              // Star rating (0-5)
  yearsExperience: number;     // Years in field
  bookingsCompleted: number;   // Total bookings
  avgReview: string;           // Quote from review
  avatar?: string;             // Optional avatar URL
}
```

## Animation Patterns

### Stagger Container

Animate children with delay between each:

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,      // 100ms between children
      delayChildren: 0.2         // Wait 200ms before starting
    }
  }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Card Hover Effect

Scale up with glow on hover:

```typescript
<motion.div
  whileHover={{
    y: -8,                           // Move up 8px
    boxShadow: '0 24px 48px rgba(34, 197, 94, 0.15)'  // Green glow
  }}
  className="transition-all duration-300"
>
  {content}
</motion.div>
```

### Smooth Expansion (Accordion)

Expand and collapse with smooth height animation:

```typescript
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  className="overflow-hidden"
>
  {expandedContent}
</motion.div>
```

## Styling Reference

### WISE² Colors

```typescript
// Primary accent (green)
bg-wise-accent-green         // #22C55E
text-wise-accent-green       // #22C55E
border-wise-accent-green     // #22C55E

// Backgrounds
bg-wise-bg-primary           // #050505 (black)
bg-wise-bg-secondary         // #0D1117 (dark blue)
bg-wise-card                 // #10151D (card background)

// Text
text-wise-text-primary       // #FFFFFF (white)
text-wise-text-secondary     // #C9CED6 (light gray)
text-wise-text-muted         // #8D98A5 (muted gray)

// Surfaces
wise-surface-3               // Darker surface for depth
```

### Gradient Backgrounds

```typescript
// Service hero gradient
bg-gradient-to-r from-white via-gray-100 to-gray-400
bg-clip-text text-transparent

// Card glassmorphism
style={{
  background: 'linear-gradient(135deg, rgba(16, 21, 29, 0.8) 0%, rgba(13, 17, 23, 0.6) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(39, 39, 39, 0.6)'
}}

// Accent gradient
bg-gradient-to-r from-wise-accent-green/20 to-blue-500/10
```

### Responsive Classes

```typescript
// Consultant grid - responsive columns
grid md:grid-cols-2 lg:grid-cols-3 gap-6

// Hero text - responsive sizes
text-5xl md:text-6xl

// Padding - responsive
px-6 py-8 md:px-8 md:py-12

// Width constraint
max-w-7xl mx-auto    // Center with max width
```

## Common Patterns

### Loading State

```typescript
if (loading) {
  return <LoadingSkeleton />;
}

// LoadingSkeleton component
const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-64 bg-wise-surface-3 rounded-2xl" />
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-96 bg-wise-surface-3 rounded-2xl" />
      ))}
    </div>
  </div>
);
```

### Error State

```typescript
if (error || !service) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-wise-accent-red/30 
                 bg-gradient-to-br from-red-900/10 to-red-800/5 p-6"
    >
      <AlertCircle className="text-wise-accent-red" size={24} />
      <p className="text-gray-400 mb-4">{error}</p>
      <motion.button
        onClick={() => router.push('/consulting')}
        className="px-4 py-2 bg-wise-accent-green text-wise-bg-primary 
                   font-bold rounded-lg hover:bg-green-600"
      >
        Back to Services
      </motion.button>
    </motion.div>
  );
}
```

### Navigation

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate to booking page
router.push(`/consulting/book?serviceId=${serviceId}`);

// Navigate back
router.back();

// Navigate to services list
router.push('/consulting');
```

## Hooks Usage

### useParams - Get URL Parameters

```typescript
import { useParams } from 'next/navigation';

const params = useParams();
const serviceId = params.serviceId as string;
```

### useRouter - Navigation

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/path');
router.back();
```

### useState - State Management

```typescript
const [service, setService] = useState<ServiceDetail | null>(null);
const [expanded, setExpanded] = useState<string | null>(null);

// Toggle expanded state
setExpanded(expanded === 'item1' ? null : 'item1');
```

### useEffect - Side Effects

```typescript
useEffect(() => {
  // Fetch data
  const fetchData = async () => {
    const data = await fetch('/api/...');
    setService(data);
  };
  
  fetchData();
}, [serviceId]);  // Dependency array
```

## API Routes

### Frontend Route: `/api/consulting/services/[serviceId]`

**File:** `apps/website/app/api/consulting/services/[serviceId]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { serviceId } = params;
  
  // Fetch from backend API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/consulting/services/${serviceId}`
  );
  
  return NextResponse.json(data);
}
```

### Expected Response

```json
{
  "id": "business-strategy",
  "name": "Business Strategy Consulting",
  "description": "...",
  "hourlyRate": 150,
  "tags": ["Strategy", "Growth"],
  "consultants": [
    {
      "id": "consultant-001",
      "name": "Jane Smith",
      "bio": "...",
      "expertise": ["Strategy", "Growth"],
      "hourlyRate": 150,
      "rating": 4.9,
      "yearsExperience": 15,
      "bookingsCompleted": 287,
      "avgReview": "..."
    }
  ]
}
```

## Testing Code Snippets

### Test Component Rendering

```typescript
import { render, screen } from '@testing-library/react';

test('displays service name', () => {
  const service = {
    id: '1',
    name: 'Test Service',
    description: 'Test description',
    hourlyRate: 100,
    tags: ['test'],
    consultants: []
  };
  
  render(<ServiceDetailPage service={service} />);
  expect(screen.getByText('Test Service')).toBeInTheDocument();
});
```

### Test API Response

```typescript
test('fetches service data', async () => {
  const mockData = {
    id: 'test-1',
    name: 'Test Service',
    // ... other fields
  };
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData)
    })
  );
  
  const result = await fetch('/api/consulting/services/test-1');
  expect(result.json()).resolves.toEqual(mockData);
});
```

## Performance Tips

### Optimize Re-renders

```typescript
// Use useCallback to memoize functions
const handleBook = useCallback(() => {
  router.push(`/consulting/book?serviceId=${serviceId}`);
}, [serviceId, router]);

// Use memo for expensive components
const ConsultantCard = React.memo(({ consultant, index }) => {
  // Component code
});
```

### Optimize Animations

```typescript
// Use transform and opacity only (GPU accelerated)
whileHover={{
  y: -8,  // Use transform instead of top/margin
  opacity: 1
}}

// Avoid these (CPU intensive)
// width, height, left, right, top, bottom
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={consultant.avatar}
  alt={consultant.name}
  width={64}
  height={64}
  className="rounded-full"
/>
```

## Debugging

### Console Logging

```typescript
// Log service data
console.log('Service loaded:', service);

// Log API response
console.log('API Response:', data);

// Log animation events
console.log('Animation triggered');
```

### DevTools Tips

1. **React DevTools**: Inspect component props and state
2. **Network Tab**: Check API requests/responses
3. **Performance Tab**: Record animations and profile
4. **Console**: Check for errors and warnings
5. **Elements Tab**: Inspect DOM structure and computed styles

### Common Debug Scenarios

**Service not loading:**
```typescript
// Check if serviceId is captured correctly
console.log('serviceId:', params.serviceId);

// Check if API endpoint is correct
console.log('Fetching from:', `/api/consulting/services/${serviceId}`);

// Check API response
.then(res => console.log('API Response:', res))
```

**Animations not working:**
```typescript
// Check if Framer Motion is imported
import { motion } from 'framer-motion';

// Verify motion components are used
<motion.div animate={{ ... }} />

// Check browser performance
// DevTools → Performance → Record animation
```

**Styling not applied:**
```typescript
// Check TailwindCSS classes
// Inspect element to see computed styles
// Check for CSS conflicts

// Verify class name format
className="text-wise-accent-green"  // Correct
// className="text-wise-green-500"  // Wrong
```

---

**Quick Links:**
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Docs](https://react.dev/)
- [Next.js Docs](https://nextjs.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

**Last Updated:** 2024
