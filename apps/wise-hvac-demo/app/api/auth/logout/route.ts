import { NextResponse } from 'next/server';
import { clearAuthCookies, getHvacAppUrl } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const response = NextResponse.redirect(getHvacAppUrl('/signin'));
  clearAuthCookies(response);
  return response;
}
