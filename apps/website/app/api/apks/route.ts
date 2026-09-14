import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  const APK_MANIFEST = {
    apps: [
      {
        id: 'wise2-quest-xr',
        name: 'WISE² XR Command Center',
        version: '1.1.0',
        platform: 'meta-quest-3s',
        size: '385MB',
        buildDate: new Date().toISOString(),
        url: '/apks/downloads/wise2-xr-1.1.0.apk',
        changelog: ['Hand tracking improvements', 'UI refinements', 'Performance optimization'],
      },
      {
        id: 'wise2-rayban',
        name: 'WISE² Ray-Ban Companion',
        version: '2.0.1',
        platform: 'rayban-meta',
        size: '156MB',
        buildDate: new Date().toISOString(),
        url: '/apks/downloads/wise2-rayban-2.0.1.apk',
        changelog: ['Camera feed optimization', 'AI features enhanced', 'Battery life improved'],
      },
    ],
    lastUpdated: new Date().toISOString(),
    totalDownloads: 1247,
  };

  if (type === 'quest') {
    return NextResponse.json(APK_MANIFEST.apps[0]);
  }

  if (type === 'rayban') {
    return NextResponse.json(APK_MANIFEST.apps[1]);
  }

  return NextResponse.json(APK_MANIFEST);
}
