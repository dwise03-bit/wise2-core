import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const INITIAL_CATEGORIES = [
  {
    id: 'cat-3d-packout',
    slug: 'packout-accessories',
    name: 'Packout Accessories',
    description: 'Custom 3D-printed accessories for Milwaukee Packout systems',
    productType: 'THREE_D_PRINT',
  },
  {
    id: 'cat-3d-mounts',
    slug: 'monitor-stands-mounts',
    name: 'Monitor Stands & Mounts',
    description: 'Custom monitor stands, router mounts, and device holders',
    productType: 'THREE_D_PRINT',
  },
  {
    id: 'cat-3d-custom',
    slug: 'custom-3d-printing',
    name: 'Custom 3D Printing',
    description: 'Upload your files for custom 3D printing service',
    productType: 'THREE_D_PRINT',
  },
  {
    id: 'cat-dtf-transfers',
    slug: 'dtf-transfers',
    name: 'DTF Transfers',
    description: 'Direct-to-film heat transfers for apparel and merchandise',
    productType: 'DTF_TRANSFER',
  },
  {
    id: 'cat-dtf-gang',
    slug: 'gang-sheets',
    name: 'Gang Sheets',
    description: 'Multi-design gang sheets for bulk DTF production',
    productType: 'DTF_GANG_SHEET',
  },
  {
    id: 'cat-apparel',
    slug: 'apparel',
    name: 'Apparel & Merchandise',
    description: 'Custom branded apparel with DTF transfers applied',
    productType: 'APPAREL',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active') !== 'false';

    return NextResponse.json({
      products: [],
      categories: INITIAL_CATEGORIES,
      filters: { category, type, featured, active },
    });
  } catch (error) {
    console.error('PrintShop products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, productType, categoryId, basePrice, materials, colors, estimatedDays } = body;

    if (!name || !description || !productType) {
      return NextResponse.json(
        { error: 'name, description, and productType are required' },
        { status: 400 },
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const product = {
      id: `temp-${Date.now()}`,
      slug,
      name,
      description,
      productType,
      categoryId: categoryId || null,
      basePrice: basePrice || 0,
      materials: materials || [],
      colors: colors || [],
      estimatedDays: estimatedDays || 5,
      isActive: true,
      isFeatured: false,
      isMadeToOrder: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('PrintShop products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
