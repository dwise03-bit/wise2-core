import { findTeamAppBuild, sanitizeTeamAppFilename, teamAppDownloadPath } from './team-apps';

describe('team-apps', () => {
  it('accepts published ipa and apk names', () => {
    expect(sanitizeTeamAppFilename('wise2.ipa')).toBe('wise2.ipa');
    expect(sanitizeTeamAppFilename('fieldtech.apk')).toBe('fieldtech.apk');
  });

  it('rejects path traversal and unknown extensions', () => {
    expect(sanitizeTeamAppFilename('../wise2.ipa')).toBeNull();
    expect(sanitizeTeamAppFilename('wise2.exe')).toBeNull();
    expect(sanitizeTeamAppFilename('foo/bar.ipa')).toBeNull();
  });

  it('maps catalog files to public download paths', () => {
    expect(teamAppDownloadPath('cherry-count.ipa')).toBe('/downloads/apps/cherry-count.ipa');
    expect(findTeamAppBuild('fergies-table.ipa')?.platform).toBe('ios');
  });
});
