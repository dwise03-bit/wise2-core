import styles from './fieldtech.module.css';

export const metadata = {
  title: 'WISE² Field Tech — Android App',
  description: 'Private technician download for the WISE² Field Tech Android app.',
  robots: { index: false, follow: false },
};

interface ReleaseInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  sha256: string;
  required: boolean;
  releaseNotes: string;
}

async function getLatestRelease(): Promise<ReleaseInfo | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/v1/fieldtech/releases/latest`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ReleaseInfo;
  } catch {
    return null;
  }
}

export default async function FieldTechDownloadPage() {
  const release = await getLatestRelease();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>WISE² · PRIVATE TECHNICIAN PORTAL</p>
        <h1 className={styles.title}>
          WISE<sup>2</sup> FIELD TECH
        </h1>
        <p className={styles.tagline}>EVERY JOB. EVERY TOOL. EVERY TIME. ALL IN YOUR HAND.</p>

        {release ? (
          <>
            <div className={styles.versionRow}>
              <span className={styles.versionLabel}>Current version</span>
              <span className={styles.versionValue}>v{release.versionName}</span>
            </div>
            {release.releaseNotes && (
              <div className={styles.notes}>
                <h2>Release notes</h2>
                <p>{release.releaseNotes}</p>
              </div>
            )}
            <a className={styles.downloadButton} href={release.apkUrl}>
              DOWNLOAD ANDROID APP
            </a>
            <p className={styles.hash}>SHA-256: {release.sha256}</p>
          </>
        ) : (
          <div className={styles.notes}>
            <p>No release is published yet. Check back soon, or contact your WISE² administrator.</p>
          </div>
        )}

        <div className={styles.requirements}>
          <h2>Requirements</h2>
          <ul>
            <li>Android 8.0 (API 26) or newer</li>
            <li>"Install unknown apps" permission granted for your browser or file manager (this is not a Play Store app)</li>
            <li>Bluetooth and camera permissions for live readings and photo capture</li>
          </ul>
        </div>

        <div className={styles.instructions}>
          <h2>Installation</h2>
          <ol>
            <li>Tap "Download Android App" above on your device.</li>
            <li>Open the downloaded WISE2-FieldTech APK from your notifications or Downloads folder.</li>
            <li>If prompted, allow installs from this source — this is a one-time setting per browser/file app.</li>
            <li>Tap Install, then open WISE² Field Tech and log in with your WISE² account.</li>
          </ol>
          <p className={styles.note}>
            This app is distributed privately and is not listed on Google Play. The app verifies the
            SHA-256 of every update it downloads before installing.
          </p>
        </div>
      </div>
    </main>
  );
}
