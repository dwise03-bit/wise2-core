import { NextRequest, NextResponse } from 'next/server';

const mockProducts: Record<number, any> = {
  1: {
    id: 1,
    name: 'Personalized Drink Labels',
    price: 24.99,
    category: 'Labels',
    occasion: 'Birthday',
    image: '🥤',
    description: 'Custom drink labels for any celebration',
    details: 'High-quality, waterproof labels perfect for beverages at any party',
  },
  2: {
    id: 2,
    name: 'Chip Bags & Candy Wrappers',
    price: 19.99,
    category: 'Wrappers',
    occasion: 'Birthday',
    image: '🍿',
    description: 'Personalized snack packaging',
    details: 'Custom wrappers for snacks and candy',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = mockProducts[parseInt(id)];

  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: product,
  });
}
