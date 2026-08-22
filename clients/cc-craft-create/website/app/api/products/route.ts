import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const occasion = searchParams.get('occasion');
    const search = searchParams.get('search');

    let queryText = 'SELECT * FROM products WHERE in_stock = true';
    const params: any[] = [];
    let paramIndex = 1;

    // Add category filter
    if (category) {
      queryText += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    // Add occasion filter
    if (occasion) {
      queryText += ` AND LOWER(occasion) = LOWER($${paramIndex})`;
      params.push(occasion);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      queryText += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    queryText += ' ORDER BY name ASC';

    const result = await query<Product>(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
