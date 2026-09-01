import { access, stat } from 'node:fs/promises';
import path from 'node:path';

const TEAM_APPS_DIR = path.join(process.cwd(), 'public', 'team-apps');

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
