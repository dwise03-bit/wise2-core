import { access, stat } from 'node:fs/promises';
import path from 'node:path';

const TEAM_APPS_DIR = path.join(process.cwd(), 'public', 'team-apps');

export async function listPublishedTeamAppFiles(): Promise<Record<string, { size: number; updatedAt: string }>> {
  const result: Record<string, { size: number; updatedAt: string }> = {};
  const { readdir } = await import('node:fs/promises');
  try {
    for (const filename of await readdir(TEAM_APPS_DIR)) {
      const file = await getTeamAppFileInfo(filename);
      if (file) result[filename] = { size: file.size, updatedAt: (await stat(file.path)).mtime.toISOString() };
    }
  } catch {
    return result;
  }
  return result;
}

export async function getTeamAppFileInfo(filename: string): Promise<{
  path: string;
  size: number;
} | null> {
  const filePath = path.join(TEAM_APPS_DIR, filename);
  try {
    await access(filePath);
    const metadata = await stat(filePath);
    return metadata.isFile() ? { path: filePath, size: metadata.size } : null;
  } catch {
    return null;
  }
}
