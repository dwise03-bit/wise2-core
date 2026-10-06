import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'WISE² Email Master Reference Sheet',
  description: 'WISE² email account inventory and mail flow reference.',
  robots: { index: false, follow: false },
};

export default function EmailReferencePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>WISE² Email Master Reference Sheet</h1>
      <p className={styles.mobileHint}>Swipe sideways to view the full reference sheet.</p>
      <div className={styles.sheetScroller}>
        <figure className={styles.sheet}>
          <Image
            src="/email/wise2-email-master-reference.png"
            alt="WISE² Email Master Reference Sheet showing account addresses, ownership, status, domain information, integrations, recommended structure, and mail flow."
            width={1536}
            height={1024}
            priority
            unoptimized
          />
        </figure>
      </div>
    </main>
  );
}
