import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    version: '1.0.3',
    versionCode: 4,
    versionName: '1.0.3',
    downloadUrl: 'https://wise2.net/WISE-FieldTech-v1.0.3.apk',
    releaseNotes: 'WISE² HVAC Field Tech v1.0.3\n\n✅ Redesigned home screen with professional HUD aesthetic\n✅ Live Fieldpiece meters and charts\n✅ Today\'s calls panel\n✅ Quick actions grid\n✅ Offline sync support\n✅ AI diagnosis integration',
    releaseDate: '2026-08-25T00:00:00Z',
    mandatory: false,
  });
}
