import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const apkPath = path.join(
      process.cwd(),
      'public',
      'downloads',
      'WISE-FieldTech-latest.apk',
    );
    const apk = await readFile(apkPath);

    return new NextResponse(apk, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="WISE-FieldTech.apk"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Field Tech APK is not available' }, { status: 404 });
  }
}
