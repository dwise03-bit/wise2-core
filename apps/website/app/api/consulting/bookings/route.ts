import { NextResponse } from 'next/server';

export async function GET() {
  const bookings = [
    {
      id: 'booking-001',
      serviceId: 'strategy-001',
      serviceName: 'AI Strategy & Roadmap',
      consultantId: 'c1',
      consultantName: 'Daniel Wise',
      startTime: '2026-07-28T10:00:00Z',
      endTime: '2026-07-28T12:00:00Z',
      duration: 120,
      totalPrice: 5000,
      status: 'scheduled',
      meetingType: 'video',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Initial strategy consultation',
      createdAt: '2026-07-24T09:00:00Z',
    },
    {
      id: 'booking-002',
      serviceId: 'automation-002',
      serviceName: 'Automation Workflow Design',
      consultantId: 'c2',
      consultantName: 'Sarah Chen',
      startTime: '2026-07-29T14:00:00Z',
      endTime: '2026-07-29T15:30:00Z',
      duration: 90,
      totalPrice: 3500,
      status: 'scheduled',
      meetingType: 'video',
      meetingLink: 'https://meet.google.com/klm-nopq-rst',
      notes: 'Workflow design session',
      createdAt: '2026-07-24T10:30:00Z',
    },
  ];

  return NextResponse.json({
    bookings,
    total: bookings.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newBooking = {
    id: `booking-${Date.now()}`,
    serviceId: body.serviceId,
    serviceName: body.serviceName,
    consultantId: body.consultantId,
    consultantName: body.consultantName,
    startTime: body.startTime,
    endTime: body.endTime,
    duration: body.duration,
    totalPrice: body.totalPrice,
    status: 'scheduled' as const,
    meetingType: body.meetingType || 'video',
    meetingLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 11)}`,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      booking: newBooking,
      message: 'Booking created successfully',
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}
