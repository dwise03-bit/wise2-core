# Post-Call Service Testing Guide

## Overview

Complete testing guide for the Post-Call Automation Service covering unit tests, integration tests, and manual testing.

## Test Files Structure

```
packages/api/src/v1/consulting/__tests__/
├── postcall.service.spec.ts
├── postcall.controller.spec.ts
├── postcall.scheduler.spec.ts
└── fixtures/
    ├── booking.fixture.ts
    ├── summary.fixture.ts
    └── responses.fixture.ts
```

## Unit Tests

### Service Tests (postcall.service.spec.ts)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PostCallSummaryService } from '../postcall.service';
import { PrismaService } from '@app/common/prisma.service';
import { EmailService } from '../../email/email.service';
import { QueueService } from '@app/queue/queue.service';
import { ConfigService } from '@nestjs/config';

describe('PostCallSummaryService', () => {
  let service: PostCallSummaryService;
  let prisma: PrismaService;
  let email: EmailService;
  let queue: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostCallSummaryService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            postCallSummary: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            actionItem: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPostCallSummary: jest.fn(),
            send: jest.fn(),
          },
        },
        {
          provide: QueueService,
          useValue: {
            enqueueJob: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                ANTHROPIC_API_KEY: 'test-key',
                GOOGLE_SERVICE_ACCOUNT_KEY: '{}',
                FRONTEND_URL: 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PostCallSummaryService>(PostCallSummaryService);
    prisma = module.get<PrismaService>(PrismaService);
    email = module.get<EmailService>(EmailService);
    queue = module.get<QueueService>(QueueService);
  });

  describe('checkAndProcessPastBookings', () => {
    it('should find bookings 2-3 hours after end time', async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const mockBooking = {
        id: 'booking_1',
        status: 'completed',
        endTime: twoHoursAgo,
        postCallSummary: null,
        user: { id: 'user_1', email: 'user@example.com', name: 'John Doe' },
        consultant: { id: 'consultant_1', email: 'consultant@example.com', name: 'Jane Smith' },
        service: { id: 'service_1', name: 'AI Strategy' },
      };

      jest.spyOn(prisma.booking, 'findMany').mockResolvedValue([mockBooking]);
      jest.spyOn(queue, 'enqueueJob').mockResolvedValue('job_1');

      const result = await service.checkAndProcessPastBookings();

      expect(result).toBe(1);
      expect(prisma.booking.findMany).toHaveBeenCalled();
      expect(queue.enqueueJob).toHaveBeenCalledWith(
        'PROCESS_POST_CALL_SUMMARY',
        { bookingId: 'booking_1' },
        expect.any(Object),
      );
    });

    it('should skip bookings that already have summaries', async () => {
      const mockBooking = {
        id: 'booking_2',
        status: 'completed',
        postCallSummary: { id: 'summary_1' }, // Already has summary
      };

      jest.spyOn(prisma.booking, 'findMany').mockResolvedValue([mockBooking]);

      const result = await service.checkAndProcessPastBookings();

      expect(result).toBe(0);
      expect(queue.enqueueJob).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(prisma.booking, 'findMany').mockRejectedValue(new Error('DB Error'));

      await expect(service.checkAndProcessPastBookings()).rejects.toThrow('DB Error');
    });
  });

  describe('processPostCallSummary', () => {
    it('should process a booking and generate summary', async () => {
      const mockBooking = {
        id: 'booking_1',
        userId: 'user_1',
        consultantId: 'consultant_1',
        serviceId: 'service_1',
        startTime: new Date(),
        endTime: new Date(),
        durationHours: 1,
        notes: 'Test notes',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        user: { id: 'user_1', email: 'user@example.com', name: 'John Doe' },
        consultant: { id: 'consultant_1', email: 'consultant@example.com', name: 'Jane Smith' },
        service: { id: 'service_1', name: 'AI Strategy', hourlyRate: 100 },
        postCallSummary: null,
      };

      jest.spyOn(prisma.booking, 'findUnique').mockResolvedValue(mockBooking);
      jest.spyOn(prisma.postCallSummary, 'create').mockResolvedValue({
        id: 'summary_1',
        bookingId: 'booking_1',
        summary: 'Test summary',
        actionItems: [],
      });
      jest.spyOn(email, 'sendPostCallSummary').mockResolvedValue({ success: true });
      jest.spyOn(prisma.postCallSummary, 'update').mockResolvedValue({});

      await service.processPostCallSummary('booking_1');

      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking_1' },
        include: expect.any(Object),
      });
      expect(prisma.postCallSummary.create).toHaveBeenCalled();
      expect(email.sendPostCallSummary).toHaveBeenCalled();
    });

    it('should skip if summary already exists', async () => {
      const mockBooking = {
        id: 'booking_2',
        postCallSummary: { id: 'summary_1' },
      };

      jest.spyOn(prisma.booking, 'findUnique').mockResolvedValue(mockBooking);

      await service.processPostCallSummary('booking_2');

      expect(prisma.postCallSummary.create).not.toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      const mockBooking = {
        id: 'booking_1',
        userId: 'user_1',
        postCallSummary: null,
      };

      jest.spyOn(prisma.booking, 'findUnique').mockResolvedValue(mockBooking);
      jest.spyOn(prisma.postCallSummary, 'create').mockRejectedValue(new Error('DB Error'));
      jest.spyOn(queue, 'enqueueJob').mockResolvedValue('job_retry');

      await expect(service.processPostCallSummary('booking_1')).rejects.toThrow('DB Error');
      expect(queue.enqueueJob).toHaveBeenCalledWith(
        'PROCESS_POST_CALL_SUMMARY',
        expect.objectContaining({ bookingId: 'booking_1' }),
        expect.any(Object),
      );
    });
  });

  describe('completeActionItem', () => {
    it('should mark action item as completed', async () => {
      const mockActionItem = { id: 'action_1', completed: false };

      jest.spyOn(prisma.actionItem, 'findUnique').mockResolvedValue(mockActionItem);
      jest.spyOn(prisma.actionItem, 'update').mockResolvedValue({ ...mockActionItem, completed: true });

      await service.completeActionItem('action_1');

      expect(prisma.actionItem.update).toHaveBeenCalledWith({
        where: { id: 'action_1' },
        data: { completed: true },
      });
    });

    it('should throw if action item not found', async () => {
      jest.spyOn(prisma.actionItem, 'findUnique').mockResolvedValue(null);

      await expect(service.completeActionItem('action_999')).rejects.toThrow('Action item not found');
    });
  });

  describe('getActionItemStats', () => {
    it('should calculate completion statistics', async () => {
      const mockSummary = {
        id: 'summary_1',
        actionItems: [
          { id: 'a1', owner: 'user', completed: true },
          { id: 'a2', owner: 'user', completed: false },
          { id: 'a3', owner: 'consultant', completed: false },
          { id: 'a4', owner: 'consultant', completed: false },
          { id: 'a5', owner: 'user', completed: false, dueDate: new Date('2024-07-01') },
        ],
      };

      jest.spyOn(prisma.postCallSummary, 'findUnique').mockResolvedValue(mockSummary);

      const stats = await service.getActionItemStats('booking_1');

      expect(stats).toEqual({
        total: 5,
        completed: 1,
        remaining: 4,
        completionPercentage: 20,
        userOwned: 3,
        consultantOwned: 2,
        overdueDates: expect.arrayContaining([
          expect.objectContaining({ id: 'a5' }),
        ]),
      });
    });
  });
});
```

### Controller Tests (postcall.controller.spec.ts)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PostCallController } from '../postcall.controller';
import { PostCallSummaryService } from '../postcall.service';

describe('PostCallController', () => {
  let controller: PostCallController;
  let service: PostCallSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCallController],
      providers: [
        {
          provide: PostCallSummaryService,
          useValue: {
            getPostCallSummary: jest.fn(),
            getActionItemStats: jest.fn(),
            completeActionItem: jest.fn(),
            updateActionItem: jest.fn(),
            processPostCallSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostCallController>(PostCallController);
    service = module.get<PostCallSummaryService>(PostCallSummaryService);
  });

  describe('GET /post-call/:bookingId', () => {
    it('should return post-call summary', async () => {
      const mockSummary = {
        id: 'summary_1',
        bookingId: 'booking_1',
        summary: 'Test summary',
        actionItems: [],
      };

      jest.spyOn(service, 'getPostCallSummary').mockResolvedValue(mockSummary);

      const result = await controller.getPostCallSummary('booking_1', { user: { id: 'user_1' } });

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockSummary);
    });
  });

  describe('PATCH /post-call/action-items/:actionItemId/complete', () => {
    it('should mark action item as completed', async () => {
      jest.spyOn(service, 'completeActionItem').mockResolvedValue(undefined);

      const result = await controller.completeActionItem('action_1', { user: { id: 'user_1' } });

      expect(result.status).toBe('success');
      expect(result.message).toBe('Action item marked as completed');
    });
  });
});
```

## Integration Tests

### End-to-End Test Scenario

```typescript
describe('Post-Call Service E2E', () => {
  describe('Complete workflow', () => {
    it('should process a booking from completion to email', async () => {
      // 1. Create a test booking
      const booking = await createTestBooking({
        userId: 'user_1',
        consultantId: 'consultant_1',
        serviceId: 'service_1',
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: 'completed',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      });

      // 2. Trigger post-call processing
      await service.processPostCallSummary(booking.id);

      // 3. Verify summary was created
      const summary = await prisma.postCallSummary.findUnique({
        where: { bookingId: booking.id },
        include: { actionItems: true },
      });

      expect(summary).toBeDefined();
      expect(summary.summary).toBeTruthy();
      expect(summary.actionItems.length).toBeGreaterThan(0);

      // 4. Verify action items
      const stats = await service.getActionItemStats(booking.id);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.completionPercentage).toBe(0);

      // 5. Mark one item as complete
      await service.completeActionItem(summary.actionItems[0].id);

      // 6. Verify stats updated
      const updatedStats = await service.getActionItemStats(booking.id);
      expect(updatedStats.completed).toBe(1);
      expect(updatedStats.completionPercentage).toBeGreaterThan(0);
    });
  });
});
```

## Manual Testing

### Test Environment Setup

```bash
# 1. Start local database
docker-compose up -d postgres

# 2. Run migrations
cd packages/db
npx prisma migrate dev

# 3. Seed test data
npx prisma db seed

# 4. Start API
cd ../..
npm run start:dev
```

### Test Scenarios

#### Scenario 1: Process a Completed Booking

```bash
# 1. Create a booking
BOOKING_ID=$(curl -s -X POST http://localhost:3000/v1/consulting/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "consultantId": "consultant_1",
    "serviceId": "service_1",
    "startTime": "'$(date -u -d '2 days ago' +%Y-%m-%dT%H:%M:%SZ)'",
    "durationHours": 1
  }' | jq -r '.data.id')

echo "Created booking: $BOOKING_ID"

# 2. Mark as completed (database)
sqlite3 wise2.db "UPDATE bookings SET status='completed' WHERE id='$BOOKING_ID'"

# 3. Wait 2-3 hours or trigger manually
curl -X PATCH http://localhost:3000/v1/consulting/post-call/$BOOKING_ID/process \
  -H "Authorization: Bearer $TOKEN"

# 4. Check summary
curl -s http://localhost:3000/v1/consulting/post-call/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

#### Scenario 2: Action Item Lifecycle

```bash
# 1. Get summary with action items
SUMMARY=$(curl -s http://localhost:3000/v1/consulting/post-call/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN")

FIRST_ITEM=$(echo $SUMMARY | jq -r '.data.actionItems[0].id')

# 2. View stats (0% completion)
curl -s http://localhost:3000/v1/consulting/post-call/$BOOKING_ID/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# 3. Mark item as complete
curl -X PATCH http://localhost:3000/v1/consulting/post-call/action-items/$FIRST_ITEM/complete \
  -H "Authorization: Bearer $TOKEN"

# 4. View updated stats
curl -s http://localhost:3000/v1/consulting/post-call/$BOOKING_ID/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.data.completionPercentage'
```

#### Scenario 3: Error Handling

```bash
# Test with invalid booking ID
curl -s http://localhost:3000/v1/consulting/post-call/invalid_id \
  -H "Authorization: Bearer $TOKEN" | jq '.error'

# Test without authorization
curl -s http://localhost:3000/v1/consulting/post-call/$BOOKING_ID | jq '.status'

# Test with invalid action item
curl -X PATCH http://localhost:3000/v1/consulting/post-call/action-items/invalid/complete \
  -H "Authorization: Bearer $TOKEN" | jq '.error'
```

## Performance Testing

### Load Test with k6

```javascript
// tests/postcall-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up
    { duration: '1m', target: 50 },   // Peak
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const bookingId = 'booking_test_' + __ENV.BOOKING_ID;
  const token = __ENV.TOKEN;

  // Test GET endpoint
  const getRes = http.get(
    `http://localhost:3000/v1/consulting/post-call/${bookingId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  check(getRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test PATCH endpoint
  const patchRes = http.patch(
    `http://localhost:3000/v1/consulting/post-call/action-items/action_1/complete`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  check(patchRes, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

Run load test:

```bash
k6 run tests/postcall-load.js --env BOOKING_ID=booking_1 --env TOKEN=$JWT_TOKEN
```

## Testing Checklist

- [ ] Unit tests pass: `npm run test:unit`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] API endpoints accessible
- [ ] Email templates render correctly
- [ ] Action items created and tracked
- [ ] Error handling works (bad requests, not found, etc.)
- [ ] Rate limiting works
- [ ] Authentication required
- [ ] Database transactions atomic
- [ ] Logging at appropriate levels
- [ ] No memory leaks (check with --inspect)
- [ ] Google APIs respond correctly
- [ ] Claude API summarization works
- [ ] Email delivery works (or logs correctly)
- [ ] Scheduler runs on interval
- [ ] Queue retries work
- [ ] Performance acceptable (<500ms for GET)

## Common Test Issues

### Issue: Google API initialization fails

**Cause**: Missing service account credentials

**Fix**:
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{...}'
npm run start:dev
```

### Issue: Claude API timeout

**Cause**: Anthropic API key invalid or rate limited

**Fix**:
```bash
# Verify key
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY"

# Check rate limits in logs
```

### Issue: Tests timeout

**Cause**: Async operations not awaited

**Fix**:
```typescript
// Add timeout
jest.setTimeout(10000);

// Or await all operations
await Promise.all([...])
```

---

**Test Suite Version**: 1.0  
**Last Updated**: July 23, 2024
