import { NextResponse } from 'next/server';
import { TEAM_APPS, teamAppDownloadPath } from '@/lib/team-apps';
import { listPublishedTeamAppFiles } from '@/lib/team-apps-fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const published = await listPublishedTeamAppFiles();

  return NextResponse.json({
    sidestoreUrl: 'https://sidestore.io',
    supportUrl: 'https://wise2.net/support',
    discordUrl: 'https://discord.gg/wise2',
    apps: TEAM_APPS.map((app) => ({
      ...app,
      builds: app.builds.map((build) => {
        const file = published[build.filename];
        return {
          ...build,
          url: teamAppDownloadPath(build.filename),
          available: Boolean(file),
          size: file?.size ?? null,
          updatedAt: file?.updatedAt ?? null,
        };
      }),
    })),
  });
}
