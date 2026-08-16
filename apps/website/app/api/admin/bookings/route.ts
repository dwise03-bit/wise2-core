import { NextRequest, NextResponse } from 'next/server';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consultantId: string;
  consultantName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /api/admin/bookings
 * Fetch all bookings for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    // TODO: Implement proper authentication check
    // const token = request.headers.get('authorization');
    // if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // In production, this would fetch from database
    // For now, return mock data structure
    const mockBookings: Booking[] = [
      {
        id: 'BK-001',
        userId: 'USR-001',
        userName: 'Sarah Chen',
        userEmail: 'sarah.chen@example.com',
        consultantId: 'CON-001',
        consultantName: 'Alex Morgan',
        serviceId: 'SVC-001',
        serviceName: 'Strategy Consultation',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        duration: 60,
        timezone: 'America/Los_Angeles',
        status: 'confirmed',
        price: 250,
        notes: 'Discussed product strategy for Q3',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'BK-002',
        userId: 'USR-002',
        userName: 'Michael Rodriguez',
        userEmail: 'michael.r@example.com',
        consultantId: 'CON-002',
        consultantName: 'Jordan Lee',
        serviceId: 'SVC-002',
        serviceName: 'Engineering Review',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00',
        duration: 90,
        timezone: 'America/New_York',
        status: 'pending',
        price: 300,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'BK-003',
        userId: 'USR-003',
        userName: 'Emma Watson',
        userEmail: 'emma.w@example.com',
        consultantId: 'CON-001',
        consultantName: 'Alex Morgan',
        serviceId: 'SVC-003',
        serviceName: 'Marketing Strategy',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        time: '15:30',
        duration: 60,
        timezone: 'Europe/London',
        status: 'completed',
        price: 250,
        notes: 'Campaign launch strategy reviewed',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'BK-004',
        userId: 'USR-004',
        userName: 'James Park',
        userEmail: 'james.park@example.com',
        consultantId: 'CON-003',
        consultantName: 'Casey Chen',
        serviceId: 'SVC-004',
        serviceName: 'Operations Optimization',
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        time: '11:00',
        duration: 120,
        timezone: 'America/Chicago',
        status: 'no-show',
        price: 400,
        notes: 'Client did not appear for scheduled call',
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        updatedAt: new Date(Date.now() - 345600000).toISOString(),
      },
      {
        id: 'BK-005',
        userId: 'USR-005',
        userName: 'Lisa Johnson',
        userEmail: 'lisa.j@example.com',
        consultantId: 'CON-002',
        consultantName: 'Jordan Lee',
        serviceId: 'SVC-001',
        serviceName: 'Strategy Consultation',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        timezone: 'America/Denver',
        status: 'confirmed',
        price: 250,
        notes: '',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'BK-006',
        userId: 'USR-006',
        userName: 'David Kim',
        userEmail: 'david.kim@example.com',
        consultantId: 'CON-001',
        consultantName: 'Alex Morgan',
        serviceId: 'SVC-002',
        serviceName: 'Engineering Review',
        date: new Date(Date.now() - 604800000).toISOString().split('T')[0],
        time: '13:00',
        duration: 90,
        timezone: 'America/Phoenix',
        status: 'completed',
        price: 300,
        notes: 'Code review and architecture discussion',
        createdAt: new Date(Date.now() - 691200000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ];

    // TODO: Replace with actual database query
    // const bookings = await db.booking.findMany({
    //   include: {
    //     user: true,
    //     consultant: true,
    //     service: true,
    //   },
    // });

    return NextResponse.json(
      {
        bookings: mockBookings,
        total: mockBookings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
