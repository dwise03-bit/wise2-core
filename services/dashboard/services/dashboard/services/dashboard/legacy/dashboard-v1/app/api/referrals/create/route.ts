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

    const referralCode = `REF-${payload.userId}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    await query(
      `INSERT INTO referrals (referrer_id, referral_code, status, commission_rate, created_at)
       VALUES ($1, $2, 'active', 0.20, NOW())`,
      [payload.userId, referralCode]
    );

    const userResult = await query('SELECT email FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0];

    return NextResponse.json({
      success: true,
      referral: {
        code: referralCode,
        shareUrl: `https://wise2.net?ref=${referralCode}`,
        shareText: `Join me at Wise Defense - ${20}% commission on referrals!`,
        email: user.email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT r.referral_code, r.status, COUNT(DISTINCT ru.id) as referral_count,
              SUM(CASE WHEN m.tier != 'free' THEN 1 ELSE 0 END) as paid_referrals,
              SUM(COALESCE(m.price_cents, 0)) * 0.20 / 100 as earnings
       FROM referrals r
       LEFT JOIN users ru ON ru.referral_code = r.referral_code
       LEFT JOIN memberships m ON ru.id = m.user_id
       WHERE r.referrer_id = $1
       GROUP BY r.referral_code, r.status`,
      [payload.userId]
    );

    return NextResponse.json({
      referrals: result.rows[0] || {
        referral_code: null,
        referral_count: 0,
        paid_referrals: 0,
        earnings: 0
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
