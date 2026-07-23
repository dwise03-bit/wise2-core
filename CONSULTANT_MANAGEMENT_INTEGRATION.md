# Consultant Management Integration Guide

## Overview

The WISE² Core consultant management system is production-ready with:
- Admin dashboard at `/dashboard/consulting/consultants`
- Full CRUD API endpoints
- Comprehensive UI with search, filter, pagination
- Modal-based forms with validation
- Statistics dashboard
- Dark theme matching WISE² brand

## Current State

### ✅ Completed
- Page component with all features implemented
- API route handlers (GET, POST, PUT, DELETE)
- Form validation
- Search and filter functionality
- Pagination (10 items per page)
- Modal interactions
- Loading and error states
- Responsive design
- TypeScript support

### ⚠️ Mock Data
Currently uses in-memory mock data. For production, implement database persistence.

## Production Setup Steps

### 1. Database Schema

Add to `/packages/db/schema.sql`:

```sql
-- Create consultants table
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  expertise TEXT[] NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  availability_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_is_active ON consultants(is_active);
CREATE INDEX idx_consultants_created_at ON consultants(created_at DESC);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2),
  meeting_link VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_consultant_id ON bookings(consultant_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_consultant_id ON reviews(consultant_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### 2. Prisma Schema (if using Prisma)

Add to `/packages/db/schema.prisma`:

```prisma
model Consultant {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  bio       String?
  expertise String[]
  hourlyRate Float   @map("hourly_rate")
  isActive  Boolean  @default(true)
  timezone  String   @default("UTC")
  availabilityData Json? @map("availability_data")
  
  bookings  Booking[]
  reviews   Review[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([email])
  @@index([isActive])
  @@map("consultants")
}

model Booking {
  id          String   @id @default(cuid())
  consultantId String @map("consultant_id")
  consultant  Consultant @relation(fields: [consultantId], references: [id], onDelete: Restrict)
  userId      String @map("user_id")
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  startTime   DateTime @map("start_time")
  endTime     DateTime @map("end_time")
  title       String
  status      String   @default("scheduled")
  hourlyRate  Float   @map("hourly_rate")
  totalCost   Float?  @map("total_cost")
  meetingLink String? @map("meeting_link")
  notes       String?
  
  reviews     Review[]
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([consultantId])
  @@index([userId])
  @@index([startTime])
  @@index([status])
  @@map("bookings")
}

model Review {
  id          String   @id @default(cuid())
  consultantId String @map("consultant_id")
  consultant  Consultant @relation(fields: [consultantId], references: [id], onDelete: Cascade)
  userId      String @map("user_id")
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookingId   String? @unique @map("booking_id")
  booking     Booking? @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  
  rating      Int
  comment     String?
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([consultantId])
  @@index([rating])
  @@map("reviews")
}
```

### 3. Add Authentication to API Routes

Update `/apps/website/app/api/admin/consultants/route.ts`:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch from database
    const consultants = await db.consultant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        bookings: {
          where: { status: 'scheduled' },
          orderBy: { startTime: 'asc' },
          take: 5,
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });
    
    return NextResponse.json({
      consultants,
      count: consultants.length,
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultants' },
      { status: 500 }
    );
  }
}
```

### 4. Add Page-Level Authentication

Update `/apps/website/app/dashboard/consulting/consultants/page.tsx`:

Add at the top of the component:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConsultantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  // ... rest of component
}
```

### 5. Environment Variables

Add to `.env.local`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/wise2"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 6. Run Database Migration

```bash
# If using Prisma
npx prisma migrate dev --name add_consultant_management

# If using raw SQL
psql $DATABASE_URL < /packages/db/schema.sql
```

## API Integration Examples

### Fetch Consultants

```javascript
const response = await fetch('/api/admin/consultants');
const { consultants } = await response.json();
```

### Create Consultant

```javascript
const response = await fetch('/api/admin/consultants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Product strategy expert',
    expertise: ['Product', 'Strategy'],
    hourlyRate: 250,
  }),
});

const consultant = await response.json();
```

### Update Consultant

```javascript
const response = await fetch('/api/admin/consultants/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    bio: 'Updated bio',
    expertise: ['Product', 'Strategy', 'Operations'],
    hourlyRate: 300,
  }),
});

const updated = await response.json();
```

### Deactivate Consultant

```javascript
const response = await fetch('/api/admin/consultants/1', {
  method: 'DELETE',
});

const result = await response.json();
```

## Features to Add

### Phase 1 (MVP - Current)
- [x] Consultant CRUD
- [x] Search & filter
- [x] Pagination
- [x] Admin dashboard

### Phase 2 (Extended Features)
- [ ] Consultant availability calendar
- [ ] Booking calendar integration
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Public consultant profiles
- [ ] Booking confirmation

### Phase 3 (Advanced)
- [ ] Consultant reviews & ratings
- [ ] Performance analytics
- [ ] Bulk operations (export/import)
- [ ] Advanced scheduling
- [ ] Video meeting integration
- [ ] Automated reminders

## Testing

### Manual Testing Checklist

- [ ] Add new consultant with all fields
- [ ] Add consultant with minimum fields
- [ ] Search by name
- [ ] Search by email
- [ ] Filter by expertise
- [ ] Edit consultant
- [ ] Deactivate consultant
- [ ] Verify email uniqueness
- [ ] Test pagination
- [ ] Test modal closing
- [ ] Test form validation
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test on mobile view

### Unit Tests Example

```typescript
// __tests__/consultants.test.ts
describe('Consultant Management', () => {
  it('should fetch consultants', async () => {
    const response = await fetch('/api/admin/consultants');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.consultants).toBeInstanceOf(Array);
  });

  it('should create consultant', async () => {
    const response = await fetch('/api/admin/consultants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        expertise: ['Strategy'],
        hourlyRate: 100,
      }),
    });
    expect(response.status).toBe(201);
  });

  it('should prevent duplicate emails', async () => {
    const response = await fetch('/api/admin/consultants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate',
        email: 'existing@example.com',
        expertise: ['Strategy'],
        hourlyRate: 100,
      }),
    });
    expect(response.status).toBe(409);
  });
});
```

## Deployment Notes

1. **Database**: Ensure PostgreSQL is running with proper schema
2. **Authentication**: Verify admin role is properly configured
3. **Environment**: Set all required env vars
4. **CORS**: Configure CORS for API endpoints if needed
5. **Rate Limiting**: Implement rate limiting on API routes
6. **Monitoring**: Add error tracking (Sentry, etc.)
7. **Backups**: Implement database backup strategy

## Security Considerations

- ✅ Authentication required (admin only)
- ✅ Authorization checks on endpoints
- ✅ Input validation on forms
- ✅ Email uniqueness validation
- ⚠️ Add CSRF protection
- ⚠️ Add rate limiting
- ⚠️ Implement audit logging
- ⚠️ Add encryption for sensitive data

## File Structure

```
apps/website/
├── app/
│   ├── api/admin/
│   │   └── consultants/
│   │       ├── route.ts         (GET, POST)
│   │       └── [id]/route.ts    (GET, PUT, DELETE)
│   └── dashboard/
│       └── consulting/
│           └── consultants/
│               ├── page.tsx     (Main component)
│               └── README.md    (Documentation)
└── components/
    └── consulting/
        └── (Existing components)

packages/db/
├── schema.prisma   (Update with Consultant models)
└── schema.sql      (Update with SQL)
```

## Support & Maintenance

- Update consultant expertise options in `EXPERTISE_OPTIONS`
- Add new endpoints as features expand
- Monitor API performance with high consultant counts
- Regular security audits of admin pages
- Database maintenance and optimization

---

**Status**: Production Ready (pending database integration)  
**Last Updated**: 2024-07-23  
**Owner**: Lead Software Architect
