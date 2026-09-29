import type { Metadata } from 'next';
import { TEAM_APPS, teamAppDownloadPath } from '@/lib/team-apps';
import { listPublishedTeamAppFiles } from '@/lib/team-apps-fs';
import { TeamInstall } from './TeamInstall';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Team App Install | WISE²',
  description:
    'Download WISE² iPhone and Android apps for the team. Install wirelessly with SideStore. No App Store listing required.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://wise2.net/support',
  },
};

export default async function SupportPage() {
  const published = await listPublishedTeamAppFiles();
  const apps = TEAM_APPS.map((app) => ({
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
  }));

  return <TeamInstall apps={apps} />;
}
