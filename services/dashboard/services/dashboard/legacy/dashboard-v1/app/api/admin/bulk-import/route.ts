import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

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
    const { students, tier = 'free' } = body;

    if (!Array.isArray(students)) {
      return NextResponse.json({ error: 'Students must be an array' }, { status: 400 });
    }

    const results = {
      created: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    for (const student of students) {
      try {
        const { email, first_name, last_name, experience_level } = student;

        if (!email || !first_name || !last_name) {
          results.errors.push(`Row missing required fields: ${JSON.stringify(student)}`);
          continue;
        }

        // Check if user exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
          results.warnings.push(`User ${email} already exists, skipped`);
          continue;
        }

        // Create user with temporary password
        const tempPassword = Math.random().toString(36).substr(2, 12);
        const hashedPassword = await hashPassword(tempPassword);

        const userResult = await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, experience_level, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [email, hashedPassword, first_name, last_name, experience_level || 'beginner']
        );

        const userId = userResult.rows[0].id;

        // Create membership
        await query(
          `INSERT INTO memberships (user_id, tier, status, billing_cycle)
           VALUES ($1, $2, 'active', 'monthly')`,
          [userId, tier]
        );

        results.created++;
      } catch (error) {
        results.errors.push(`Error importing ${student.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
