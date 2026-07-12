import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (for now, just allow authenticated users)
    const body = await request.json();
    const { platform, message, recipient } = body;

    if (!platform || !message) {
      return NextResponse.json(
        { error: 'Platform and message are required' },
        { status: 400 }
      );
    }

    if (!['discord', 'telegram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Platform must be discord or telegram' },
        { status: 400 }
      );
    }

    // Log the message to database
    const result = await query(
      `INSERT INTO admin_bot_commands (admin_id, platform, message, recipient, status, created_at)
       VALUES ($1, $2, $3, $4, 'sent', NOW())
       RETURNING id, platform, status, created_at`,
      [payload.userId, platform, message, recipient || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Message sent to ${platform}`,
        command: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bot send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
