import { query } from '@/lib/db';

export async function POST(request: Request) {
  const { content, platforms, scheduledTime } = await request.json();

  if (!content || !platforms?.length || !scheduledTime) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await query(
      `INSERT INTO bot_scheduled_posts (content, platforms, scheduled_time, status)
       VALUES ($1, $2, $3, 'pending')`,
      [content, JSON.stringify(platforms), new Date(scheduledTime)]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error scheduling:', error);
    return Response.json({ error: 'Failed to schedule announcement' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM bot_scheduled_posts WHERE status = 'pending' ORDER BY scheduled_time ASC LIMIT 20`
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return Response.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}
