import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // APK manifest with download links
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

  // If requesting specific app
  if (pathname.includes('/apks/manifest')) {
    return NextResponse.json(APK_MANIFEST);
  }

  if (pathname.includes('/apks/quest')) {
    return NextResponse.json({
      ...APK_MANIFEST.apps[0],
      downloadUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/apks/downloads/wise2-xr-1.1.0.apk`,
    });
  }

  if (pathname.includes('/apks/rayban')) {
    return NextResponse.json({
      ...APK_MANIFEST.apps[1],
      downloadUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/apks/downloads/wise2-rayban-2.0.1.apk`,
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
