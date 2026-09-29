import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = 'PS';
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.orderType = type;

    // TODO: Connect to Prisma when database is available
    return NextResponse.json({
      orders: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      filters: { status, type },
    });
  } catch (error) {
    console.error('PrintShop orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      customerPhone,
      orderType,
      items,
      shippingAddress,
      isLocalPickup,
      rushOrder,
      notes,
    } = body;

    if (!customerEmail || !customerName || !orderType) {
      return NextResponse.json(
        { error: 'customerEmail, customerName, and orderType are required' },
        { status: 400 },
      );
    }

    const validTypes = ['THREE_D_PRINT', 'DTF_TRANSFER', 'DTF_GANG_SHEET', 'APPAREL', 'BUNDLE', 'DESIGN_SERVICE'];
    if (!validTypes.includes(orderType)) {
      return NextResponse.json(
        { error: `Invalid orderType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    const orderNumber = generateOrderNumber();

    const order = {
      id: `temp-${Date.now()}`,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone: customerPhone || null,
      orderType,
      status: 'DRAFT',
      subtotal: 0,
      taxAmount: 0,
      shippingCost: 0,
      rushFee: 0,
      discountAmount: 0,
      totalPrice: 0,
      paymentStatus: 'unpaid',
      shippingAddress: shippingAddress || null,
      isLocalPickup: isLocalPickup || false,
      rushOrder: rushOrder || false,
      productionNotes: notes || null,
      items: items || [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('PrintShop orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
