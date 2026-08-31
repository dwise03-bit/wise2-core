import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { sanitizeTeamAppFilename, TEAM_APPS } from './team-apps';

export interface TeamAppFileInfo {
  filename: string;
  path: string;
  size: number;
  updatedAt: string;
}

export function teamAppsDirectories(): string[] {
  return [
    process.env.TEAM_APPS_DIR,
    path.join(process.cwd(), 'public', 'downloads', 'apps'),
    '/var/www/html/downloads/apps',
    '/var/www/wise2-downloads/apps',
  ].filter((dir): dir is string => Boolean(dir));
}

export function resolveTeamAppFile(filename: string): string | null {
  const safe = sanitizeTeamAppFilename(filename);
  if (!safe) return null;

  const candidates = [
    ...teamAppsDirectories().map((dir) => path.resolve(dir, safe)),
    ...fieldTechApkFallbacks(safe),
  ];

  for (const fullPath of candidates) {
    if (existsSync(fullPath)) return fullPath;
  }

  return null;
}

function fieldTechApkFallbacks(filename: string): string[] {
  if (filename !== 'fieldtech.apk') return [];
  return [
    path.resolve(process.cwd(), '..', 'wise-hvac-demo', 'public', 'downloads', 'WISE-FieldTech-latest.apk'),
    path.resolve(process.cwd(), '..', '..', 'apps', 'wise-hvac-demo', 'public', 'downloads', 'WISE-FieldTech-latest.apk'),
  ];
}

export async function getTeamAppFileInfo(filename: string): Promise<TeamAppFileInfo | null> {
  const filePath = resolveTeamAppFile(filename);
  if (!filePath) return null;

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    return {
      filename: sanitizeTeamAppFilename(filename) as string,
      path: filePath,
      size: info.size,
      updatedAt: info.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function listPublishedTeamAppFiles(): Promise<Record<string, TeamAppFileInfo>> {
  const files: Record<string, TeamAppFileInfo> = {};
  const names = TEAM_APPS.flatMap((app) => app.builds.map((build) => build.filename));

  await Promise.all(
    names.map(async (filename) => {
      const info = await getTeamAppFileInfo(filename);
      if (info) files[filename] = info;
    }),
  );

  return files;
}
