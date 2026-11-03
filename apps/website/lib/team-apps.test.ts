import { TEAM_APPS, findTeamAppBuild, sanitizeTeamAppFilename, teamAppDownloadPath } from './team-apps';

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

  it('publishes command launcher metadata for every app', () => {
    expect(TEAM_APPS).toHaveLength(6);
    for (const app of TEAM_APPS) {
      expect(['live', 'beta', 'dev']).toContain(app.status);
      expect(app.category.length).toBeGreaterThan(0);
      expect(app.version.length).toBeGreaterThan(0);
    }
  });

  it('preserves the legacy workspace and download routes', () => {
    expect(TEAM_APPS.find((app) => app.id === 'fieldtech')?.webUrl).toBe('/fieldtech');
    expect(TEAM_APPS.find((app) => app.id === 'sound-labs')?.webUrl).toBe('/sound-labs');
    expect(TEAM_APPS.find((app) => app.id === 'wise2-xr')?.webUrl).toBe('/quest');
    expect(findTeamAppBuild('wise2-xr.apk')?.filename).toBe('wise2-xr.apk');
  });
});
