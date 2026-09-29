import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user token from headers
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verify token and fetch customer's orders from database
    // For now, return mock data
    return NextResponse.json({
      orders: [
        {
          id: '1',
          orderNumber: 'ORD-2026-001',
          status: 'SHIPPED',
          totalAmount: 45.99,
          createdAt: '2026-08-20',
          itemCount: 2,
        },
        {
          id: '2',
          orderNumber: 'ORD-2026-002',
          status: 'PROCESSING',
          totalAmount: 189.50,
          createdAt: '2026-08-22',
          itemCount: 5,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
