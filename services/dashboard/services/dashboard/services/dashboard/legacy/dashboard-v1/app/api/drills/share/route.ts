import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { drill_id, score, platform } = body;

    const drillResult = await query('SELECT title FROM content WHERE id = $1', [drill_id]);
    const drill = drillResult.rows[0];

    const userResult = await query('SELECT first_name FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0];

    const shareId = `SHARE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    await query(
      `INSERT INTO social_media_shares (user_id, platform, title, text, shared_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        payload.userId,
        platform || 'twitter',
        drill.title,
        `I just scored ${score}% on "${drill.title}" with Wise Defense! 🎯 Join me at wise2.net`
      ]
    );

    const shareText = `I just scored ${score}% on "${drill.title}" with Wise Defense! 🎯 Join me!`;
    const shareUrl = `https://wise2.net/share/${shareId}`;

    return NextResponse.json({
      success: true,
      share: {
        id: shareId,
        text: shareText,
        url: shareUrl,
        twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`,
        linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Drill share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
