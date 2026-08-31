import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { filterDemoProducts } from '@/lib/demo-data';
import { useDemoData } from '@/lib/demo';
import { Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const occasion = searchParams.get('occasion');
  const search = searchParams.get('search');

  if (useDemoData()) {
    const data = filterDemoProducts({ category, occasion, search });
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      demo: true,
    });
  }

  try {
    let queryText = 'SELECT * FROM products WHERE in_stock = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      queryText += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (occasion) {
      queryText += ` AND LOWER(occasion) = LOWER($${paramIndex})`;
      params.push(occasion);
      paramIndex++;
    }

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
    const data = filterDemoProducts({ category, occasion, search });
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      demo: true,
      fallback: true,
    });
  }
}
