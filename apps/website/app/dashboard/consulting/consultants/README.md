# Admin Consultant Management System

This directory contains the admin consultant management page for WISE² Core v1.0.

## Files

- **page.tsx** - Main consultant management page with table, filters, and modals
- **API routes** - Endpoints for CRUD operations on consultants

## Features

### 1. Consultant List View
- **Table Display**: Shows all consultants with key information
  - Name
  - Email
  - Expertise (with truncation for 2+)
  - Hourly Rate
  - Active Status
  - Action buttons (Edit, Deactivate)

- **Search & Filter**
  - Search by name or email
  - Filter by expertise area
  - Pagination (10 items per page)
  - Real-time filtering with page reset

### 2. Add New Consultant
- **Modal Form** with fields:
  - Full Name (required)
  - Email (required, unique validation)
  - Bio (optional)
  - Areas of Expertise (multi-select, required)
  - Hourly Rate (required)

- **Expertise Options**: Strategy, Product, Engineering, Design, Marketing, Sales, Operations, Finance, HR, Legal, AI/ML, DevOps

### 3. Edit Consultant
- Modal prefilled with current consultant data
- Same validation as add form
- Update individual or multiple fields
- Preserves expertise selections

### 4. Deactivate Consultant
- Soft delete with confirmation modal
- Consultant remains in system but marked inactive
- Can be reactivated by editing and toggling active status
- Prevents them from accepting new bookings

### 5. Statistics Dashboard
- Total consultants count
- Active consultants count
- Average hourly rate

## API Endpoints

### GET /api/admin/consultants
Fetch all consultants

**Response:**
```json
{
  "consultants": [
    {
      "id": "1",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "bio": "Product strategy expert...",
      "expertise": ["Product", "Strategy"],
      "hourlyRate": 250,
      "isActive": true,
      "createdAt": "2024-06-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ],
  "count": 3
}
```

### POST /api/admin/consultants
Create new consultant

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Optional bio text",
  "expertise": ["Strategy", "Engineering"],
  "hourlyRate": 200
}
```

**Response:** 201 Created - Returns created consultant object

### PUT /api/admin/consultants/[id]
Update consultant

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Updated bio",
  "expertise": ["Strategy", "Engineering", "Product"],
  "hourlyRate": 250,
  "isActive": true
}
```

**Response:** 200 OK - Returns updated consultant object

### DELETE /api/admin/consultants/[id]
Deactivate consultant (soft delete)

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Consultant deactivated"
}
```

### GET /api/admin/consultants/[id]
Get single consultant details

**Response:** 200 OK - Returns consultant object

## Database Schema (Prisma)

Recommended Prisma schema for production:

```prisma
model Consultant {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(255)
  email     String   @unique @db.VarChar(255)
  bio       String?  @db.Text
  expertise String[] // Array of expertise tags
  hourlyRate Float
  isActive  Boolean  @default(true)
  
  // Calendar/Availability
  availabilityCalendarData Json? // ICS data or JSON calendar
  timezone  String   @default("UTC")
  
  // Relationships
  bookings  Booking[]
  reviews   Review[]
  
  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@index([isActive])
}

model Booking {
  id          String     @id @default(cuid())
  consultant  Consultant @relation(fields: [consultantId], references: [id])
  consultantId String
  user        User       @relation(fields: [userId], references: [id])
  userId      String
  
  startTime   DateTime
  endTime     DateTime
  title       String
  description String?
  status      String     @default("scheduled") // scheduled, completed, canceled
  
  // Pricing
  hourlyRate  Float      // Snapshot of rate at booking time
  totalCost   Float      // Calculated from duration * hourlyRate
  
  // Meeting
  meetingLink String?    // Zoom, Google Meet, etc.
  notes       String?    @db.Text
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@index([consultantId])
  @@index([userId])
  @@index([status])
  @@index([startTime])
}

model Review {
  id          String     @id @default(cuid())
  consultant  Consultant @relation(fields: [consultantId], references: [id])
  consultantId String
  user        User       @relation(fields: [userId], references: [id])
  userId      String
  booking     Booking?   @relation(fields: [bookingId], references: [id])
  bookingId   String?
  
  rating      Int        // 1-5 stars
  comment     String?    @db.Text
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@unique([bookingId]) // One review per booking
  @@index([consultantId])
  @@index([rating])
}
```

## Database Schema (SQL)

If using raw SQL:

```sql
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  expertise TEXT[] NOT NULL, -- PostgreSQL array or JSON in other DBs
  hourly_rate DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  availability_calendar_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_is_active ON consultants(is_active);
CREATE INDEX idx_consultants_created_at ON consultants(created_at DESC);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
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

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_consultant_id ON reviews(consultant_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

## Implementation Checklist

- [ ] Add authentication middleware to API routes (admin role check)
- [ ] Implement database persistence (replace mock data)
- [ ] Add email validation and uniqueness check
- [ ] Implement availability calendar integration
- [ ] Add consultant profile images/avatars
- [ ] Create consultant public profile pages
- [ ] Add booking functionality
- [ ] Implement review/rating system
- [ ] Add calendar view for consultant availability
- [ ] Create booking confirmation emails
- [ ] Add payment processing (Stripe)
- [ ] Implement consultant dashboard
- [ ] Add activity history and audit logs
- [ ] Create consultant performance metrics
- [ ] Add bulk operations (export, import)
- [ ] Implement role-based access control (RBAC)

## Usage

### Access the Page
Navigate to `/dashboard/consulting/consultants` (requires admin authentication)

### Add a Consultant
1. Click "Add New Consultant" button
2. Fill in form fields
3. Select expertise areas (multiple)
4. Set hourly rate
5. Click "Save Consultant"

### Edit a Consultant
1. Click "Edit" button on table row
2. Modify desired fields
3. Click "Save Consultant"

### Deactivate a Consultant
1. Click "Deactivate" button on table row
2. Confirm in modal
3. Consultant becomes inactive (can still view history)

### Search & Filter
- Type in search box to find by name or email
- Select expertise from dropdown to filter
- Pagination handles large lists

## Styling & Design

- Dark theme using WISE² brand colors
- Emerald green (#10b981) for primary actions
- Tailwind CSS utility classes
- Responsive grid layouts
- Hover states and transitions
- Loading and error states

## Dependencies

- React 18+
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS

## Notes

- Current implementation uses mock data in memory
- **For production**: Replace with actual database calls
- Add proper authentication/authorization checks
- Implement email notifications for consultants
- Consider adding activity audit trails
- Add rate limiting to API endpoints
- Implement backup and disaster recovery
