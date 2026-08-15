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
    const { drill_id, score, certificate_type } = body;

    const userResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0];

    const drillResult = await query('SELECT title FROM content WHERE id = $1', [drill_id]);
    const drill = drillResult.rows[0];

    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const issueDate = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO certificates (user_id, drill_id, certificate_id, type, score, issue_date, pdf_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        payload.userId,
        drill_id,
        certificateId,
        certificate_type || 'completion',
        score || 0,
        issueDate,
        `/certificates/${certificateId}.pdf`
      ]
    );

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificateId,
        studentName: `${user.first_name} ${user.last_name}`,
        drillTitle: drill.title,
        score,
        issueDate,
        shareUrl: `/share/certificate/${certificateId}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
