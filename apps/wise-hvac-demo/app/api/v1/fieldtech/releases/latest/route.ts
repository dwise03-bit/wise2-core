import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0.3',
    versionCode: 4,
    versionName: '1.0.3',
    apkUrl: 'https://wise2.net/wise-hvac-demo/download',
    sha256: '6c166ffcee1e291a731f4ad10fc08acf2cf146710b3281c7b965de8f1c030306',
    required: false,
    releaseNotes: 'Demo version with auto-login enabled',
  });
}
