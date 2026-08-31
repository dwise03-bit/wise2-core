const ALLOWED_EXTENSIONS = new Set(['.apk', '.ipa', '.zip']);

export function sanitizeTeamAppFilename(filename: string): string | null {
  const safe = filename.trim();
  if (!safe || safe !== safe.split('/').pop() || safe !== safe.split('\\').pop()) {
    return null;
  }

  const extension = safe.slice(safe.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) ? safe : null;
}

export function mimeForTeamAppFile(filename: string): string {
  switch (filename.slice(filename.lastIndexOf('.')).toLowerCase()) {
    case '.apk':
      return 'application/vnd.android.package-archive';
    case '.ipa':
      return 'application/octet-stream';
    default:
      return 'application/zip';
  }
}
