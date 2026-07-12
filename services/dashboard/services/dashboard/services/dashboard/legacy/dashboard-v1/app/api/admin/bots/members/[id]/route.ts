import { query } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return Response.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pathname = new URL(request.url).pathname;

    if (pathname.includes('/approve')) {
      await query('UPDATE users SET is_active = true WHERE id = $1', [id]);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in member handler:', error);
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
