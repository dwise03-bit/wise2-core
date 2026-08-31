import { NextResponse } from 'next/server';
import { getHvacPublicUrl, getOAuthRedirectUri } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    hvacUrl: getHvacPublicUrl(),
    redirectUri: getOAuthRedirectUri('google'),
    demoMode: process.env.WISE_HVAC_DEMO_MODE === 'true',
    googleConfigured: Boolean(
      (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
        process.env.GOOGLE_CLIENT_SECRET,
    ),
    apiUrl: process.env.WISE2_API_URL || 'https://wise2.net/api',
  });
}
