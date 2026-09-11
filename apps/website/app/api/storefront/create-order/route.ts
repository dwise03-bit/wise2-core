export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerEmail, totalPrice, customer } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerEmail) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Forward to admin backend API
    const response = await fetch('http://localhost:3014/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        customerEmail,
        totalPrice,
        customer,
      }),
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to create order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
