const ALLOWED_EXTENSIONS = new Set(['.apk', '.ipa', '.zip']);

export type TeamAppPlatform = 'ios' | 'android';
export type TeamAppStatus = 'live' | 'beta' | 'dev';

export interface TeamAppBuild {
  platform: TeamAppPlatform;
  filename: string;
  label: string;
  minOs: string;
}

export interface TeamApp {
  id: string;
  name: string;
  tagline: string;
  status: TeamAppStatus;
  category: string;
  version: string;
  webUrl?: string;
  commandUrl?: string;
  builds: TeamAppBuild[];
}

export const TEAM_APPS_PUBLIC_PATH = '/downloads/apps';

export const TEAM_APPS: TeamApp[] = [
  { id: 'wise2', name: 'WISE² Business Controller', tagline: 'Command center for revenue, CRM, work, and AI agents.', status: 'live', category: 'Business OS', version: '2026.09', webUrl: 'https://wise2.net', commandUrl: '/platform', builds: [{ platform: 'ios', filename: 'wise2.ipa', label: 'Download iPhone app', minOs: 'iOS 17+' }] },
  { id: 'cherry-count', name: 'Cherry Count', tagline: 'Pop-up retail OS for counts, sales, and floor ops.', status: 'live', category: 'Client App', version: '2026.09', webUrl: 'https://wise2.net/cherry-count/dashboard', builds: [{ platform: 'ios', filename: 'cherry-count.ipa', label: 'Download iPhone app', minOs: 'iOS 14+' }] },
  { id: 'fergies-table', name: "Fergie's Table", tagline: 'Kitchen, bookings, catering, and guest flow.', status: 'live', category: 'Client App', version: '2026.09', webUrl: 'https://wise2.net/fergies-table/business', builds: [{ platform: 'ios', filename: 'fergies-table.ipa', label: 'Download iPhone app', minOs: 'iOS 14+' }] },
  { id: 'fieldtech', name: 'WISE² Field Tech', tagline: 'Jobsite diagnostics, equipment records, and field photos.', status: 'beta', category: 'Field Operations', version: '2026.09', webUrl: '/fieldtech', commandUrl: '/fieldtech', builds: [{ platform: 'ios', filename: 'fieldtech.ipa', label: 'Download iPhone app', minOs: 'iOS 14+' }, { platform: 'android', filename: 'fieldtech.apk', label: 'Download Android app', minOs: 'Android 10+' }] },  { id: 'sound-labs', name: 'WISE² Sound Labs', tagline: 'Mikro controller, REAPER studio, WISE² GPT, and live collaboration.', status: 'beta', category: 'Creative Studio', version: '2026.09', webUrl: '/sound-labs', commandUrl: '/sound-labs', builds: [{ platform: 'android', filename: 'sound-labs.apk', label: 'Download Sound Labs APK', minOs: 'Android 10+' }] },
  { id: 'wise2-xr', name: 'WISE² XR Command Center', tagline: 'Immersive Quest command room for connected WISE² systems.', status: 'dev', category: 'Spatial Computing', version: '2026.09', webUrl: '/quest', commandUrl: '/quest', builds: [{ platform: 'android', filename: 'wise2-xr.apk', label: 'Download Quest APK', minOs: 'Meta Quest 3 / 3S' }] },
];

export function teamAppDownloadPath(filename: string): string {
  return `${TEAM_APPS_PUBLIC_PATH}/${filename}`;
}

export function findTeamAppBuild(filename: string): TeamAppBuild | undefined {
  const safe = sanitizeTeamAppFilename(filename);
  return safe ? TEAM_APPS.flatMap((app) => app.builds).find((build) => build.filename === safe) : undefined;
}

export function sanitizeTeamAppFilename(filename: string): string | null {
  const safe = filename.trim();
  if (!safe || safe !== safe.split('/').pop() || safe !== safe.split('\\').pop()) return null;
  const extension = safe.slice(safe.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) ? safe : null;
}

export function mimeForTeamAppFile(filename: string): string {
  switch (filename.slice(filename.lastIndexOf('.')).toLowerCase()) {
    case '.apk': return 'application/vnd.android.package-archive';
    case '.ipa': return 'application/octet-stream';
    default: return 'application/zip';
  }
}
