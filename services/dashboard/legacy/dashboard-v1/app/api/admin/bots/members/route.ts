import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all';

  try {
    let queryText = `
      SELECT id, email, first_name as name, tier, is_active
      FROM users
      WHERE (first_name ILIKE $1 OR email ILIKE $1)
    `;

    const params: any[] = [`%${search}%`];

    if (filter === 'active') {
      queryText += ` AND is_active = true`;
    } else if (filter === 'inactive') {
      queryText += ` AND is_active = false`;
    }

    queryText += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await query(queryText, params);
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    return Response.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
